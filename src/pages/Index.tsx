import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Users, Shield, Volume2, VolumeX } from 'lucide-react';
import Game3 from '../game3/pages/Index';

const Index = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    // Loop the animation every 15 seconds
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const text = "PRESSURE & TREASURE";
  const letters = text.split('').map((char, index) => ({
    char,
    index,
    // Random initial positions across the viewport
    initialX: Math.random() * 100 - 50,
    initialY: Math.random() * 100 - 50,
    // Random rotation
    rotation: Math.random() * 720 - 360,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/intro-video.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay for better text readability - reduced opacity */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      
      {/* Admin Button - Top Right */}
      <div className="absolute right-4 top-4 z-20 md:right-8 md:top-8">
        <Link to="/admin/auth">
          <Button 
            size="sm" 
            variant="outline" 
            className="border-amber-400/50 bg-black/40 font-cinzel text-amber-200 backdrop-blur-md hover:bg-black/60 hover:border-amber-400 hover:text-amber-100"
          >
            <Shield className="mr-2 h-4 w-4" />
            Admin Login
          </Button>
        </Link>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        {/* Hero Section - Title Only */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          <div className="relative flex flex-col items-center text-center" style={{ minHeight: '200px', width: '100%' }}>
            {/* Animated Scrambled Letters */}
            <style>{`
              @keyframes glow {
                0%, 100% {
                  text-shadow: 
                    0 0 10px #fbbf24,
                    0 0 20px #fbbf24,
                    0 0 30px #fbbf24,
                    0 0 40px #f59e0b;
                }
                50% {
                  text-shadow: 
                    0 0 20px #fbbf24,
                    0 0 30px #fbbf24,
                    0 0 40px #fbbf24,
                    0 0 50px #f59e0b;
                }
              }
            `}</style>
            <div key={animationKey} className="relative text-4xl font-decorative font-bold md:text-6xl lg:text-7xl" style={{ width: '100%', height: '150px' }}>
              {letters.map((letter, idx) => {
                const charWidth = letter.char === ' ' ? 1.5 : 1; // Wider space
                const offsetX = (idx - letters.length / 2) * charWidth;
                
                return (
                  <span
                    key={`${animationKey}-${idx}`}
                    className="absolute inline-block text-amber-300"
                    style={{
                      animation: `gather-${idx} 6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`,
                      animationDelay: `${idx * 0.1}s`,
                      left: '50%',
                      top: '50%',
                      textShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24, 0 0 30px #fbbf24',
                      fontSize: '1em',
                    }}
                  >
                    <style>{`
                      @keyframes gather-${idx} {
                        0% {
                          transform: translate(-50%, -50%) translate(${letter.initialX}vw, ${letter.initialY}vh) rotate(${letter.rotation}deg) scale(0.5);
                          opacity: 0;
                        }
                        30% {
                          opacity: 1;
                        }
                        100% {
                          transform: translate(-50%, -50%) translate(${offsetX}em, 0) rotate(0deg) scale(1);
                          opacity: 1;
                        }
                      }
                    `}</style>
                    {letter.char === ' ' ? '\u00A0' : letter.char}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
          
        {/* Join Card - Center Bottom */}
        <div className="flex justify-center px-4 pb-8 md:pb-12">
          <div className="w-full max-w-xs">
            <Card className="group relative overflow-hidden border-2 border-amber-400/40 bg-black/50 backdrop-blur-xl transition-all hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <CardHeader className="relative text-center pb-2 pt-4">
                <CardTitle className="font-cinzel text-xl text-amber-100">Join the Hunt</CardTitle>
              </CardHeader>
              
              <CardContent className="relative pt-1 pb-4">
                <Link to="/join">
                  <Button size="sm" className="w-full bg-amber-500 font-cinzel text-black shadow-lg hover:bg-amber-400">
                    Enter Code
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game 3 Link - Center Bottom */}
        <div className="flex justify-center px-4 pb-8 md:pb-12">
          <div className="w-full max-w-xs">
            <Link to="/game3">
              <Button size="sm" className="w-full bg-blue-500 font-cinzel text-white shadow-lg hover:bg-blue-400">
                Play Game 3
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-amber-400/20 bg-black/30 py-6 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-center gap-6 px-4">
            <p className="text-center text-sm text-amber-200/80">
              <span className="font-cinzel">Valar Morghulis</span> — All men must play
            </p>
            <button
              onClick={toggleMute}
              className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-amber-500/20 active:bg-amber-500/30"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-amber-200/70" />
              ) : (
                <Volume2 className="h-5 w-5 text-amber-400" />
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
