import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Room, Player, Admin, RoomStatus, HouseTheme, CHALLENGES } from '@/types/game';
import { generateRoomCode, generateId, calculateProgress } from '@/lib/gameUtils';

interface GameContextType {
  // Admin State
  admin: Admin | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminSignup: (email: string, password: string, displayName: string) => Promise<boolean>;
  adminLogout: () => void;
  
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
    // Simulated login - in production, this would verify against a backend
    const storedAdmins = JSON.parse(localStorage.getItem('got_admins') || '[]');
    const foundAdmin = storedAdmins.find((a: Admin & { password: string }) => 
      a.email === email && a.password === password
    );
    
    if (foundAdmin) {
      const { password: _, ...adminData } = foundAdmin;
      setAdmin(adminData);
      return true;
    }
    return false;
  }, []);

  const adminSignup = useCallback(async (email: string, password: string, displayName: string): Promise<boolean> => {
    const storedAdmins = JSON.parse(localStorage.getItem('got_admins') || '[]');
    
    if (storedAdmins.some((a: Admin) => a.email === email)) {
      return false; // Email already exists
    }
    
    const newAdmin = {
      id: generateId(),
      email,
      password, // In production, this would be hashed
      displayName,
    };
    
    storedAdmins.push(newAdmin);
    localStorage.setItem('got_admins', JSON.stringify(storedAdmins));
    
    const { password: _, ...adminData } = newAdmin;
    setAdmin(adminData);
    return true;
  }, []);

  const adminLogout = useCallback(() => {
    setAdmin(null);
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
    
    setRooms(prev => [...prev, room]);
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
  }, [rooms]);

  const getRoom = useCallback((roomCode: string) => {
    return rooms.find(r => r.code === roomCode);
  }, [rooms]);

  const getRoomById = useCallback((roomId: string) => {
    return rooms.find(r => r.id === roomId);
  }, [rooms]);

  // Game Controls
  const startGame = useCallback((roomId: string) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          status: 'playing' as RoomStatus,
          startedAt: Date.now(),
          timerRemaining: room.timerDuration,
        };
      }
      return room;
    }));

    // Start timer
    const interval = setInterval(() => {
      setRooms(prev => {
        const room = prev.find(r => r.id === roomId);
        if (!room || room.status !== 'playing') {
          clearInterval(interval);
          return prev;
        }

        const newRemaining = room.timerRemaining - 1;
        
        if (newRemaining <= 0) {
          clearInterval(interval);
          // Find winner (highest progress)
          const roomPlayers = players.filter(p => p.roomCode === room.code);
          const winner = roomPlayers.sort((a, b) => b.progress - a.progress)[0];
          
          return prev.map(r => r.id === roomId ? {
            ...r,
            timerRemaining: 0,
            status: 'finished' as RoomStatus,
            endedAt: Date.now(),
            winnerId: winner?.id || null,
          } : r);
        }

        return prev.map(r => r.id === roomId ? { ...r, timerRemaining: newRemaining } : r);
      });

      setActiveTimers(prev => {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          return { ...prev, [roomId]: room.timerRemaining - 1 };
        }
        return prev;
      });
    }, 1000);

    timerIntervals.current[roomId] = interval;
  }, [players, rooms]);

  const endGame = useCallback((roomId: string) => {
    if (timerIntervals.current[roomId]) {
      clearInterval(timerIntervals.current[roomId]);
      delete timerIntervals.current[roomId];
    }

    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const roomPlayers = players.filter(p => p.roomCode === room.code);
        const winner = roomPlayers.sort((a, b) => b.progress - a.progress)[0];
        
        return {
          ...room,
          status: 'finished' as RoomStatus,
          endedAt: Date.now(),
          winnerId: winner?.id || null,
        };
      }
      return room;
    }));
  }, [players]);

  const resetGame = useCallback((roomId: string) => {
    if (timerIntervals.current[roomId]) {
      clearInterval(timerIntervals.current[roomId]);
      delete timerIntervals.current[roomId];
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
    setPlayers(prev => prev.map(player => {
      const room = rooms.find(r => r.id === roomId);
      if (room && player.roomCode === room.code) {
        return {
          ...player,
          progress: 0,
          currentChallenge: 1,
          completedChallenges: [],
        };
      }
      return player;
    }));
  }, [rooms]);

  // Player Management
  const joinRoom = useCallback((roomCode: string, username: string): Player | null => {
    const room = rooms.find(r => r.code === roomCode);
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
    return player;
  }, [rooms]);

  const leaveRoom = useCallback(() => {
    if (currentPlayer) {
      setPlayers(prev => prev.filter(p => p.id !== currentPlayer.id));
      setCurrentPlayer(null);
    }
  }, [currentPlayer]);

  const getPlayersInRoom = useCallback((roomCode: string) => {
    return players.filter(p => p.roomCode === roomCode);
  }, [players]);

  const kickPlayer = useCallback((playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  }, []);

  // Challenge Progress
  const completeChallenge = useCallback((challengeId: number) => {
    if (!currentPlayer) return;

    setPlayers(prev => prev.map(player => {
      if (player.id === currentPlayer.id && !player.completedChallenges.includes(challengeId)) {
        const newCompleted = [...player.completedChallenges, challengeId];
        const newProgress = calculateProgress(newCompleted);
        const nextChallenge = Math.min(challengeId + 1, CHALLENGES.length);
        
        const updatedPlayer = {
          ...player,
          completedChallenges: newCompleted,
          progress: newProgress,
          currentChallenge: nextChallenge,
        };

        // Update current player state
        setCurrentPlayer(updatedPlayer);

        // Check if player completed all challenges
        if (newCompleted.length === CHALLENGES.length) {
          // Find the room and set winner if game is still playing
          const room = rooms.find(r => r.code === player.roomCode);
          if (room && room.status === 'playing' && !room.winnerId) {
            setRooms(prevRooms => prevRooms.map(r => 
              r.id === room.id ? { ...r, winnerId: player.id, status: 'finished' as RoomStatus, endedAt: Date.now() } : r
            ));
          }
        }

        return updatedPlayer;
      }
      return player;
    }));
  }, [currentPlayer, rooms]);

  // Cleanup timers on unmount
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
