import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Users, Shield, Volume2, VolumeX } from 'lucide-react';

const Index = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Create audio element for background music
    const audio = new Audio('/intro.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    // Function to play audio
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.log('Audio playback failed:', error);
        });
      }
    };

    // Try to play immediately
    playAudio();

    // Also play on first user interaction (click, touch, key press)
    const handleUserInteraction = () => {
      playAudio();
      // Remove listener after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Cleanup: stop and remove audio when component unmounts (user navigates away)
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.5;
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-medieval-pattern">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center">
            {/* Crown Icon */}
            <div className="mb-6 rounded-full bg-primary/10 p-4 ring-2 ring-primary/20">
              <Crown className="h-12 w-12 text-primary" />
            </div>
            
            {/* Title */}
            <h1 className="font-decorative text-4xl font-bold tracking-wide md:text-6xl lg:text-7xl">
              <span className="text-gold-gradient"> Pressure & Treasure </span>
            </h1>
            
            <p className="mt-4 font-cinzel text-xl text-muted-foreground md:text-2xl">
              A Game of Thrones Adventure
            </p>
            
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Embark on an epic quest through the Seven Kingdoms. Complete challenges, 
              outpace your rivals, and claim the Iron Throne!
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Player Card */}
          <Card className="group relative overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <CardHeader className="relative">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-cinzel text-2xl">Join the Hunt</CardTitle>
              <CardDescription className="text-base">
                Enter a room code to join an active treasure hunt and compete against other players.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              <Link to="/join">
                <Button size="lg" className="w-full font-cinzel">
                  Enter Room Code
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="group relative overflow-hidden border-2 border-accent/20 bg-card/50 backdrop-blur transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <CardHeader className="relative">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-cinzel text-2xl">Game Master</CardTitle>
              <CardDescription className="text-base">
                Create and manage treasure hunt rooms. Control timers, monitor progress, and crown winners.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              <Link to="/admin/auth">
                <Button size="lg" variant="secondary" className="w-full font-cinzel">
                  Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto flex items-center justify-center gap-6 px-4">
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-cinzel">Valar Morghulis</span> — All men must play
          </p>
          <button
            onClick={toggleMute}
            className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-primary/10 active:bg-primary/20"
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Volume2 className="h-5 w-5 text-primary" />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Index;
