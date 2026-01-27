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
  preloadedQuestions?: Question[];
}

export const RiddleChallenge = ({ onComplete, disabled = false, preloadedQuestions }: RiddleChallengeProps) => {
  const [allQuestions, setAllQuestions] = useState<Question[]>(preloadedQuestions || []);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    // Only fetch if questions weren't preloaded
    if (preloadedQuestions && preloadedQuestions.length > 0) {
      setAllQuestions(preloadedQuestions);
      const shuffled = [...preloadedQuestions].sort(() => Math.random() - 0.5);
      setSelectedQuestions(shuffled.slice(0, 10));
    } else {
      fetch('/questions.json')
        .then(res => res.json())
        .then((questions: Question[]) => {
          setAllQuestions(questions);
          const shuffled = [...questions].sort(() => Math.random() - 0.5);
          setSelectedQuestions(shuffled.slice(0, 10));
        })
        .catch(err => console.error('Failed to load questions:', err));
    }
  }, [preloadedQuestions]);

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
    <Card className="w-full border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/40 via-blue-900/30 to-slate-900/40 backdrop-blur-xl shadow-2xl shadow-cyan-500/30">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-cyan-400" />
            <CardTitle className="font-cinzel text-white drop-shadow-lg">Riddle of the Maester</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-cyan-600/70 text-white border-cyan-400/50 font-cinzel">
            {completed} / {selectedQuestions.length}
          </Badge>
        </div>
        <CardDescription className="text-cyan-300">
          Solve the ancient riddles of computer science
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-slate-700/60">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-400/60"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Riddle */}
        <div className="rounded-xl bg-gradient-to-br from-slate-800/70 to-blue-900/60 border-2 border-cyan-400/30 p-6 backdrop-blur-md">
          <p className="font-medium leading-relaxed text-blue-50 text-xl">{currentQuestion.riddle}</p>
        </div>

        {/* Hint Button */}
        {!showHint && (
          <Button
            size="sm"
            onClick={() => setShowHint(true)}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/40 rounded-lg font-semibold"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Show Hint
          </Button>
        )}

        {/* Hint */}
        {showHint && (
          <div className="rounded-xl border-2 border-cyan-400/50 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-5 backdrop-blur-md">
            <p className="text-sm text-cyan-100">
              <span className="font-semibold text-cyan-300">Hint:</span> {currentQuestion.hint}
            </p>
          </div>
        )}

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-cyan-300">
              <span className="font-medium">Your Answer ({answerLength} letters)</span>
              <span className="font-mono font-semibold">{userAnswer.length} / {answerLength}</span>
            </div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
              placeholder="TYPE YOUR ANSWER..."
              className={cn(
                "font-mono tracking-widest text-center uppercase py-4 bg-slate-900/80 border-2 border-cyan-500/60 text-cyan-100 placeholder-cyan-600/70 backdrop-blur-md rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/60 transition-all shadow-md",
                feedback === 'correct' && "border-green-500/80 bg-gradient-to-r from-green-900/80 to-emerald-900/80 text-green-100 focus:border-green-400 focus:ring-green-500/50",
                feedback === 'incorrect' && "border-red-500/80 bg-gradient-to-r from-red-900/80 to-rose-900/80 text-red-100 focus:border-red-400 focus:ring-red-500/50"
              )}
              disabled={disabled || feedback === 'correct'}
              maxLength={20}
              autoFocus
            />
          </div>

          {/* Feedback */}
          {feedback === 'correct' && (
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-900/70 to-emerald-900/70 border-2 border-green-500/60 p-4 text-green-100 backdrop-blur-md shadow-lg">
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              <span className="font-semibold text-sm">Correct! Moving to next riddle...</span>
            </div>
          )}
          
          {feedback === 'incorrect' && (
            <div className="rounded-xl bg-gradient-to-r from-red-900/70 to-rose-900/70 border-2 border-red-500/60 p-4 text-red-100 backdrop-blur-md shadow-lg">
              <span className="font-semibold text-sm">You know Nothing, Jon Snow!!</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-cinzel bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-cyan-500/40 rounded-lg font-bold"
            disabled={disabled || !userAnswer.trim() || feedback === 'correct'}
          >
            Submit Answer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
