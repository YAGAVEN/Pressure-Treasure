import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Flame, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { game5Stories } from '@/data/game5Story';

interface Game5ChallengeProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const Game5Challenge = ({ onComplete, onCancel }: Game5ChallengeProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

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

  // Select a random story once when component mounts
  const game5Story = useMemo(
    () => game5Stories[Math.floor(Math.random() * game5Stories.length)],
    []
  );

  const accepted = useMemo(
    () => new Set(game5Story.acceptedAnswers.map(answer => answer.trim().toLowerCase())),
    [game5Story]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = userAnswer.trim().toLowerCase();
    if (!normalized) return;

    if (accepted.has(normalized)) {
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
  };

  const handleContinue = () => {
    if (feedback === 'correct') {
      if (document.fullscreenElement) onComplete();
      // otherwise ignore until fullscreen
    }
  };

  return (
    <div 
      className="flex items-center justify-center p-4"
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        backgroundImage: 'url(/images/background2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="game5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className={"w-full max-w-6xl" + (!isFullscreen ? ' pointer-events-none' : '')}
        >

        {!isFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-xl bg-background/95 backdrop-blur border border-border p-6 text-center">
              <p className="font-semibold text-lg">Fullscreen Required</p>
              <p className="text-sm text-muted-foreground mt-2">You must enter fullscreen to play this final challenge. Click below to enter fullscreen.</p>
              <div className="mt-4">
                <Button onClick={enterFullscreen}>Enter Fullscreen</Button>
              </div>
            </div>
          </div>
        )}
          <Card className="border-4 border-primary shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-amber-400" />
                  <CardTitle className="font-cinzel text-4xl text-amber-100">{game5Story.title}</CardTitle>
                </div>
                <span className="text-base font-cinzel text-amber-300 font-semibold">Final Challenge</span>
              </div>
              <CardDescription className="text-lg text-amber-200 mt-3">
                A short tale now, a grand saga later.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4 rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-slate-800 to-slate-700 p-8 shadow-lg">
                {game5Story.story.map((line, index) => (
                  <p key={index} className="text-lg leading-relaxed text-slate-100 font-medium">
                    {line}
                  </p>
                ))}
              </div>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowHint(prev => !prev)}
                className="gap-2 text-amber-300 hover:text-amber-100 hover:bg-slate-700"
              >
                <Lightbulb className="w-5 h-5" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>

              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="bg-gradient-to-r from-amber-900/40 to-amber-800/40 border-2 border-amber-400/50 shadow-lg">
                    <CardContent className="pt-6">
                      <p className="text-lg italic text-amber-100 font-medium">
                        "{game5Story.hint}"
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block text-xl font-semibold text-amber-100">
                  {game5Story.question}
                </label>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                  placeholder="Enter your answer..."
                  className={cn(
                    "text-xl py-6 px-5 bg-slate-700 text-white border-2 border-amber-500/50 placeholder:text-slate-400 focus:border-amber-400",
                    feedback === 'correct' && "border-green-500 bg-green-900/50 text-green-100",
                    feedback === 'incorrect' && "border-red-500 bg-red-900/50 text-red-100"
                  )}
                />

                {feedback === 'correct' && (
                  <div className="flex items-center gap-3 rounded-xl bg-green-900/80 border-2 border-green-400 p-5 text-green-100 shadow-lg">
                    <CheckCircle2 className="h-7 w-7" />
                    <span className="font-semibold text-lg">Correct. The realm accepts your claim.</span>
                  </div>
                )}

                {feedback === 'incorrect' && (
                  <div className="rounded-xl bg-red-900/80 border-2 border-red-400 p-5 text-red-100 shadow-lg">
                    <span className="font-semibold text-lg">Not quite. Speak a true name of the realm.</span>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  {onCancel && (
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={onCancel} 
                      className="flex-1 text-lg py-6 border-2 border-amber-400 text-amber-100 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                  )}
                  {feedback === 'correct' ? (
                    <Button 
                      type="button"
                      onClick={handleContinue} 
                      className="flex-1 font-cinzel gap-2 text-lg py-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                    >
                      Continue to Victory
                      <Flame className="w-6 h-6" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="flex-1 font-cinzel gap-2 text-lg py-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                    >
                      Claim the Throne
                      <Flame className="w-6 h-6" />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
