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

  useEffect(() => {
    if (!room || !currentPlayer) {
      navigate('/join');
      return;
    }

    if (room.status !== 'playing') {
      toast({
        title: 'Game Not Active',
        description: 'The game must be active to play this challenge.',
        variant: 'destructive',
      });
      navigate(`/game/${roomCode}`);      return;
    }

    // All challenges unlocked - no lock checking
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
    return null;
  }

  return <Game1Challenge onComplete={handleComplete} onCancel={handleCancel} />;
};

export default Game1Page;
