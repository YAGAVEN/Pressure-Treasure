import { useParams, useNavigate } from 'react-router-dom';
import Game3 from '@/components/Game3';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const Game3Page = () => {
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

    // Check if game is playing
    if (room.status !== 'playing') {
      toast({
        title: "Game Not Active",
        description: "The game must be active to play this challenge.",
        variant: "destructive",
      });
      navigate(`/game/${roomCode}`);
    }
  }, [room, currentPlayer, navigate, roomCode, toast]);

  const handleComplete = () => {
    completeChallenge(3); // Challenge 3
    toast({
      title: "Challenge Complete!",
      description: "You've conquered The Iron Path!",
    });
    navigate(`/game/${roomCode}`);
  };

  const handleCancel = () => {
    navigate(`/game/${roomCode}`);
  };

  if (!room || !currentPlayer) {
    return null;
  }

  return (
    <Game3 onComplete={handleComplete} onCancel={handleCancel} />
  );
};

export default Game3Page;
