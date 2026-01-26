import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: number;
  riddle: string;
  answer: string;
  hint: string;
}

interface RiddleChallengeProps {
  onComplete: () => void;
  disabled?: boolean;
}

export const RiddleChallenge = ({ onComplete, disabled = false }: RiddleChallengeProps) => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then((questions: Question[]) => {
        setAllQuestions(questions);
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        setSelectedQuestions(shuffled.slice(0, 10));
      })
      .catch(err => console.error('Failed to load questions:', err));
  }, []);

  const currentQuestion = selectedQuestions[currentIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentQuestion || disabled) return;

    const isCorrect = userAnswer.trim().toUpperCase() === currentQuestion.answer.toUpperCase();
    
    if (isCorrect) {
      setFeedback('correct');
      setCompleted(prev => prev + 1);
      
      setTimeout(() => {
        if (currentIndex + 1 >= selectedQuestions.length) {
          onComplete();
        } else {
          setCurrentIndex(prev => prev + 1);
          setUserAnswer('');
          setShowHint(false);
          setFeedback(null);
        }
      }, 1500);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading riddles...</p>
        </CardContent>
      </Card>
    );
  }

  const progress = (completed / selectedQuestions.length) * 100;
  const answerLength = currentQuestion.answer.length;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="font-cinzel">Riddle of the Maester</CardTitle>
          </div>
          <Badge variant="secondary">
            {completed} / {selectedQuestions.length}
          </Badge>
        </div>
        <CardDescription>
          Solve the ancient riddles of computer science
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-muted">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Riddle */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="font-medium leading-relaxed">{currentQuestion.riddle}</p>
        </div>

        {/* Hint Button */}
        {!showHint && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHint(true)}
            className="w-full"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Show Hint
          </Button>
        )}

        {/* Hint */}
        {showHint && (
          <div className="rounded-lg border border-primary/50 bg-primary/5 p-3">
            <p className="text-sm">
              <span className="font-semibold">Hint:</span> {currentQuestion.hint}
            </p>
          </div>
        )}

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Your Answer ({answerLength} letters)</span>
              <span className="font-mono">{userAnswer.length} / {answerLength}</span>
            </div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
              placeholder="Type your answer..."
              className={cn(
                "font-mono text-lg tracking-wider text-center uppercase",
                feedback === 'correct' && "border-green-500 bg-green-50",
                feedback === 'incorrect' && "border-red-500 bg-red-50"
              )}
              disabled={disabled || feedback === 'correct'}
              maxLength={20}
              autoFocus
            />
          </div>

          {/* Feedback */}
          {feedback === 'correct' && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Correct! Moving to next riddle...</span>
            </div>
          )}
          
          {feedback === 'incorrect' && (
            <div className="rounded-lg bg-red-50 p-3 text-red-700">
              <span className="font-semibold">Not quite. Try again!</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-cinzel"
            disabled={disabled || !userAnswer.trim() || feedback === 'correct'}
          >
            Submit Answer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
