import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { HOUSE_NAMES, HOUSE_MOTTOS, HouseTheme, Room } from '@/types/game';
import { formatTime, calculateProgress } from '@/lib/gameUtils';
import { 
  Shield, Plus, Trash2, Play, Square, RotateCcw, Users, 
  Clock, Crown, LogOut, Copy, Check, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    admin, 
    isAdminAuthenticated, 
    adminLogout,
    rooms, 
    createRoom, 
    deleteRoom,
    startGame,
    endGame,
    resetGame,
    getPlayersInRoom,
    kickPlayer,
    syncPlayersForRoom
  } = useGame();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomHouse, setNewRoomHouse] = useState<HouseTheme>('stark');
  const [newRoomTimer, setNewRoomTimer] = useState(30);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [, forceUpdate] = useState({});
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  // Define adminRooms early so it can be used in useEffects
  const adminRooms = rooms.filter(r => r.adminId === admin?.id);

  // Force re-render every second for timer display
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial players for all admin rooms from database
  useEffect(() => {
    const fetchPlayersForRooms = async () => {
      for (const room of adminRooms) {
        try {
          const { data: players, error } = await supabase
            .from('players')
            .select('*')
            .eq('room_code', room.code);

          if (!error && players && players.length > 0) {
            const appPlayers = players.map(p => ({
              id: p.id,
              roomCode: p.room_code,
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
          }
        } catch (err) {
          console.error('[ADMIN] Error fetching players for room:', room.code, err);
        }
      }
    };

    if (adminRooms.length > 0) {
      fetchPlayersForRooms();
    }
  }, [adminRooms.length, syncPlayersForRoom]);

  // Subscribe to real-time player updates across all rooms
  useEffect(() => {
    console.log('[ADMIN] Setting up real-time player subscription');
    
    const subscription = supabase
      .channel('realtime:players')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
        },
        async (payload) => {
          console.log('[ADMIN] Player change detected! Event:', payload.eventType, 'Data:', payload);
          
          // Extract room code from the payload
          const roomCode = payload.new?.room_code || payload.old?.room_code;
          if (!roomCode) {
            console.log('[ADMIN] No room code in payload, skipping');
            return;
          }

          // Fetch updated players for this room
          try {
            const { data: updatedPlayers, error } = await supabase
              .from('players')
              .select('*')
              .eq('room_code', roomCode);

            if (!error && updatedPlayers) {
              // Convert database players to app format and sync
              const appPlayers = updatedPlayers.map(p => ({
                id: p.id,
                roomCode: p.room_code,
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
              
              syncPlayersForRoom(roomCode, appPlayers);
              console.log('[ADMIN] ✅ Synced', appPlayers.length, 'players for room:', roomCode);
              forceUpdate({});
            }
          } catch (err) {
            console.error('[ADMIN] Error fetching updated players:', err);
          }
        }
      )
      .subscribe((status) => {
        console.log('[ADMIN] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[ADMIN] ✅ Successfully subscribed to player updates');
        }
      });

    return () => {
      console.log('[ADMIN] Cleaning up player subscription');
      supabase.removeChannel(subscription);
    };
  }, [syncPlayersForRoom]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/auth');
    }
  }, [isAdminAuthenticated, navigate]);

  if (!isAdminAuthenticated) {
    return null;
  }

  // If a room is playing and expanded, show full-page view
  const expandedRoom = adminRooms.find(r => r.id === expandedRoomId);
  if (expandedRoom && expandedRoom.status === 'playing') {
    const players = getPlayersInRoom(expandedRoom.code);
    
    return (
      <div className="bg-medieval-pattern" style={{ minHeight: '100vh', minHeight: '100dvh' }}>
        {/* Compact Header */}
        <header className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedRoomId(null)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Back
              </Button>
              <div>
                <p className="font-cinzel font-semibold">{expandedRoom.name}</p>
                <p className="text-xs text-muted-foreground">{HOUSE_NAMES[expandedRoom.houseTheme]}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Timer Display */}
              <div className="flex flex-col items-center">
                <Clock className="h-5 w-5 text-accent mb-1" />
                <p className="font-cinzel text-xl font-bold text-accent">
                  {formatTime(expandedRoom.timerRemaining)}
                </p>
              </div>
              
              {/* Overall Progress Percentage */}
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground mb-1">Overall Progress</p>
                <p className="font-cinzel text-2xl font-bold">
                  {Math.round(players.reduce((sum, p) => sum + calculateProgress(p.completedChallenges), 0) / (players.length || 1))}%
                </p>
              </div>
              
              <Button
                onClick={() => endGame(expandedRoom.id)}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                End Game
              </Button>
            </div>
          </div>
        </header>

        {/* Full-Page Participant Grid - No Scrolling */}
        <main className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-100px)]">
          <div className="flex-1 overflow-hidden flex flex-col">
            {players.length === 0 ? (
              <Card className="flex-1 flex items-center justify-center border-dashed">
                <CardContent className="flex flex-col items-center justify-center">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="font-cinzel text-lg text-muted-foreground">No players yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 auto-rows-max overflow-y-auto">
                {players.map((player) => {
                  const actualProgress = calculateProgress(player.completedChallenges);
                  const completionPercentage = actualProgress;
                  
                  // Determine visual representation (bars filled out of 5)
                  const filledBars = Math.ceil((completionPercentage / 100) * 5);
                  
                  return (
                    <Card key={player.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-cinzel font-semibold text-lg flex-1">{player.username}</h3>
                          <div className="text-right">
                            <p className="font-cinzel text-2xl font-bold text-primary">{completionPercentage}%</p>
                            <p className="text-xs text-muted-foreground">Progress</p>
                          </div>
                        </div>
                        
                        {/* Visual Progress Bar Representation */}
                        <div className="flex gap-2 mb-3">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div
                              key={index}
                              className={`flex-1 h-8 rounded transition-all ${
                                index < filledBars
                                  ? 'bg-gradient-to-r from-primary to-primary/80'
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Standard Progress Bar */}
                        <Progress value={completionPercentage} className="h-2" />
                        
                        {/* Completed Challenges */}
                        <div className="mt-2 text-xs text-muted-foreground">
                          Completed Challenges: {player.completedChallenges.join(', ') || 'None'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the room.",
        variant: "destructive",
      });
      return;
    }

    const room = createRoom(
      newRoomName.trim(),
      newRoomDescription.trim(),
      newRoomHouse,
      newRoomTimer * 60
    );

    toast({
      title: "Room Created",
      description: `${room.name} is ready. Share code: ${room.code}`,
    });

    setIsCreateDialogOpen(false);
    setNewRoomName('');
    setNewRoomDescription('');
    setNewRoomHouse('stark');
    setNewRoomTimer(30);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = async () => {
    await adminLogout();
    navigate('/');
  };

  const getStatusBadge = (room: Room) => {
    const baseClasses = "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium";
    
    switch (room.status) {
      case 'waiting':
        return <span className={`${baseClasses} bg-muted text-muted-foreground`}>Waiting</span>;
      case 'playing':
        return <span className={`${baseClasses} bg-primary/10 text-primary`}>In Progress</span>;
      case 'finished':
        return <span className={`${baseClasses} bg-accent/10 text-accent`}>Finished</span>;
    }
  };

  return (
    <div className="bg-medieval-pattern" style={{ minHeight: '100vh', minHeight: '100dvh' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-cinzel text-lg font-semibold">Game Master</p>
              <p className="text-sm text-muted-foreground">{admin?.displayName}</p>
            </div>
          </div>
          
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Create Room Button */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-cinzel text-2xl font-bold">Your Rooms</h1>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-cinzel">
                <Plus className="h-4 w-4" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-cinzel">Create New Room</DialogTitle>
                <DialogDescription>
                  Set up a new treasure hunt for your players
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    placeholder="The Great Hunt"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room-description">Description (Optional)</Label>
                  <Textarea
                    id="room-description"
                    placeholder="A brief description of this hunt..."
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room-house">House Theme</Label>
                  <Select value={newRoomHouse} onValueChange={(v) => setNewRoomHouse(v as HouseTheme)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(HOUSE_NAMES).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          <span className="font-cinzel">{name}</span>
                          <span className="ml-2 text-muted-foreground">— {HOUSE_MOTTOS[key as HouseTheme]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room-timer">Timer Duration (minutes)</Label>
                  <Select value={newRoomTimer.toString()} onValueChange={(v) => setNewRoomTimer(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                        <SelectItem key={mins} value={mins.toString()}>
                          {mins} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRoom} className="font-cinzel">
                  Create Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms Grid */}
        {adminRooms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Crown className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="font-cinzel text-lg text-muted-foreground">No rooms yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first treasure hunt to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adminRooms.map((room) => {
              const players = getPlayersInRoom(room.code);
              const topWinners = room.winners || [];
              
              return (
                <Card key={room.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-cinzel text-lg">{room.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {HOUSE_NAMES[room.houseTheme]}
                        </CardDescription>
                      </div>
                      {getStatusBadge(room)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Room Code */}
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <span className="font-mono text-lg tracking-widest">{room.code}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyCode(room.code)}
                        className="h-8 w-8"
                      >
                        {copiedCode === room.code ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{players.length} players</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(room.timerRemaining)}</span>
                      </div>
                    </div>
                    
                    {/* Top 3 Winners Display */}
                    {room.status === 'finished' && topWinners.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Top Winners:</p>
                        {topWinners.map((winner) => {
                          const winnerPlayer = players.find(p => p.id === winner.playerId);
                          if (!winnerPlayer) return null;
                          return (
                            <div key={winner.playerId} className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                              <span className="text-sm">
                                {winner.rank === 1 && "🥇"}
                                {winner.rank === 2 && "🥈"}
                                {winner.rank === 3 && "🥉"}
                              </span>
                              <span className="text-sm font-medium flex-1">{winnerPlayer.username}</span>
                              <span className="text-xs text-muted-foreground">{winner.progress}%</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Player List */}
                    {players.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">Players:</p>
                          {room.status === 'playing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => setExpandedRoomId(room.id)}
                            >
                              Expand View
                            </Button>
                          )}
                        </div>
                        <div className="max-h-24 space-y-1 overflow-y-auto">
                          {players.map((player) => {
                            const actualProgress = calculateProgress(player.completedChallenges);
                            return (
                              <div key={player.id} className="flex items-center justify-between rounded bg-muted/30 px-2 py-1">
                                <span className="text-sm">{player.username}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{actualProgress}%</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => kickPlayer(player.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Controls */}
                    <div className="flex gap-2 pt-2">
                      {room.status === 'waiting' && (
                        <Button
                          onClick={() => startGame(room.id)}
                          className="flex-1 gap-2"
                          disabled={players.length === 0}
                        >
                          <Play className="h-4 w-4" />
                          Start
                        </Button>
                      )}
                      
                      {room.status === 'playing' && (
                        <Button
                          onClick={() => endGame(room.id)}
                          variant="secondary"
                          className="flex-1 gap-2"
                        >
                          <Square className="h-4 w-4" />
                          End Game
                        </Button>
                      )}
                      
                      {room.status === 'finished' && (
                        <Button
                          onClick={() => resetGame(room.id)}
                          variant="secondary"
                          className="flex-1 gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset
                        </Button>
                      )}
                      
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          deleteRoom(room.id);
                          toast({
                            title: "Room Deleted",
                            description: `${room.name} has been removed.`,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
