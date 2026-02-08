import { useState, useEffect } from 'react';
import { compareTwoStrings } from 'string-similarity';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Crown, Lightbulb, ChevronRight, Flame } from 'lucide-react';
import { game4Levels, type Game4Level } from '@/data/game4Levels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Game4ChallengeProps {
  onComplete: () => void;
  onCancel?: () => void;
}

const AccuracyMeter = ({ accuracy }: { accuracy: number }) => {
  const [displayAccuracy, setDisplayAccuracy] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayAccuracy(accuracy);
    }, 100);
    return () => clearTimeout(timer);
  }, [accuracy]);

  const getFeedbackMessage = () => {
    if (accuracy < 30) return "The night is dark and full of terrors...";
    if (accuracy < 50) return "You know nothing, Jon Snow.";
    if (accuracy < 70) return "A mind needs books like a sword needs a whetstone.";
    if (accuracy < 80) return "Winter is coming... but so are you.";
    return "The old gods favor you!";
  };

  const getBarColor = () => {
    if (accuracy < 50) return 'bg-red-600';
    if (accuracy < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Accuracy</span>
        <span className="text-sm font-bold text-primary">
          {Math.round(displayAccuracy)}%
        </span>
      </div>
      
      <div className="relative h-6 bg-muted rounded-full overflow-hidden border-2">
        <div
          className={`h-full transition-all duration-500 ease-out ${getBarColor()} relative`}
          style={{ width: `${displayAccuracy}%` }}
        >
          {accuracy >= 90 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-center italic text-muted-foreground">
        {getFeedbackMessage()}
      </p>
    </div>
  );
};

export const Game4Challenge = ({ onComplete, onCancel }: Game4ChallengeProps) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => !!(typeof document !== 'undefined' && document.fullscreenElement));

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enterFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).mozRequestFullScreen) {
        await (el as any).mozRequestFullScreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      } else if ((el as any).msRequestFullscreen) {
        await (el as any).msRequestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  };

  const currentLevel: Game4Level = game4Levels[currentLevelIndex];
  const totalLevels = game4Levels.length;

  // Stopwords to exclude from scoring
  const stopwords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
    'these', 'those', 'it', 'its', 'his', 'her', 'their', 'them', 'he',
    'she', 'they', 'we', 'you', 'i', 'me', 'my', 'your', 'our', 'who',
    'what', 'where', 'when', 'why', 'how', 'which', 'while', 'against',
    'made', 'sitting', 'showing'
  ]);

  useEffect(() => {
    if (userInput.trim()) {
      const userText = userInput.toLowerCase().trim();
      
      // Calculate points-based bag of words score
      const userWords = userText.split(/\s+/);
      const bagOfWordsLower = currentLevel.bagOfWords.map(w => w.toLowerCase());
      
      // Filter out stopwords and get unique words only
      const uniqueUserWords = [...new Set(userWords)].filter(word => !stopwords.has(word));
      
      // Count matched words - each unique word gives 5 points
      const matchedWords = uniqueUserWords.filter(word => 
        bagOfWordsLower.includes(word)
      );
      
      const pointsEarned = matchedWords.length * 10;
      const maxPoints = 100; // Cap at 100 points
      const accuracyPercent = Math.min(pointsEarned, maxPoints);
      
      setAccuracy(accuracyPercent);
      setCanProceed(accuracyPercent >= 90);
    } else {
      setAccuracy(0);
      setCanProceed(false);
    }
  }, [userInput, currentLevel.bagOfWords]);

  const handleNextLevel = () => {
    if (!canProceed) return;

    if (currentLevelIndex < totalLevels - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setUserInput('');
      setAccuracy(0);
      setShowHint(false);
      setCanProceed(false);
    } else {
      // Completed all levels
      if (isFullscreen) onComplete();
      // otherwise ignore completion until fullscreen
    }
  };

  return (
    <div className="flex items-center justify-center bg-medieval-pattern p-4 min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLevel.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className={"w-full max-w-4xl" + (!isFullscreen ? ' pointer-events-none' : '')}
        >

        {!isFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-xl bg-background/95 backdrop-blur border border-border p-6 text-center">
              <p className="font-semibold text-lg">Fullscreen Required</p>
              <p className="text-sm text-muted-foreground mt-2">You must enter fullscreen to play this trial. Click below to enter fullscreen.</p>
              <div className="mt-4">
                <Button onClick={enterFullscreen}>Enter Fullscreen</Button>
              </div>
            </div>
          </div>
        )}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sword className="w-6 h-6 text-primary" />
                  <CardTitle className="font-cinzel text-2xl">The Maester's Trial</CardTitle>
                </div>
                <span className="text-lg font-cinzel text-muted-foreground">
                  Level {currentLevel.id} of {totalLevels}
                </span>
              </div>
              <Progress value={(currentLevelIndex / totalLevels) * 100} className="h-2" />
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Image */}
              <div className="relative rounded-lg overflow-hidden border-4 border-border">
                <img
                  src={currentLevel.image}
                  alt={`Level ${currentLevel.id}`}
                  className="w-full h-auto max-h-96 object-cover"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNhYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>

              {/* Hint Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>

              {/* Hint */}
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="bg-muted/50 border-2">
                    <CardContent className="pt-6">
                      <p className="text-sm italic text-muted-foreground">
                        "{currentLevel.hint}"
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Input */}
              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  Describe what you see:
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Begin your description here..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary
                    transition-all resize-none"
                />

                {/* Accuracy Meter */}
                {userInput && <AccuracyMeter accuracy={accuracy} />}

                {/* Feedback Message */}
                {accuracy >= 80 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-lg font-cinzel text-green-600 dark:text-green-400"
                  >
                    ✓ The old gods favor you. Proceed, Maester.
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {onCancel && (
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleNextLevel}
                    disabled={!canProceed}
                    className={cn(
                      'flex-1 font-cinzel gap-2',
                      !canProceed && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {currentLevelIndex < totalLevels - 1 ? 'Next Trial' : 'Complete Quest'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Victory Modal - shown after last level */}
          {currentLevelIndex === totalLevels - 1 && accuracy >= 90 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="max-w-md text-center border-2 border-primary">
                <CardContent className="pt-6 space-y-6">
                  <Crown className="w-24 h-24 mx-auto text-primary animate-pulse" />
                  <CardTitle className="text-4xl font-cinzel">
                    Knight of the Seven Kingdoms
                  </CardTitle>
                  <CardDescription className="text-lg">
                    You have proven your worth, Maester. The realm is in your debt.
                  </CardDescription>
                  <Button
                    onClick={onComplete}
                    className="w-full font-cinzel text-lg py-6"
                  >
                    Complete Challenge
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
