import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Game1Challenge } from '@/components/Game1Challenge';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';

const Game1Page = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { currentPlayer, completeChallenge, getRoom } = useGame();
  const { toast } = useToast();
  const room = roomCode ? getRoom(roomCode) : undefined;

  console.log('[GAME1PAGE] Rendering - roomCode:', roomCode, 'room:', room, 'currentPlayer:', currentPlayer);

  useEffect(() => {
    console.log('[GAME1PAGE] useEffect - room:', room, 'currentPlayer:', currentPlayer);
    // Only redirect if we're sure there's no room/player after a delay
    // This prevents premature redirects during navigation
    const timeoutId = setTimeout(() => {
      if (!room || !currentPlayer) {
        console.log('[GAME1PAGE] ❌ No room or player after delay, redirecting to /join');
        navigate('/join');
      }
    }, 500);

    // Clear timeout if room/player become available
    if (room && currentPlayer) {
      clearTimeout(timeoutId);
      return;
    }

    return () => clearTimeout(timeoutId);
  }, [room, currentPlayer, navigate, roomCode]);

  // Separate effect to check game status
  useEffect(() => {
    if (!room || !currentPlayer) return;
    
    console.log('[GAME1PAGE] ✅ Room and player found, allowing access');

    // DISABLED FOR TESTING - Allow access even when game not started
    /* if (room.status !== 'playing') {
      toast({
        title: 'Game Not Active',
        description: 'The game must be active to play this challenge.',
        variant: 'destructive',
      });
      navigate(`/game/${roomCode}`);      return;
    } */

    // Check if challenge is locked - DISABLED FOR TESTING
    // if (currentPlayer.currentChallenge > 1 || currentPlayer.completedChallenges.includes(1)) {
    //   // Already completed or passed, allow access
    //   if (!currentPlayer.completedChallenges.includes(1) && currentPlayer.currentChallenge !== 1) {
    //     toast({
    //       title: "Challenge Locked",
    //       description: "Complete previous challenges first.",
    //       variant: "destructive",
    //     });
    //     navigate(`/game/${roomCode}`);
    //   }
    // }
  }, [room, currentPlayer, roomCode, toast]);

  const handleComplete = () => {
    completeChallenge(1);
    toast({
      title: 'Challenge Complete!',
      description: "You've completed the Trial of the First Men.",
    });
    navigate(`/game/${roomCode}`);
  };

  const handleCancel = () => {
    navigate(`/game/${roomCode}`);
  };

  if (!room || !currentPlayer) {
    console.log('[GAME1PAGE] Render blocked - waiting for room/player');
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  console.log('[GAME1PAGE] Rendering Game1Challenge component');

  // Lock the screen in fullscreen while the game is playing (only in production)
  useEffect(() => {
  if (!room || !currentPlayer || import.meta.env.DEV) return;

  let active = true;
  const elem = document.documentElement;

  const tryEnterFullscreen = async () => {
    if (!active || room.status !== 'playing' || document.fullscreenElement) return;
    try {
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if ((elem as any).mozRequestFullScreen) await (elem as any).mozRequestFullScreen();
      else if ((elem as any).webkitRequestFullscreen) await (elem as any).webkitRequestFullscreen();
      else if ((elem as any).msRequestFullscreen) await (elem as any).msRequestFullscreen();
    } catch (err) {
      // Ignore
    }
  };

  // Try once on mount
  tryEnterFullscreen();

  return () => {
    active = false;
  };
  }, [room, currentPlayer]);

  return <Game1Challenge onComplete={handleComplete} onCancel={handleCancel} />;
};

export default Game1Page;