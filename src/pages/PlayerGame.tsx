import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { CHALLENGES, HOUSE_NAMES, HOUSE_MOTTOS } from '@/types/game';
import { formatTime, calculateProgress } from '@/lib/gameUtils';
import { supabase } from '@/lib/supabase';
import * as roomService from '@/lib/roomService';
import LevelMap from '@/components/LevelMap';
import { 
  Crown, Clock, Users, CheckCircle2, Circle, Trophy,
  ArrowLeft, LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PlayerGame = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { 
    currentPlayer, 
    getRoom, 
    getPlayersInRoom, 
    leaveRoom,
    completeChallenge,
    syncPlayersForRoom,
    updateRoom
  } = useGame();
  const { toast } = useToast();
  const [, forceUpdate] = useState({});
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => !!(typeof document !== 'undefined' && document.fullscreenElement));
  
  // Define room and players early so they can be used in useEffects
  const room = roomCode ? getRoom(roomCode) : undefined;
  const players = roomCode ? getPlayersInRoom(roomCode) : [];
  
  // Initialize timer from room data
  const [roomTimer, setRoomTimer] = useState(room?.timerRemaining ?? 0);
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'playing' | 'finished'>((room?.status as any) ?? 'waiting');

  // Local countdown timer - counts down every second when game is playing
  useEffect(() => {
    if (roomStatus !== 'playing' || roomTimer <= 0) return;

    const interval = setInterval(() => {
      setRoomTimer(prev => {
        const newTimer = Math.max(0, prev - 1);
        if (newTimer === 0) {
          setRoomStatus('finished');
        }
        return newTimer;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roomStatus]);

  // Track fullscreen state
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Enter fullscreen on mount (only in production)
  useEffect(() => {
    if (!room || !currentPlayer || import.meta.env.DEV) return;

    let active = true;
    const elem = document.documentElement;

    const tryEnterFullscreen = async () => {
      if (!active || document.fullscreenElement) return;
      try {
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if ((elem as any).mozRequestFullScreen) await (elem as any).mozRequestFullScreen();
        else if ((elem as any).webkitRequestFullscreen) await (elem as any).webkitRequestFullscreen();
        else if ((elem as any).msRequestFullscreen) await (elem as any).msRequestFullscreen();
      } catch (err) {
        // Ignore - user will see the overlay if needed
      }
    };

    // Try once on mount
    tryEnterFullscreen();

    return () => {
      active = false;
    };
  }, [room, currentPlayer]);

  // Sync state with room data when room changes (initial load)
  useEffect(() => {
    if (room) {
      console.log('[ROOM_SYNC] Syncing room state - Timer:', room.timerRemaining, 'Status:', room.status, 'Room ID:', room.id, 'Room Code:', room.code);
      setRoomTimer(room.timerRemaining ?? 0);
      setRoomStatus((room.status as any) ?? 'waiting');
    } else {
      console.log('[ROOM_SYNC] ⚠️ No room data available');
    }
  }, [room?.id, room?.status]);

  // Fetch initial players from database when joining room
  useEffect(() => {
    if (!room?.id) return;

    const fetchPlayers = async () => {
      try {
        const { data: players, error } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', room.id); // Use room_id to match subscription

        if (!error && players && players.length > 0) {
          const appPlayers = players.map(p => ({
            id: p.id,
            roomCode: room.code, // Use room code from room object
            username: p.username,
            progress: p.progress || 0,
            currentChallenge: p.current_challenge || 1,
            completedChallenges: Array.isArray(p.completed_challenges) 
              ? p.completed_challenges.map((c: any) => typeof c === 'string' ? parseInt(c) : c)
              : [],
            isOnline: p.is_online !== false,
            joinedAt: p.joined_at ? new Date(p.joined_at).getTime() : Date.now(),
            lastActiveAt: p.last_active_at ? new Date(p.last_active_at).getTime() : Date.now(),
            completedAt: p.completed_at ? new Date(p.completed_at).getTime() : null,
            progressUpdatedAt: p.progress_updated_at ? new Date(p.progress_updated_at).getTime() : Date.now(),
          }));
          syncPlayersForRoom(room.code, appPlayers);
          console.log('[PLAYER_SYNC] Loaded', appPlayers.length, 'players from database for room', room.id);
        }
      } catch (err) {
        console.error('[PLAYER_SYNC] Error fetching players:', err);
      }
    };

    fetchPlayers();
  }, [room?.id, syncPlayersForRoom]);

  // Subscribe to real-time room updates (status, timer, etc)
  useEffect(() => {
    if (!room?.id || !roomCode) return;

    console.log('[REALTIME_ROOM] Subscribing to room updates:', room.id);
    
    const subscription = supabase
      .channel(`realtime:rooms:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        async (payload) => {
          console.log('[REALTIME_ROOM] Room update received! Event:', payload.eventType, 'Data:', payload.new);
          
          if (payload.new) {
            // Update room timer and status immediately
            const newTimer = payload.new.timer_remaining ?? 0;
            const newStatus = payload.new.status ?? 'waiting';
            
            console.log('[REALTIME_ROOM] ✅ Updating - Timer:', newTimer, 'Status:', newStatus);
            setRoomTimer(newTimer);
            setRoomStatus(newStatus);
            
            // Refetch full room data from Supabase to get updated winners
            try {
              const { data: roomData, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('code', roomCode)
                .single();
              
              if (!error && roomData) {
                console.log('[REALTIME_ROOM] 📊 Refetched room data, winners:', roomData.winners);
                // Update the room in GameContext with the latest data including winners
                const updatedRoom = {
                  id: roomData.id,
                  code: roomData.code,
                  name: roomData.name,
                  description: roomData.description,
                  houseTheme: roomData.house_theme,
                  timerDuration: roomData.timer_duration,
                  timerRemaining: roomData.timer_remaining,
                  status: roomData.status,
                  adminId: roomData.admin_id,
                  createdAt: new Date(roomData.created_at).getTime(),
                  startedAt: roomData.started_at ? new Date(roomData.started_at).getTime() : null,
                  endedAt: roomData.ended_at ? new Date(roomData.ended_at).getTime() : null,
                  winnerId: roomData.winner_id,
                  winners: roomData.winners || [],
                };
                updateRoom(updatedRoom);
              }
            } catch (err) {
              console.error('[REALTIME_ROOM] Error refetching room:', err);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME_ROOM] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[REALTIME_ROOM] ✅ Successfully subscribed to room updates');
        }
      });

    return () => {
      console.log('[REALTIME_ROOM] Unsubscribing from room');
      supabase.removeChannel(subscription);
    };
  }, [room?.id, roomCode, updateRoom]);

  // Subscribe to real-time player updates for this room
  useEffect(() => {
    if (!room?.id) return;

    console.log('[REALTIME_PLAYERS] Setting up subscription for room:', room.id);
    
    const subscription = supabase
      .channel(`realtime:players:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${room.id}`,
        },
        async (payload) => {
          console.log('[REALTIME_PLAYERS] Change detected! Event:', payload.eventType, 'Data:', payload);
          
          // Refetch all players for this room to ensure we have latest data
          try {
            const { data: players, error } = await supabase
              .from('players')
              .select('*')
              .eq('room_id', room.id);

            if (!error && players) {
              const appPlayers = players.map(p => ({
                id: p.id,
                roomCode: room.code,
                username: p.username,
                progress: p.progress || 0,
                currentChallenge: p.current_challenge || 1,
                completedChallenges: Array.isArray(p.completed_challenges) 
                  ? p.completed_challenges.map((c: any) => typeof c === 'string' ? parseInt(c) : c)
                  : [],
                isOnline: p.is_online !== false,
                joinedAt: p.joined_at ? new Date(p.joined_at).getTime() : Date.now(),
                lastActiveAt: p.last_active_at ? new Date(p.last_active_at).getTime() : Date.now(),
                completedAt: p.completed_at ? new Date(p.completed_at).getTime() : null,
                progressUpdatedAt: p.progress_updated_at ? new Date(p.progress_updated_at).getTime() : Date.now(),
              }));
              syncPlayersForRoom(room.code, appPlayers);
              console.log('[REALTIME_PLAYERS] Updated player list, count:', appPlayers.length);
              forceUpdate({});
            }
          } catch (err) {
            console.error('[REALTIME_PLAYERS] Error refetching players:', err);
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME_PLAYERS] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[REALTIME_PLAYERS] ✅ Successfully subscribed to player updates');
        }
      });

    return () => {
      console.log('[REALTIME_PLAYERS] Unsubscribing from players');
      supabase.removeChannel(subscription);
    };
  }, [room?.id, syncPlayersForRoom]);

  // Redirect if no room or no player
  // useEffect(() => {
  //   if (!room || !currentPlayer) {
  //     navigate('/join');
  //   }
  // }, [room, currentPlayer, navigate]);

  if (!room || !currentPlayer) {
    return null;
  }

  const topWinners = room.winners || [];
  
  // Calculate current player's actual rank dynamically (even if not in top 3)
  const allPlayersRanked = [...players].sort((a, b) => {
    const aProgress = calculateProgress(a.completedChallenges);
    const bProgress = calculateProgress(b.completedChallenges);
    
    if (aProgress === 100 && bProgress === 100) {
      if (a.completedAt && b.completedAt) {
        return a.completedAt - b.completedAt;
      }
      if (a.completedAt) return -1;
      if (b.completedAt) return 1;
      return (a.progressUpdatedAt || a.joinedAt) - (b.progressUpdatedAt || b.joinedAt);
    }
    
    if (bProgress !== aProgress) {
      return bProgress - aProgress;
    }
    
    const aTime = a.progressUpdatedAt || a.joinedAt;
    const bTime = b.progressUpdatedAt || b.joinedAt;
    return aTime - bTime;
  });
  
  const currentPlayerRankIndex = allPlayersRanked.findIndex(p => p.id === currentPlayer.id);
  const currentPlayerActualRank = currentPlayerRankIndex >= 0 ? currentPlayerRankIndex + 1 : null;
  const isInTop3 = currentPlayerActualRank !== null && currentPlayerActualRank <= 3;
  const winnerRank = currentPlayerActualRank;
  
  // Helper function to get ordinal suffix
  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  const handleCompleteChallenge = (challengeId: number) => {
    if (room.status !== 'playing') {
      toast({
        title: "Game Not Active",
        description: "Wait for the Game Master to start the hunt.",
        variant: "destructive",
      });
      return;
    }

    completeChallenge(challengeId);
    
    if (challengeId === CHALLENGES.length) {
      toast({
        title: "🎉 All Challenges Complete!",
        description: "You've conquered the hunt!",
      });
    } else {
      toast({
        title: "Challenge Complete!",
        description: `Moving to challenge ${challengeId + 1}`,
      });
    }
  };

  const handleLevelClick = (challengeId: number) => {
    console.log('[PLAYERGAME] handleLevelClick called - challengeId:', challengeId, 'room.status:', room.status, 'isGamePlaying:', room.status === 'playing');
    
    if (room.status !== 'playing') {
      toast({
        title: "Game Not Active",
        description: "Wait for the Game Master to start the hunt.",
        variant: "destructive",
      });
      return;
    }

    // Game 1 is always accessible when game is playing (it's the first challenge)
    // Other challenges are locked until the previous one is completed
    const isLocked = challengeId > 1 && challengeId > currentPlayer.currentChallenge;
    console.log('[PLAYERGAME] Challenge', challengeId, 'isLocked:', isLocked, 'currentChallenge:', currentPlayer.currentChallenge);
    
    if (isLocked) {
      toast({
        title: "Challenge Locked",
        description: "Complete previous challenges first.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to appropriate challenge page
    const challengeRoutes: { [key: number]: string } = {
      1: `/game1/${roomCode}`,
      2: `/riddle/${roomCode}`,
      3: `/game3/${roomCode}`,
      4: `/game4/${roomCode}`,
      5: `/game5/${roomCode}`,
    };

    console.log('[PLAYERGAME] Navigating to:', challengeRoutes[challengeId]);
    if (challengeRoutes[challengeId]) {
      navigate(challengeRoutes[challengeId]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {!isFullscreen && import.meta.env.PROD && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur">
          <div className="max-w-md w-full rounded-xl bg-background border border-border p-6 text-center">
            <p className="font-semibold text-lg">Fullscreen Required</p>
            <p className="text-sm text-muted-foreground mt-2">You must enter fullscreen to play. Click the button below to enter fullscreen.</p>
            <div className="mt-4">
              <Button 
                onClick={() => {
                  const elem = document.documentElement;
                  if (elem.requestFullscreen) elem.requestFullscreen();
                  else if ((elem as any).mozRequestFullScreen) (elem as any).mozRequestFullScreen();
                  else if ((elem as any).webkitRequestFullscreen) (elem as any).webkitRequestFullscreen();
                  else if ((elem as any).msRequestFullscreen) (elem as any).msRequestFullscreen();
                }}
                className="w-full"
              >
                Enter Fullscreen
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className={!isFullscreen && import.meta.env.PROD ? 'pointer-events-none opacity-50' : ''}>
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cinzel font-semibold">{room.name}</p>
                <p className="text-xs text-muted-foreground">{HOUSE_NAMES[room.houseTheme]}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Player Name */}
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{currentPlayer.username}</span>
              </div>
              
              {/* Timer */}
              <div className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1",
                roomStatus === 'playing' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg font-bold">{formatTime(roomTimer)}</span>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleLeave}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {/* Game Finished - Show Results Overlay */}
          {room.status === 'finished' && (
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-background/95 backdrop-blur">
              <Card className={cn(
                "border-2 max-w-md w-full",
                isInTop3 ? "border-primary bg-primary/5" : "border-accent/50 bg-accent/5"
              )}>
                <CardContent className="space-y-6 py-8">
                  <div className="text-center">
                    <Trophy className={cn(
                      "h-16 w-16 mx-auto mb-4",
                      isInTop3 ? "text-primary" : "text-accent"
                    )} />
                    
                    {winnerRank !== null && winnerRank <= 3 ? (
                      <>
                        <p className="font-cinzel text-3xl font-bold text-primary mb-2">
                          {winnerRank === 1 && "🥇 1st Place!"}
                          {winnerRank === 2 && "🥈 2nd Place!"}
                          {winnerRank === 3 && "🥉 3rd Place!"}
                        </p>
                        <p className="text-muted-foreground mb-4">You've earned a place on the podium!</p>
                      </>
                    ) : winnerRank !== null ? (
                      <>
                        <p className="font-cinzel text-2xl font-bold mb-2">You finished in {getOrdinal(winnerRank)} place</p>
                        <p className="text-muted-foreground mb-4">Great effort! The hunt has ended.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-cinzel text-2xl font-bold mb-2">Game Over</p>
                        <p className="text-muted-foreground mb-4">The hunt has ended.</p>
                      </>
                    )}
                  </div>
                  
                  {/* Top 3 Winners Podium */}
                  {topWinners.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-3 text-center">Final Podium:</p>
                      <div className="space-y-2">
                        {topWinners.map((winner) => {
                          const winnerPlayer = players.find(p => p.id === winner.playerId);
                          if (!winnerPlayer) return null;
                          return (
                            <div key={winner.playerId} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                              <span className="text-2xl">
                                {winner.rank === 1 && "🥇"}
                                {winner.rank === 2 && "🥈"}
                                {winner.rank === 3 && "🥉"}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{winnerPlayer.username}</p>
                              </div>
                              <span className="text-sm font-bold">{winner.progress}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleLeave}
                    className="w-full font-cinzel"
                  >
                    Back to Home
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Level Map - Candy Crush Style */}
          {room.status !== 'finished' && (
            <LevelMap
              challenges={CHALLENGES}
              completedChallenges={currentPlayer.completedChallenges}
              currentChallenge={currentPlayer.currentChallenge}
              onLevelClick={handleLevelClick}
              isGamePlaying={room.status === 'playing'}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PlayerGame;