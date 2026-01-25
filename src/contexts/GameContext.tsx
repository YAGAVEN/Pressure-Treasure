import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Room, Player, Admin, RoomStatus, HouseTheme, CHALLENGES } from '@/types/game';
import { generateRoomCode, generateId, calculateProgress } from '@/lib/gameUtils';
import { supabase } from '@/lib/supabase';
import * as roomService from '@/lib/roomService';
import * as playerService from '@/lib/playerService';

interface GameContextType {
  // Admin State
  admin: Admin | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminSignup: (email: string, password: string, displayName: string) => Promise<boolean>;
  adminLogout: () => void;
  setAdmin: (admin: Admin | null) => void;
  
  // Room Management
  rooms: Room[];
  createRoom: (name: string, description: string, houseTheme: HouseTheme, timerDuration: number) => Room;
  deleteRoom: (roomId: string) => void;
  getRoom: (roomCode: string) => Room | undefined;
  getRoomById: (roomId: string) => Room | undefined;
  
  // Game Controls
  startGame: (roomId: string) => void;
  endGame: (roomId: string) => void;
  resetGame: (roomId: string) => void;
  
  // Player Management
  currentPlayer: Player | null;
  joinRoom: (roomCode: string, username: string) => Player | null;
  leaveRoom: () => void;
  getPlayersInRoom: (roomCode: string) => Player[];
  kickPlayer: (playerId: string) => void;
  syncPlayersForRoom: (roomCode: string, newPlayers: Player[]) => void;
  
  // Challenge Progress
  completeChallenge: (challengeId: number) => void;
  
