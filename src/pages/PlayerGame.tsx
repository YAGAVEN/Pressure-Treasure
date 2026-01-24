import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { CHALLENGES, HOUSE_NAMES, HOUSE_MOTTOS } from '@/types/game';
import { formatTime, getLeaderboard } from '@/lib/gameUtils';
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
    completeChallenge
  } = useGame();
  const { toast } = useToast();
  const [, forceUpdate] = useState({});
  
  // Define room and players early so they can be used in useEffects
  const room = roomCode ? getRoom(roomCode) : undefined;
  const players = roomCode ? getPlayersInRoom(roomCode) : [];
  const leaderboard = getLeaderboard(players);
  
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

  // Subscribe to real-time room updates (status, timer, etc)
  useEffect(() => {
    if (!room?.id) return;

    console.log('[REALTIME_ROOM] Subscribing to room updates:', room.id);
    
    const subscription = roomService.subscribeToRoomChanges(
      room.id,
      (updatedRoom) => {
        console.log('[REALTIME_ROOM] Room updated:', updatedRoom);
        if (updatedRoom) {
          // Update state so component re-renders
          setRoomTimer(updatedRoom.timerRemaining);
          setRoomStatus(updatedRoom.status);
          console.log('[REALTIME_ROOM] Updated state - Timer:', updatedRoom.timerRemaining, 'Status:', updatedRoom.status);
        }
      }
    );

    return () => {
      console.log('[REALTIME_ROOM] Unsubscribing from room');
      subscription?.unsubscribe();
    };
  }, [room?.id]);

  // Subscribe to real-time player updates for this room
  useEffect(() => {
    if (!room?.id) return;

    console.log('[REALTIME_PLAYERS] Subscribing to players in room:', room.id);
    
    const subscription = supabase
      .channel(`room_players_${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          console.log('[REALTIME_PLAYERS] Player update received:', payload);
          // Force re-render to reflect new player data
          forceUpdate({});
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME_PLAYERS] Subscription status:', status);
      });

    return () => {
      console.log('[REALTIME_PLAYERS] Unsubscribing from players');
      supabase.removeChannel(subscription);
    };
  }, [room?.id]);

  // Redirect if no room or no player
  useEffect(() => {
    if (!room || !currentPlayer) {
      navigate('/join');
    }
  }, [room, currentPlayer, navigate]);

  if (!room || !currentPlayer) {
    return null;
  }

  const winner = room.winnerId ? players.find(p => p.id === room.winnerId) : null;
  const isWinner = room.winnerId === currentPlayer.id;
  const playerRank = leaderboard.findIndex(p => p.id === currentPlayer.id) + 1;

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
    <div className="min-h-screen bg-medieval-pattern">
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
          
          <div className="flex items-center gap-4">
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

      <main className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-3">
        {/* Main Content - Challenges */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status Banner */}
          {room.status === 'waiting' && (
            <Card className="border-muted bg-muted/30">
              <CardContent className="space-y-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse h-5 w-5 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">Waiting for Game Master</p>
                    <p className="text-sm text-muted-foreground">
                      {players.length} player{players.length !== 1 ? 's' : ''} ready • The hunt begins soon...
                    </p>
                  </div>
                </div>
                
                {/* Show joining players */}
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-2">Players Joining:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {players.map(p => (
                      <div key={p.id} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="truncate">{p.username}</span>
                        {p.id === currentPlayer?.id && <span className="text-primary font-medium">(You)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {room.status === 'finished' && (
            <Card className={cn(
              "border-2",
              isWinner ? "border-primary bg-primary/10" : "border-accent/50 bg-accent/10"
            )}>
              <CardContent className="flex items-center gap-4 py-6">
                <Trophy className={cn(
                  "h-10 w-10",
                  isWinner ? "text-primary" : "text-accent"
                )} />
                <div>
                  {isWinner ? (
                    <>
                      <p className="font-cinzel text-xl font-bold text-primary">Victory!</p>
                      <p className="text-muted-foreground">You have claimed the Iron Throne!</p>
                    </>
                  ) : (
                    <>
                      <p className="font-cinzel text-xl font-bold">Game Over</p>
                      <p className="text-muted-foreground">
                        {winner ? `${winner.username} has won the hunt!` : 'The hunt has ended.'}
                      </p>
                    </>
                  )}
                </div>
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
              const isLocked = challenge.id > currentPlayer.currentChallenge;
              
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
                  
                  {isCurrent && (
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
                  
                  {isLocked && (
                    <CardContent className="pt-2 text-sm text-muted-foreground">
                      <p>Complete challenge {challenge.id - 1} first</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Leaderboard */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="font-cinzel text-lg">Leaderboard</CardTitle>
              </div>
              <CardDescription>
                Your rank: #{playerRank} of {players.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((player, index) => {
                  const isCurrentPlayer = player.id === currentPlayer.id;
                  const isRoomWinner = room.winnerId === player.id;
                  
                  return (
                    <div
                      key={player.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                        isCurrentPlayer && "bg-primary/10",
                        isRoomWinner && "ring-2 ring-primary"
                      )}
                    >
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        index === 0 && "bg-primary text-primary-foreground",
                        index === 1 && "bg-muted-foreground/30",
                        index === 2 && "bg-accent/30",
                        index > 2 && "bg-muted"
                      )}>
                        {index + 1}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "truncate text-sm font-medium",
                          isCurrentPlayer && "text-primary"
                        )}>
                          {player.username}
                          {isCurrentPlayer && " (You)"}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isRoomWinner && <Crown className="h-4 w-4 text-primary" />}
                        <span className="text-sm font-medium">{player.progress}%</span>
                      </div>
                    </div>
                  );
                })}
                
                {players.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No players yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PlayerGame;
