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
  options?: string[];
}

interface RiddleChallengeProps {
  onComplete: () => void;
  disabled?: boolean;
  preloadedQuestions?: Question[];
  allAvailableQuestions?: Question[];
}

export const RiddleChallenge = ({ onComplete, disabled = false, preloadedQuestions, allAvailableQuestions }: RiddleChallengeProps) => {
  const [allQuestions, setAllQuestions] = useState<Question[]>(preloadedQuestions || []);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(preloadedQuestions || []);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<number>>(
    new Set(preloadedQuestions?.map(q => q.id) || [])
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [completed, setCompleted] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isInPenalty, setIsInPenalty] = useState(false);
  const [penaltyTimeLeft, setPenaltyTimeLeft] = useState(0);

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

  // Handle penalty timer countdown
  useEffect(() => {
    if (!isInPenalty || penaltyTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setPenaltyTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsInPenalty(false);
          // Move to next question after penalty expires
          if (currentIndex + 1 < selectedQuestions.length) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setShowHint(false);
            setFeedback(null);
            setWrongAttempts(0);
          } else {
            onComplete();
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInPenalty, penaltyTimeLeft, currentIndex, selectedQuestions.length, onComplete]);

  useEffect(() => {
    // Only fetch if questions weren't preloaded
    if (preloadedQuestions && preloadedQuestions.length > 0) {
      setAllQuestions(preloadedQuestions);
      setSelectedQuestions(preloadedQuestions);
      setUsedQuestionIds(new Set(preloadedQuestions.map(q => q.id)));
    } else {
      fetch('/questions.json')
        .then(res => res.json())
        .then((questions: Question[]) => {
          setAllQuestions(questions);
          const shuffled = [...questions].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, 10);
          setSelectedQuestions(selected);
          setUsedQuestionIds(new Set(selected.map(q => q.id)));
        })
        .catch(err => console.error('Failed to load questions:', err));
    }
  }, [preloadedQuestions]);

  // Helper function to get a random question from unused questions
  const getRandomUnusedQuestion = (): Question | null => {
    const availablePool = allAvailableQuestions || allQuestions;
    const unusedQuestions = availablePool.filter(q => !usedQuestionIds.has(q.id));
    
    if (unusedQuestions.length === 0) return null;
    
    const randomQuestion = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
    return randomQuestion;
  };

  // Helper function to replace a question with a new random one
  const replaceQuestionAtIndex = (indexToReplace: number) => {
    const newQuestion = getRandomUnusedQuestion();
    if (!newQuestion) return; // No more unused questions available

    // Update the question at the current index
    const updated = [...selectedQuestions];
    const oldQuestionId = updated[indexToReplace].id;
    
    // Remove old question ID from used set and add new one
    const newUsedIds = new Set(usedQuestionIds);
    newUsedIds.delete(oldQuestionId);
    newUsedIds.add(newQuestion.id);
    
    // Shuffle options for the new question
    const questionWithShuffledOptions = {
      ...newQuestion,
      options: newQuestion.options ? [...newQuestion.options].sort(() => Math.random() - 0.5) : []
    };
    
    updated[indexToReplace] = questionWithShuffledOptions;
    
    setSelectedQuestions(updated);
    setUsedQuestionIds(newUsedIds);
  };

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
          setWrongAttempts(0);
        }
      }, 1500);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleOptionClick = (option: string) => {
    if (feedback || disabled || isInPenalty) return;
    
    const isCorrect = option.toUpperCase() === currentQuestion.answer.toUpperCase();
    setUserAnswer(option);
    
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
          setWrongAttempts(0); // Reset counter only on correct answer
        }
      }, 1500);
    } else {
      // User clicked wrong option
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);
      
      if (newWrongAttempts >= 4) {
        // 4 wrong attempts - show 10-second penalty timer
        setFeedback('incorrect');
        setIsInPenalty(true);
        setPenaltyTimeLeft(10);
      } else if (newWrongAttempts === 2) {
        // 2 wrong attempts - replace this question with a new one from unused pool
        // IMPORTANT: Don't reset wrongAttempts here, let it accumulate to 4 for penalty
        setFeedback('incorrect');
        
        setTimeout(() => {
          replaceQuestionAtIndex(currentIndex);
          setUserAnswer('');
          setShowHint(false);
          setFeedback(null);
          // Do NOT reset wrongAttempts - it accumulates to trigger penalty at 4
        }, 1500);
      } else {
        // 1st or 3rd wrong attempt - show feedback and let user retry
        setFeedback('incorrect');
        setTimeout(() => setFeedback(null), 1500);
      }
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

  return (
    <>
      {!isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-xl bg-background/95 backdrop-blur border border-border p-6 text-center">
            <p className="font-semibold text-lg">Fullscreen Required</p>
            <p className="text-sm text-muted-foreground mt-2">You must enter fullscreen to play. Click below to enter fullscreen.</p>
            <div className="mt-4">
              <Button onClick={enterFullscreen}>Enter Fullscreen</Button>
            </div>
          </div>
        </div>
      )}
      <Card className={cn("w-full border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/40 via-blue-900/30 to-slate-900/40 backdrop-blur-xl shadow-2xl shadow-cyan-500/30", !isFullscreen && 'pointer-events-none opacity-50')}>
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

        {/* Answer Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-cyan-300 text-sm">Choose the best answer:</p>
            {wrongAttempts > 0 && wrongAttempts < 4 && (
              <span className="text-xs font-semibold text-orange-400">
                ⚠️ {wrongAttempts}/4 wrong attempts
              </span>
            )}
            {wrongAttempts >= 4 && !isInPenalty && (
              <span className="text-xs font-semibold text-red-500">
                🚨 PENALTY TRIGGERED!
              </span>
            )}
            {isInPenalty && penaltyTimeLeft > 0 && (
              <span className="text-xs font-semibold text-red-400 animate-pulse">
                ⏱️ Wait {penaltyTimeLeft} seconds
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options && currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                disabled={disabled || feedback !== null || isInPenalty}
                className={cn(
                  "p-4 rounded-xl font-semibold text-sm transition-all border-2 backdrop-blur-md",
                  isInPenalty ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105 active:scale-95",
                  userAnswer === option
                    ? feedback === 'correct'
                      ? "border-green-500/80 bg-gradient-to-r from-green-900/80 to-emerald-900/80 text-green-100 shadow-lg shadow-green-500/50"
                      : feedback === 'incorrect'
                      ? "border-red-500/80 bg-gradient-to-r from-red-900/80 to-rose-900/80 text-red-100 shadow-lg shadow-red-500/50"
                      : "border-cyan-400/80 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white shadow-lg shadow-cyan-500/60"
                    : "border-cyan-400/30 bg-slate-800/40 text-cyan-100 hover:border-cyan-400/60 hover:bg-slate-800/60"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {feedback === 'correct' && (
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-900/70 to-emerald-900/70 border-2 border-green-500/60 p-4 text-green-100 backdrop-blur-md shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span className="font-semibold text-sm">Correct! Moving to next riddle...</span>
          </div>
        )}
        
        {feedback === 'incorrect' && !isInPenalty && (
          <div className="rounded-xl bg-gradient-to-r from-red-900/70 to-rose-900/70 border-2 border-red-500/60 p-4 text-red-100 backdrop-blur-md shadow-lg">
            <span className="font-semibold text-sm">You know Nothing, Jon Snow!!</span>
          </div>
        )}

        {isInPenalty && penaltyTimeLeft > 0 && (
          <div className="rounded-xl bg-gradient-to-r from-red-900/80 to-rose-900/80 border-2 border-red-500/80 p-6 text-red-100 backdrop-blur-md shadow-lg text-center">
            <p className="font-semibold text-lg mb-3">Skill Issue bro!!</p>
            <p className="text-3xl font-bold text-yellow-300 animate-pulse">{penaltyTimeLeft}</p>
            <p className="text-sm mt-3">Please wait before answering again...</p>
          </div>
        )}
      </CardContent>
      </Card>
    </>
  );
};