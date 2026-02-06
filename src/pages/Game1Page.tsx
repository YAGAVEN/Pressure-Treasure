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
    if (!room || !currentPlayer) {
      console.log('[GAME1PAGE] ❌ No room or player, redirecting to /join');
      navigate('/join');
      return;
    }
    
    console.log('[GAME1PAGE] ✅ Room and player found - Game 1 is always accessible (first challenge)');
    // Game 1 is the first challenge - always accessible to all players
    // The fullscreen effect below will handle game state enforcement
  }, [room, currentPlayer, navigate, roomCode, toast]);

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

  // Lock the screen in fullscreen while the game is playing (best-effort).
  // It will try to re-enter fullscreen if the user exits (e.g., presses Escape)
  // and will stop (and exit fullscreen) when the room status becomes 'finished'.
  useEffect(() => {
  if (!room || !currentPlayer) return;

  let active = true;
  let attempts = 0;
  const maxAttempts = 8;
  const retryDelay = 500;
  const elem = document.documentElement;

  const tryEnterFullscreen = async () => {
    if (!active || room.status !== 'playing') return;
    try {
      if (document.fullscreenElement) return; // already fullscreen
      attempts++;
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if ((elem as any).mozRequestFullScreen) await (elem as any).mozRequestFullScreen();
      else if ((elem as any).webkitRequestFullscreen) await (elem as any).webkitRequestFullscreen();
      else if ((elem as any).msRequestFullscreen) await (elem as any).msRequestFullscreen();
    } catch (err) {
      // if request was blocked (browsers may require user gesture), retry a few times, then notify
      if (attempts < maxAttempts) {
        setTimeout(tryEnterFullscreen, retryDelay);
      } else {
        toast({
          title: 'Fullscreen Required',
          description: 'Please click or tap the screen to enter fullscreen for the best experience.',
        });
      }
    }
  };

  const handleFullscreenChange = () => {
    if (!active) return;
    const isFull = !!document.fullscreenElement;
    if (!isFull && room.status === 'playing') {
      // Small delay to let browser finish the exit then try to re-enter
      setTimeout(tryEnterFullscreen, 200);
    }
  };

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && room.status === 'playing') {
      // Prevent escape from allowing easy exit; best-effort — browsers may still override
      e.preventDefault();
      e.stopPropagation();
      tryEnterFullscreen();
    }
  };

  const visibilityHandler = () => {
    if (document.visibilityState === 'visible' && room.status === 'playing') {
      tryEnterFullscreen();
    }
  };

  // Start attempts
  tryEnterFullscreen();

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  // capture keydown at capture phase so we can try to prevent the default behavior
  document.addEventListener('keydown', keyHandler, true);
  document.addEventListener('visibilitychange', visibilityHandler);

  return () => {
    active = false;
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('keydown', keyHandler, true);
    document.removeEventListener('visibilitychange', visibilityHandler);

    // If game ended while we were active, exit fullscreen (best-effort)
    if (document.fullscreenElement) {
      const exitFS = async () => {
        try {
          if (document.exitFullscreen) await document.exitFullscreen();
          else if ((document as any).mozCancelFullScreen) await (document as any).mozCancelFullScreen();
          else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
          else if ((document as any).msExitFullscreen) await (document as any).msExitFullscreen();
        } catch (err) {
          // ignore
        }
      };
      exitFS();
    }
  };
  // Re-run when room status changes so we can stop when 'finished'
  }, [room, currentPlayer, toast]);

  return <Game1Challenge onComplete={handleComplete} onCancel={handleCancel} />;
};

export default Game1Page;