  // Timer
  activeTimers: Record<string, number>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'got_treasure_hunt_admin';
const ROOMS_STORAGE_KEY = 'got_treasure_hunt_rooms';
const PLAYERS_STORAGE_KEY = 'got_treasure_hunt_players';
const CURRENT_PLAYER_KEY = 'got_treasure_hunt_current_player';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  
  const [rooms, setRooms] = useState<Room[]>(() => {
    const stored = localStorage.getItem(ROOMS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  
  const [players, setPlayers] = useState<Player[]>(() => {
    const stored = localStorage.getItem(PLAYERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(() => {
    const stored = localStorage.getItem(CURRENT_PLAYER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});
  const timerIntervals = useRef<Record<string, NodeJS.Timeout>>({});

  // Persist to localStorage
  useEffect(() => {
    if (admin) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [admin]);

  useEffect(() => {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    if (currentPlayer) {
      localStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(currentPlayer));
    } else {
      localStorage.removeItem(CURRENT_PLAYER_KEY);
    }
  }, [currentPlayer]);

  // Admin Authentication
  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[LOGIN] Starting with email:', email);
      
      // First try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[LOGIN] Supabase Auth result:', { data, error });

      if (!error && data.user) {
        const adminData: Admin = {
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.display_name || 'Admin',
        };
        setAdmin(adminData);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
        console.log('[LOGIN] Success with Supabase Auth');
        return true;
      }

      // Fallback: check admin_profiles table (without .single() to avoid errors)
      console.log('[LOGIN] Trying database fallback');
      const { data: profiles, error: profileError } = await supabase
        .from('admin_profiles')
        .select('id, email, password_hash')
        .eq('email', email);

      console.log('[LOGIN] Database query result:', { profiles, profileError });

      if (profileError || !profiles || profiles.length === 0) {
        console.error('[LOGIN] Profile not found:', profileError);
        return false;
      }

      const profile = profiles[0];
      console.log('[LOGIN] Found profile:', profile);

      // Simple password check (in production, use proper hashing)
      if (profile.password_hash === password) {
        const adminData: Admin = {
          id: profile.id,
          email: profile.email,
          displayName: 'Admin',
        };
        setAdmin(adminData);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
        console.log('[LOGIN] Success with database auth');
        return true;
      }

      console.log('[LOGIN] Password mismatch');
      return false;
    } catch (err) {
      console.error('[LOGIN] Unexpected error:', err);
      return false;
    }
  }, []);

  const adminSignup = useCallback(async (email: string, password: string, displayName: string): Promise<boolean> => {
    try {
      console.log('Starting signup process for:', email);
      
      // Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('email', email);

      console.log('Email check result:', { existing, checkError });

      if (!checkError && existing && existing.length > 0) {
        console.error('Email already exists');
        return false;
      }

      // Create new admin profile
      console.log('Inserting new admin with email:', email);
      const { data: newAdmin, error: insertError } = await supabase
        .from('admin_profiles')
        .insert({
          email,
          password_hash: password,
        })
        .select()
        .single();

      console.log('Insert result:', { newAdmin, insertError });

      if (insertError) {
        console.error('Signup error:', insertError);
        return false;
      }

      if (!newAdmin || !newAdmin.id) {
        console.error('No admin data returned after insert');
        return false;
      }

      const adminData: Admin = {
        id: newAdmin.id,
        email: newAdmin.email || email,
        displayName,
      };
      
      console.log('Setting admin data:', adminData);
      setAdmin(adminData);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
      console.log('Signup successful!');
      return true;
    } catch (err) {
      console.error('Unexpected signup error:', err);
      return false;
    }
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut().catch(() => {
        // Ignore if no Supabase auth session
      });
      setAdmin(null);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (err) {
      console.error('Logout error:', err);
      setAdmin(null);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, []);

  // Room Management
  const createRoom = useCallback((name: string, description: string, houseTheme: HouseTheme, timerDuration: number): Room => {
    const room: Room = {
      id: generateId(),
      code: generateRoomCode(),
      name,
      description,
      houseTheme,
      timerDuration,
      timerRemaining: timerDuration,
      status: 'waiting',
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,
      winnerId: null,
      adminId: admin?.id || '',
    };
    
    console.log('[GAMECONTEXT] Creating room:', room);
    setRooms(prev => [...prev, room]);
    
    // Also save to Supabase if authenticated - pass the code to ensure consistency
    if (admin?.id) {
      roomService.createRoomInDB(
        admin.id,
        name,
        description,
        houseTheme,
        timerDuration,
        room.code  // Pass the generated code
      ).catch(err => console.error('[GAMECONTEXT] Failed to save room to Supabase:', err));
    }
    
    return room;
  }, [admin]);

  const deleteRoom = useCallback((roomId: string) => {
    // Clear any running timer
    if (timerIntervals.current[roomId]) {
      clearInterval(timerIntervals.current[roomId]);
      delete timerIntervals.current[roomId];
    }
    
    setRooms(prev => prev.filter(r => r.id !== roomId));
    setPlayers(prev => prev.filter(p => {
      const room = rooms.find(r => r.id === roomId);
      return room ? p.roomCode !== room.code : true;
    }));
    
    // Also delete from Supabase
    roomService.deleteRoomFromDB(roomId).catch(err => 
      console.error('Failed to delete room from Supabase:', err)
    );
  }, [rooms]);

  const getRoom = useCallback((roomCode: string) => {
    return rooms.find(r => r.code === roomCode);
  }, [rooms]);

  const getRoomById = useCallback((roomId: string) => {
    return rooms.find(r => r.id === roomId);
  }, [rooms]);

  // Game Controls
  const startGame = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    console.log('[GAMECONTEXT] Starting game for room:', room.code);

    // Update Supabase status to playing
    roomService.updateRoomStatus(room.code, 'playing');
    roomService.updateRoomTimer(room.code, room.timerDuration);

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          status: 'playing' as RoomStatus,
          startedAt: Date.now(),
          timerRemaining: r.timerDuration,
        };
      }
      return r;
    }));

    // Start timer - use a ref to track this specific timer
    let currentRemaining = room.timerDuration;
    const interval = setInterval(() => {
      currentRemaining -= 1;
      console.log('[TIMER] Countdown:', currentRemaining);

      setRooms(prev => {
        const updatedRoom = prev.find(r => r.id === roomId);
        if (!updatedRoom) {
          clearInterval(interval);
          return prev;
        }

        if (currentRemaining <= 0) {
          clearInterval(interval);
          console.log('[TIMER] Game ended for room:', room.code);
          
          // Find winner (highest progress)
          const updatedRoomPlayers = players.filter(p => p.roomCode === updatedRoom.code);
          const winner = updatedRoomPlayers.sort((a, b) => b.progress - a.progress)[0];
          
          // Update Supabase
          roomService.updateRoomStatus(room.code, 'finished', winner?.id || null);

          return prev.map(r => r.id === roomId ? {
            ...r,
            timerRemaining: 0,
            status: 'finished' as RoomStatus,
            endedAt: Date.now(),
            winnerId: winner?.id || null,
          } : r);
        }

        // Save timer to Supabase every second so other clients see the update
        roomService.updateRoomTimer(room.code, currentRemaining).catch(
          err => console.error('[TIMER] Failed to save timer to Supabase:', err)
        );

        return prev.map(r => r.id === roomId ? { ...r, timerRemaining: currentRemaining } : r);
      });
    }, 1000);

    timerIntervals.current[roomId] = interval;
  }, [rooms, players]);

  const endGame = useCallback((roomId: string) => {
    if (timerIntervals.current[roomId]) {
      clearInterval(timerIntervals.current[roomId]);
      delete timerIntervals.current[roomId];
    }

    setRooms(prev => {
      const room = prev.find(r => r.id === roomId);
      if (!room) return prev;

      const updatedRooms = prev.map(r => {
        if (r.id === roomId) {
          const roomPlayers = players.filter(p => p.roomCode === r.code);
          const winner = roomPlayers.sort((a, b) => b.progress - a.progress)[0];
          
          // Update Supabase
          roomService.updateRoomStatus(room.code, 'finished', winner?.id || null);

          return {
            ...r,
            status: 'finished' as RoomStatus,
            endedAt: Date.now(),
            winnerId: winner?.id || null,
          };
        }
        return r;
      });
      return updatedRooms;
    });
  }, [players]);

  const resetGame = useCallback((roomId: string) => {
    if (timerIntervals.current[roomId]) {
      clearInterval(timerIntervals.current[roomId]);
      delete timerIntervals.current[roomId];
    }

    const room = rooms.find(r => r.id === roomId);
    if (room) {
      // Update Supabase room status to waiting and reset timer
      roomService.updateRoomStatus(room.code, 'waiting');
      roomService.updateRoomTimer(room.code, room.timerDuration);
    }

    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          status: 'waiting' as RoomStatus,
          timerRemaining: room.timerDuration,
          startedAt: null,
          endedAt: null,
          winnerId: null,
        };
      }
      return room;
    }));

    // Reset all players in the room
    setPlayers(prev => {
      const updatedPlayers = prev.map(player => {
        const room = rooms.find(r => r.id === roomId);
        if (room && player.roomCode === room.code) {
          // Update Supabase player progress
          playerService.updatePlayerProgress(player.id, [], 0);
          
          return {
            ...player,
            progress: 0,
            currentChallenge: 1,
            completedChallenges: [],
          };
        }
        return player;
      });
      return updatedPlayers;
    });
  }, [rooms]);

  // Player Management
  const joinRoom = useCallback(async (roomCode: string, username: string): Promise<Player | null> => {
    // First check local state
    let room = rooms.find(r => r.code === roomCode);
    
    // If not found locally, try fetching from Supabase
    if (!room) {
      try {
        room = await roomService.getRoomByCode(roomCode);
        if (room) {
          // Add to local state so it's available for future queries
          setRooms(prev => [...prev, room]);
        }
      } catch (err) {
        console.error('Failed to fetch room from Supabase:', err);
      }
    }
    
    if (!room) return null;
    
    const player: Player = {
      id: generateId(),
      username,
      roomCode,
      progress: 0,
      currentChallenge: 1,
      completedChallenges: [],
      joinedAt: Date.now(),
      isOnline: true,
    };
    
    setPlayers(prev => [...prev, player]);
    setCurrentPlayer(player);
    
    // Also save to Supabase if authenticated
    if (room.id) {
      try {
        const dbPlayer = await playerService.addPlayerToRoom(room.id, username, roomCode);
        if (dbPlayer) {
          const updatedPlayer = { ...player, id: dbPlayer.id };
          setCurrentPlayer(updatedPlayer);
          setPlayers(prev => prev.map(p => p.id === player.id ? updatedPlayer : p));
          return updatedPlayer;
        }
      } catch (err) {
        console.error('Failed to save player to Supabase:', err);
      }
    }
    
    return player;
  }, [rooms]);

  const leaveRoom = useCallback(async () => {
    if (currentPlayer) {
      // Mark as offline
      await playerService.updatePlayerOnlineStatus(currentPlayer.id, false).catch(
        err => console.error('Failed to update player status:', err)
      );
      
      setPlayers(prev => prev.filter(p => p.id !== currentPlayer.id));
      setCurrentPlayer(null);
    }
  }, [currentPlayer]);

  const getPlayersInRoom = useCallback((roomCode: string) => {
    return players.filter(p => p.roomCode === roomCode);
  }, [players]);

  const kickPlayer = useCallback((playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    
    // Also remove from Supabase
    playerService.removePlayerFromRoom(playerId).catch(err =>
      console.error('Failed to kick player from Supabase:', err)
    );
  }, []);

  // Sync players for a specific room from database
  const syncPlayersForRoom = useCallback((roomCode: string, newPlayers: Player[]) => {
    setPlayers(prev => {
      // Replace players in this room with new data, keep players from other rooms
      const otherRoomPlayers = prev.filter(p => p.roomCode !== roomCode);
      return [...otherRoomPlayers, ...newPlayers];
    });
  }, []);

  // Challenge Progress
  const completeChallenge = useCallback((challengeId: number) => {
    if (!currentPlayer) {
      console.error('[CHALLENGE] No current player');
      return;
    }

    console.log('[CHALLENGE] Completing challenge:', { challengeId, playerId: currentPlayer.id });

    setPlayers(prev => prev.map(player => {
      if (player.id === currentPlayer.id && !player.completedChallenges.includes(challengeId)) {
        const newCompleted = [...player.completedChallenges, challengeId];
        const newProgress = calculateProgress(newCompleted);
        const nextChallenge = Math.min(challengeId + 1, CHALLENGES.length);
        
        console.log('[CHALLENGE] Updated player progress:', { newCompleted, newProgress, nextChallenge });
        
        const updatedPlayer = {
          ...player,
          completedChallenges: newCompleted,
          progress: newProgress,
          currentChallenge: nextChallenge,
        };

        // Update current player state
        setCurrentPlayer(updatedPlayer);

        // Save to Supabase
        playerService.updatePlayerProgress(player.id, newCompleted, newProgress).catch(
          err => console.error('[CHALLENGE] Failed to update player progress in Supabase:', err)
        );

        // Check if player completed all challenges
        if (newCompleted.length === CHALLENGES.length) {
          console.log('[CHALLENGE] Player completed all challenges!');
          // Find the room and set winner if game is still playing
          const room = rooms.find(r => r.code === player.roomCode);
          if (room && room.status === 'playing' && !room.winnerId) {
            setRooms(prevRooms => prevRooms.map(r => 
              r.id === room.id ? { ...r, winnerId: player.id, status: 'finished' as RoomStatus, endedAt: Date.now() } : r
            ));
            roomService.updateRoomStatus(room.code, 'finished', player.id);
          }
        }

        return updatedPlayer;
      }
      return player;
    }));
  }, [currentPlayer, rooms]);

  // Load admin's rooms from Supabase when admin changes
  useEffect(() => {
    if (admin?.id) {
      roomService.getAdminRooms(admin.id).then(dbRooms => {
        if (dbRooms.length > 0) {
          setRooms(dbRooms);
        }
      }).catch(err => {
        console.error('Failed to load rooms from Supabase:', err);
      });
    }
  }, [admin?.id]);

  // Subscribe to realtime player updates when in a room
  useEffect(() => {
    let subscription: any = null;
    
    if (currentPlayer && rooms.length > 0) {
      const room = rooms.find(r => r.code === currentPlayer.roomCode);
      console.log('[SUBSCRIPTION] Setting up player subscription for room:', { roomCode: currentPlayer.roomCode, roomId: room?.id });
      if (room?.id) {
        subscription = playerService.subscribeToRoomPlayers(
          room.id,
          (updatedPlayers) => {
            console.log('[SUBSCRIPTION] Players updated:', updatedPlayers);
            setPlayers(updatedPlayers.map(p => ({
              ...p,
              roomCode: room.code
            })));
          }
        );
      }
    }
    
    return () => {
      if (subscription) {
        console.log('[SUBSCRIPTION] Cleaning up player subscription');
        subscription.unsubscribe();
      }
    };
  }, [currentPlayer, rooms]);

  // Subscribe to room changes when admin
  useEffect(() => {
    const subscriptions: any[] = [];
    
    rooms.forEach(room => {
      const subscription = roomService.subscribeToRoomChanges(
        room.id,
        (updatedRoom) => {
          if (updatedRoom) {
            setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
          }
        }
      );
      subscriptions.push(subscription);
    });
    
    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe());
    };
  }, [rooms.map(r => r.id).join(',')]);

  // Subscribe to player changes for all admin rooms
  useEffect(() => {
    const subscriptions: any[] = [];
    
    if (admin?.id) {
      rooms.forEach(room => {
        console.log('[ADMIN_ROOMS] Setting up player subscription for admin room:', room.id);
        const subscription = playerService.subscribeToRoomPlayers(
          room.id,
          (updatedPlayers) => {
            console.log('[ADMIN_ROOMS] Players updated for room', room.id, ':', updatedPlayers);
            setPlayers(prev => {
              // Remove old players from this room and add updated ones
              const withoutThisRoom = prev.filter(p => p.roomCode !== room.code);
              return [...withoutThisRoom, ...updatedPlayers.map(p => ({
                ...p,
                roomCode: room.code
              }))];
            });
          }
        );
        subscriptions.push(subscription);
      });
    }
    
    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe());
    };
  }, [admin?.id, rooms.map(r => r.id).join(',')]);
  useEffect(() => {
    return () => {
      Object.values(timerIntervals.current).forEach(interval => clearInterval(interval));
    };
  }, []);

  const value: GameContextType = {
    admin,
    isAdminAuthenticated: !!admin,
    adminLogin,
    adminSignup,
    adminLogout,
    setAdmin,
    rooms,
    createRoom,
    deleteRoom,
    getRoom,
    getRoomById,
    startGame,
    endGame,
    resetGame,
    currentPlayer,
    joinRoom,
    leaveRoom,
    getPlayersInRoom,
    kickPlayer,
    syncPlayersForRoom,
    completeChallenge,
    activeTimers,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
