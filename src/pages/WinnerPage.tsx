import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, Medal, Sparkles, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const WinnerPage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { currentPlayer, getRoom, getPlayersInRoom } = useGame();
  const room = roomCode ? getRoom(roomCode) : undefined;
  const players = roomCode ? getPlayersInRoom(roomCode) : [];

  useEffect(() => {
    if (!room || !currentPlayer) {
      navigate('/join');
      return;
    }
  }, [room, currentPlayer, navigate]);

  // Get top 3 winners sorted by completion time
  const topWinners = players
    .filter(p => p.completedAt !== null)
    .sort((a, b) => {
      if (a.completedAt === null) return 1;
      if (b.completedAt === null) return -1;
      return a.completedAt - b.completedAt;
    })
    .slice(0, 3);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-16 h-16 text-amber-400" />;
      case 2:
        return <Medal className="w-14 h-14 text-slate-400" />;
      case 3:
        return <Medal className="w-12 h-12 text-amber-700" />;
      default:
        return <Trophy className="w-10 h-10 text-slate-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-amber-500 to-yellow-600';
      case 2:
        return 'from-slate-300 to-slate-500';
      case 3:
        return 'from-amber-700 to-amber-900';
      default:
        return 'from-slate-400 to-slate-600';
    }
  };

  const getRankText = (rank: number) => {
    switch (rank) {
      case 1:
        return '1st Place - Champion';
      case 2:
        return '2nd Place - Runner-up';
      case 3:
        return '3rd Place - Third Place';
      default:
        return `${rank}th Place`;
    }
  };

  if (!room || !currentPlayer) {
    return null;
  }

  const isWinner = topWinners.some(w => w.id === currentPlayer.id);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/images/background2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Animated sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: -20,
              opacity: 0 
            }}
            animate={{ 
              y: window.innerHeight + 20,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            <Sparkles className="w-6 h-6 text-amber-400" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl relative z-10"
      >
        <Card className="border-4 border-amber-500 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="flex justify-center mb-4"
            >
              <Trophy className="w-24 h-24 text-amber-400 animate-pulse" />
            </motion.div>
            <CardTitle className="font-cinzel text-5xl text-amber-100 mb-3">
              The Treasure is Found!
            </CardTitle>
            <p className="text-xl text-amber-200 font-medium">
              Congratulations to our Champions
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            {/* Top 3 Winners Display */}
            <div className="space-y-4">
              {topWinners.map((winner, index) => {
                const rank = index + 1;
                const isCurrentPlayer = winner.id === currentPlayer.id;
                
                return (
                  <motion.div
                    key={winner.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Card 
                      className={cn(
                        'border-2 shadow-lg transition-all',
                        rank === 1 && 'border-amber-400 bg-gradient-to-r from-amber-900/40 to-yellow-900/40',
                        rank === 2 && 'border-slate-400 bg-gradient-to-r from-slate-800/40 to-slate-700/40',
                        rank === 3 && 'border-amber-700 bg-gradient-to-r from-amber-900/30 to-amber-800/30',
                        isCurrentPlayer && 'ring-4 ring-green-500'
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          {/* Rank Icon */}
                          <motion.div
                            animate={{ 
                              rotate: rank === 1 ? [0, -10, 10, -10, 0] : 0,
                              scale: rank === 1 ? [1, 1.1, 1] : 1
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: rank === 1 ? Infinity : 0,
                              repeatDelay: 1
                            }}
                          >
                            {getRankIcon(rank)}
                          </motion.div>

                          {/* Winner Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-amber-100">
                                {winner.username}
                              </h3>
                              {isCurrentPlayer && (
                                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                                  You!
                                </span>
                              )}
                            </div>
                            <p className={cn(
                              'text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent',
                              getRankColor(rank)
                            )}>
                              {getRankText(rank)}
                            </p>
                          </div>

                          {/* Trophy Count */}
                          <div className="text-right">
                            <div className="text-3xl font-bold text-amber-300">
                              #{rank}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Treasure Display */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10"
            >
              <Card className="bg-gradient-to-br from-amber-900/60 to-yellow-900/60 border-2 border-amber-400 shadow-2xl">
                <CardContent className="p-10 text-center">
                  <div className="mb-6">
                    <img 
                      src="/images/treasure.png" 
                      alt="Treasure" 
                      className="w-64 h-64 mx-auto object-contain"
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <h2 className="text-4xl font-cinzel text-amber-100 mb-4">
                    🏆 The Iron Throne Treasure 🏆
                  </h2>
                  <p className="text-xl text-amber-200 leading-relaxed max-w-2xl mx-auto">
                    {isWinner 
                      ? "You have proven your worth and claimed your place among the legends. The realm remembers your name!"
                      : "Well fought! Though the treasure belongs to the champions, your effort honors the game."
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mt-8">
              <Button
                onClick={() => navigate(`/game/${roomCode}`)}
                size="lg"
                variant="outline"
                className="gap-2 text-lg border-2 border-amber-400 text-amber-100 hover:bg-slate-700"
              >
                <Home className="w-5 h-5" />
                Back to Game Lobby
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WinnerPage;
