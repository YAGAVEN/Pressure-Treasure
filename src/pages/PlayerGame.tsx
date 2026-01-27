import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { CHALLENGES, HOUSE_NAMES, HOUSE_MOTTOS } from '@/types/game';
import { formatTime } from '@/lib/gameUtils';
import { supabase } from '@/lib/supabase';
import * as roomService from '@/lib/roomService';
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

  // Sync state with room data when room changes (initial load)
  useEffect(() => {
    if (room) {
      console.log('[ROOM_SYNC] Syncing room state - Timer:', room.timerRemaining, 'Status:', room.status);
      setRoomTimer(room.timerRemaining ?? 0);
      setRoomStatus((room.status as any) ?? 'waiting');
    }
  }, [room?.id]);

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
  useEffect(() => {
    if (!room || !currentPlayer) {
      navigate('/join');
    }
  }, [room, currentPlayer, navigate]);

  if (!room || !currentPlayer) {
    return null;
  }

  const topWinners = room.winners || [];
  const currentPlayerWinner = topWinners.find(w => w.playerId === currentPlayer.id);
  const isWinner = currentPlayerWinner !== undefined;
  const winnerRank = currentPlayerWinner?.rank;

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

  return (
    <div className="min-h-screen bg-background">
      <div>
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
          {/* Main Content - Challenges */}
          <div className="space-y-6 max-w-4xl mx-auto">
          {/* Status Banner */}

          {room.status === 'finished' && (
            <Card className={cn(
              "border-2",
              isWinner ? "border-primary bg-primary/10" : "border-accent/50 bg-accent/10"
            )}>
              <CardContent className="space-y-4 py-6">
                <div className="flex items-center gap-4">
                  <Trophy className={cn(
                    "h-10 w-10",
                    isWinner ? "text-primary" : "text-accent"
                  )} />
                  <div className="flex-1">
                    {isWinner ? (
                      <>
                        <p className="font-cinzel text-xl font-bold text-primary">
                          {winnerRank === 1 && "🥇 1st Place Victory!"}
                          {winnerRank === 2 && "🥈 2nd Place Finish!"}
                          {winnerRank === 3 && "🥉 3rd Place Podium!"}
                        </p>
                        <p className="text-muted-foreground">You've earned a place on the podium!</p>
                      </>
                    ) : (
                      <>
                        <p className="font-cinzel text-xl font-bold">Game Over</p>
                        <p className="text-muted-foreground">The hunt has ended.</p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Top 3 Winners Podium */}
                {topWinners.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Final Podium:</p>
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
                              <p className="font-medium">{winnerPlayer.username}</p>
                            </div>
                            <span className="text-sm font-bold">{winner.progress}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Progress Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-cinzel text-lg">Your Progress</CardTitle>
                <span className="text-2xl font-bold text-primary">{currentPlayer.progress}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={currentPlayer.progress} className="h-3" />
              <p className="mt-2 text-sm text-muted-foreground">
                {currentPlayer.completedChallenges.length} of {CHALLENGES.length} challenges complete
              </p>
            </CardContent>
          </Card>

          {/* Challenges List */}
          <div className="space-y-4">
            <h2 className="font-cinzel text-xl font-semibold">Challenges</h2>
            
            {CHALLENGES.map((challenge, index) => {
              const isCompleted = currentPlayer.completedChallenges.includes(challenge.id);
              const isCurrent = currentPlayer.currentChallenge === challenge.id;
              const isLocked = false; // All challenges unlocked for testing
              
              return (
                <Card 
                  key={challenge.id}
                  className={cn(
                    "transition-all",
                    isCompleted && "border-primary/50 bg-primary/5",
                    isCurrent && "border-primary ring-2 ring-primary/20",
                    isLocked && "opacity-50"
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                        isCompleted ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="font-bold">{challenge.id}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-cinzel text-lg">{challenge.name}</CardTitle>
                        <CardDescription className="mt-1">{challenge.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                   {challenge.id === 1 && !isCompleted && (
                     <CardContent className="pt-2">
                       <Button 
                         onClick={() => navigate(`/game1/${roomCode}`)}
                         disabled={room.status !== 'playing' || isCompleted}
                         className="w-full font-cinzel"
                       >
                         {isCompleted ? '✓ Completed' : room.status === 'playing' ? 'Start Trial of the First Men' : 'Waiting for Game Master...'}
                       </Button>
                     </CardContent>
                   )}
                   
                   {challenge.id === 2 && !isCompleted && (
                     <CardContent className="pt-2">
                       <Button 
                         onClick={() => navigate(`/riddle/${roomCode}`)}
                         disabled={room.status !== 'playing' || isCompleted}
                         className="w-full font-cinzel"
                       >
                         {isCompleted ? '✓ Completed' : room.status === 'playing' ? 'Start Riddle Challenge' : 'Waiting for Game Master...'}
                       </Button>
                     </CardContent>
                   )}
                  
                  {challenge.id === 3 && !isCompleted && (
                    <CardContent className="pt-2">
                      <Button 
                        onClick={() => navigate(`/game3/${roomCode}`)}
                        disabled={room.status !== 'playing' || isCompleted}
                        className="w-full font-cinzel"
                      >
                        {isCompleted ? '✓ Completed' : room.status === 'playing' ? 'Start Kingswood Challenge' : 'Waiting for Game Master...'}
                      </Button>
                    </CardContent>
                  )}
                  
                  {challenge.id === 4 && !isCompleted && (
                    <CardContent className="pt-2">
                      <Button 
                        onClick={() => navigate(`/game4/${roomCode}`)}
                        disabled={room.status !== 'playing' || isCompleted}
                        className="w-full font-cinzel"
                      >
                        {isCompleted ? '✓ Completed' : room.status === 'playing' ? 'Start Maester\'s Trial' : 'Waiting for Game Master...'}
                      </Button>
                    </CardContent>
                  )}

                  {challenge.id === 5 && !isCompleted && (
                    <CardContent className="pt-2">
                      <Button 
                        onClick={() => navigate(`/game5/${roomCode}`)}
                        disabled={room.status !== 'playing' || isCompleted}
                        className="w-full font-cinzel"
                      >
                        {isCompleted ? '✓ Completed' : room.status === 'playing' ? 'Start Iron Throne Ascension' : 'Waiting for Game Master...'}
                      </Button>
                    </CardContent>
                  )}
                   
                  {challenge.id !== 2 && challenge.id !== 3 && challenge.id !== 4 && challenge.id !== 5 && !isCompleted && (
                    <CardContent className="pt-2">
                      <Button 
                        onClick={() => handleCompleteChallenge(challenge.id)}
                        disabled={room.status !== 'playing' || isCompleted}
                        className="w-full font-cinzel"
                      >
                        {isCompleted ? '✓ Completed' : room.status === 'playing' ? 'Complete Challenge' : 'Waiting for Game Master...'}
                      </Button>
                    </CardContent>
                  )}
                  
                  {isCompleted && (
                    <CardContent className="pt-2 text-sm text-muted-foreground">
                      <p>✓ Challenge completed</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlayerGame;
