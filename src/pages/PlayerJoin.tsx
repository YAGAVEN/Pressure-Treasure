import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGame } from '@/contexts/GameContext';
import { Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import * as roomService from '@/lib/roomService';

const PlayerJoin = () => {
  const navigate = useNavigate();
  const { joinRoom, getRoom } = useGame();
  const { toast } = useToast();
  
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formattedCode = roomCode.toUpperCase().trim();
    let room = getRoom(formattedCode);
    
    // If not found locally, try Supabase
    if (!room) {
      try {
        room = await roomService.getRoomByCode(formattedCode);
      } catch (err) {
        console.error('Error fetching room:', err);
      }
    }
    
    if (!room) {
      toast({
        title: "Room Not Found",
        description: "No room exists with that code. Check the code and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (room.status === 'finished') {
      toast({
        title: "Game Ended",
        description: "This treasure hunt has already concluded.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    const player = await joinRoom(formattedCode, username.trim());
    
    if (player) {
      toast({
        title: "Welcome to the Hunt!",
        description: `You've joined ${room.name}. Good luck!`,
      });
      navigate(`/game/${formattedCode}`);
    } else {
      toast({
        title: "Failed to Join",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setRoomCode(value);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      />
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-border/50 bg-black/30 backdrop-blur">
          <div className="container mx-auto flex items-center gap-4 px-4 py-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md border-2 border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-cinzel text-2xl">Join the Hunt</CardTitle>
              <CardDescription>
                Enter your room code and choose a name to begin your quest
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="room-code">Room Code</Label>
                <Input
                  id="room-code"
                  type="text"
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={handleCodeChange}
                  className="text-center font-mono text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-center text-xs text-muted-foreground">
                  Get this code from your Game Master
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Your Name</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Jon Snow"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-center"
                  maxLength={20}
                  required
                />
                <p className="text-center text-xs text-muted-foreground">
                  This will be shown on the leaderboard
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full font-cinzel" 
                size="lg"
                disabled={isLoading || roomCode.length !== 6 || !username.trim()}
              >
                {isLoading ? 'Joining...' : 'Begin Your Quest'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      </div>
    </div>
  );
};

export default PlayerJoin;
