import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Flame, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { game5Story } from '@/data/game5Story';

interface Game5ChallengeProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const Game5Challenge = ({ onComplete, onCancel }: Game5ChallengeProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const accepted = useMemo(
    () => new Set(game5Story.acceptedAnswers.map(answer => answer.trim().toLowerCase())),
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = userAnswer.trim().toLowerCase();
    if (!normalized) return;

    if (accepted.has(normalized)) {
      setFeedback('correct');
      onComplete();
    } else {
      setFeedback('incorrect');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
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
          className="w-full max-w-4xl"
        >
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-primary" />
                  <CardTitle className="font-cinzel text-2xl">{game5Story.title}</CardTitle>
                </div>
                <span className="text-sm font-cinzel text-muted-foreground">Final Challenge</span>
              </div>
              <CardDescription>
                A short tale now, a grand saga later.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/40 p-4">
                {game5Story.story.map((line, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(prev => !prev)}
                className="gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>

              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="bg-muted/50 border-2">
                    <CardContent className="pt-6">
                      <p className="text-sm italic text-muted-foreground">
                        "{game5Story.hint}"
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium">
                  {game5Story.question}
                </label>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter a character name..."
                  className={cn(
                    "text-base",
                    feedback === 'correct' && "border-green-500 bg-green-50",
                    feedback === 'incorrect' && "border-red-500 bg-red-50"
                  )}
                />

                {feedback === 'correct' && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Correct. The realm accepts your claim.</span>
                  </div>
                )}

                {feedback === 'incorrect' && (
                  <div className="rounded-lg bg-red-50 p-3 text-red-700">
                    <span className="font-semibold">Not quite. Speak a true name of the realm.</span>
                  </div>
                )}

                <div className="flex gap-3">
                  {onCancel && (
                    <Button variant="outline" onClick={onCancel} className="flex-1">
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 font-cinzel gap-2">
                    Claim the Throne
                    <Flame className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
