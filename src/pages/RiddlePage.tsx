import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiddleChallenge } from '@/components/RiddleChallenge';
import { DoorClosingAnimation } from '@/components/DoorClosingAnimation';
import { DoorOpeningAnimation } from '@/components/DoorOpeningAnimation';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Crown } from 'lucide-react';
import { HOUSE_NAMES } from '@/types/game';
import './RiddlePage.css';

// All questions embedded directly - no network fetch needed
const ALL_QUESTIONS = [
  {
    "id": 1,
    "riddle": "Neural networks are inspired by which human body part?",
    "answer": "BRAIN",
    "hint": "That one body part ppls in love lacks?."
  },
  {
    "id": 2,
    "riddle": "I am the brain's invisible friend, holding memories in ordered rows. Delete me and chaos unfolds. What am I?",
    "answer": "ARRAY",
    "hint": "Data structure"
  },
  {
    "id": 3,
    "riddle": "I store only the recent/ frequently accessed data. What am I?",
    "answer": "CACHE",
    "hint": "Fast storage"
  },
  {
    "id": 4,
    "riddle": "I guard the gates with questions three. Right answers pass, wrong ones flee. I stand between you and your data. What am I?",
    "answer": "LOGIN",
    "hint": "Access control"
  },
  {
    "id": 5,
    "riddle": "A circle's home where heads and tails both meet. Remove one end, join it back, and still I'm complete. What am I?",
    "answer": "QUEUE",
    "hint": "First in, first out"
  },
  {
    "id": 6,
    "riddle": "Last in, first out, I grow from the bottom. Push me down, pop me up. A tower of data. What am I?",
    "answer": "STACK",
    "hint": "Plates pile up"
  },
  {
    "id": 7,
    "riddle": "I branch like a tree but have no leaves. My roots spread data, my nodes hold keys. Search me wisely. What am I?",
    "answer": "GRAPH",
    "hint": "I have Nodes & edges"
  },
  {
    "id": 8,
    "riddle": "One becomes two, two becomes many. I repeat myself endlessly, calling my own name. Beware the infinite fall. What am I?",
    "answer": "LOOP",
    "hint": "Repeating code"
  },
  {
    "id": 9,
    "riddle": "I connect the disconnected, bridging worlds apart. Click a path and I'll transport you through hyperspace. What am I?",
    "answer": "LINK",
    "hint": "People often as in instagram comments"
  },
  {
    "id": 10,
    "riddle": "I speak in zeros and ones, the language of gods. Humans fear my tongue but machines obey. What am I?",
    "answer": "BINARY",
    "hint": "Two digits only"
  },
  {
    "id": 11,
    "riddle": "I help to arrange the data. What am I?",
    "answer": "SORTING",
    "hint": "Organizing data"
  },
  {
    "id": 12,
    "riddle": "I store the address of a data. What am I?",
    "answer": "POINTER",
    "hint": "Memory address & used to define by * in c/c++"
  },
  {
    "id": 13,
    "riddle": "I am a question that returns an answer. Feed me input, I give you output. Many call my name in code. What am I?",
    "answer": "FUNCTION",
    "hint": "Reusable code"
  },
  {
    "id": 14,
    "riddle": "Neither true nor false, I exist in emptiness. I am nothing, yet programmers fear me most. What am I?",
    "answer": "NULL",
    "hint": "No value"
  },
  {
    "id": 15,
    "riddle": "I convert the human tongue to machine language, translating dreams into reality, one line at a time. What am I?",
    "answer": "COMPILER",
    "hint": "Turbo C++ is a ??"
  },
  {
    "id": 35,
    "riddle": "I'm the brain within your computer. What am I?",
    "answer": "CPU",
    "hint": "Processes tasks..."
  },
  {
    "id": 16,
    "riddle": "Tiny yet powerful, I can be positive or negative. What am I?",
    "answer": "BIT",
    "hint": "Binary unit..."
  },
  {
    "id": 17,
    "riddle": "I am the universe's library, holding vast knowledge. What am I?",
    "answer": "DATABASE",
    "hint": "Stores data..."
  },
  {
    "id": 18,
    "riddle": "I sort by swapping neighbors. What am I?",
    "answer": "BUBBLE SORT",
    "hint": "Adjacent swaps..."
  },
  {
    "id": 19,
    "riddle": "I let teams edit code together. What am I?",
    "answer": "GIT",
    "hint": "Version control..."
  },
  {
    "id": 20,
    "riddle": "I'm a guardian of secrets, turning info unreadable. What am I?",
    "answer": "ENCRYPTION",
    "hint": "Secure data..."
  },
  {
    "id": 21,
    "riddle": "I care about spaces more than braces. Who am I?",
    "answer": "PYTHON",
    "hint": "Indentation matters..."
  },
  {
    "id": 22,
    "riddle": "I'm the keyword to define a class. What am I?",
    "answer": "CLASS",
    "hint": "OOP blueprint..."
  },
  {
    "id": 23,
    "riddle": "I uniquely identify a row in a table. What am I?",
    "answer": "PRIMARY KEY",
    "hint": "Unique ID..."
  },
  {
    "id": 24,
    "riddle": "I'm a tree where every level is fully filled left to right. What am I?",
    "answer": "COMPLETE BINARY TREE",
    "hint": "Heap structure..."
  },
  {
    "id": 25,
    "riddle": "I repeat code without copying it. What am I?",
    "answer": "LOOP",
    "hint": "Iteration..."
  },
  {
    "id": 26,
    "riddle": "I'm the fastest sort, but need sorted input. What am I?",
    "answer": "MERGE SORT",
    "hint": "Divide and merge..."
  },
  {
    "id": 27,
    "riddle": "I store key-value pairs for quick lookup. What am I?",
    "answer": "HASHMAP",
    "hint": "Fast access..."
  },
  {
    "id": 28,
    "riddle": "I'm the memory where variables live temporarily. What am I?",
    "answer": "STACK",
    "hint": "Function calls..."
  },
  {
    "id": 29,
    "riddle": "I'm the language of the web, run in browsers. What am I?",
    "answer": "JAVASCRIPT",
    "hint": "Frontend king..."
  },
  {
    "id": 30,
    "riddle": "I'm the fastest way to find duplicates. Who am I?",
    "answer": "HASHSET",
    "hint": "Unique elements..."
  },
  {
    "id": 31,
    "riddle": "Im the volatile memory type?",
    "answer": "RAM",
    "hint": "Temporary storage..."
  },
  {
    "id": 32,
    "riddle": "Starting computer proccess is called as?",
    "answer": "BOOTING",
    "hint": "System startup..."
  },
  {
    "id": 33,
    "riddle": "I'm the blueprint for objects. What am I?",
    "answer": "CLASS",
    "hint": "Object template..."
  },
  {
    "id": 34,
    "riddle": "I optimize queries in databases. What am I?",
    "answer": "INDEX",
    "hint": "Fast search..."
  },
  {
    "id": 36,
    "riddle": "I repeat code multiple times. I can count from 1 to 10. Users can control how many times I run. What am I?",
    "answer": "LOOP",
    "hint": "I help avoid writing the same code over and over."
  },
  {
    "id": 37,
    "riddle": "I am a process where systems learn patterns from examples and improve without being explicitly programmed. What am I?",
    "answer": "MACHINE LEARNING",
    "hint": "It's about learning from data."
  },
  {
    "id": 38,
    "riddle": "Im the most used OS in the world right now?",
    "answer": "WINDOWS",
    "hint": "Microsoft's operating system."
  },
  {
    "id": 39,
    "riddle": "I am inspired by how the human brain works and consist of connected units. What am I?",
    "answer": "NEURAL NETWORK",
    "hint": "Inspired by biological brains."
  },
  {
    "id": 40,
    "riddle": "I use many layers to learn complex patterns from data. What am I?",
    "answer": "DEEP LEARNING",
    "hint": "Multiple processing layers."
  },
  {
    "id": 41,
    "riddle": "I help machines understand human language and power chatbots and translators. What am I?",
    "answer": "NLP",
    "hint": "Natural language processing."
  },
  {
    "id": 42,
    "riddle": "I convert words into numbers while preserving meaning. What am I?",
    "answer": "EMBEDDING",
    "hint": "Words become vectors."
  },
  {
    "id": 43,
    "riddle": "Im the open source OS?",
    "answer": "LINUX",
    "hint": "Popular in servers and desktops."
  },
  {
    "id": 44,
    "riddle": "I group similar items together without labels. What am I?",
    "answer": "CLUSTERING",
    "hint": "Unsupervised grouping."
  },
  {
    "id": 45,
    "riddle": "I make machines act smart and intelligent. What am I?",
    "answer": "AI",
    "hint": "Rapidly growing field?"
  },
  {
    "id": 46,
    "riddle": "I predict numerical values like price or temperature. What am I?",
    "answer": "REGRESSION",
    "hint": "Predicting continuous values."
  },
  {
    "id": 47,
    "riddle": "I used to delete the previous character. What am I?",
    "answer": "BACKSPACE",
    "hint": "I'm in your keyboard."
  },
  {
    "id": 48,
    "riddle": "Physical components of a computer. What am I?",
    "answer": "HARDWARE",
    "hint": "Physical parts of a computer."
  },
  {
    "id": 49,
    "riddle": "I describe data like images, audio, and videos that don't fit into tables. What am I?",
    "answer": "UNSTRUCTURED DATA",
    "hint": "Not rows and columns."
  },
  {
    "id": 50,
    "riddle": "Learning with labeled data is called what?",
    "answer": "SUPERVISED LEARNING",
    "hint": "Answers are provided during training."
  },
  {
    "id": 51,
    "riddle": "AI that talks like humans and answers questions is called what?",
    "answer": "CHATBOT",
    "hint": "ChatGPT is one."
  },
  {
    "id": 52,
    "riddle": "A neural network that learns from past or sequential data is called what?",
    "answer": "RNN",
    "hint": "Learn from feedback?"
  },
  {
    "id": 54,
    "riddle": "1024 bytes make up what unit of digital information?",
    "answer": "KILOBYTE",
    "hint": "1000 grams are also called by the same name."
  },
  {
    "id": 55,
    "riddle": "I'm the Web Protocol?",
    "answer": "HTTP",
    "hint": "You can see me in the 1st few letters of link in browser."
  },
  {
    "id": 56,
    "riddle": "I'm the error in the code?",
    "answer": "BUG",
    "hint": "People often say that I can fly."
  },
  {
    "id": 57,
    "riddle": "I'm the query language for databases?",
    "answer": "SQL",
    "hint": "Used to manage data in RDBMS."
  },
  {
    "id": 58,
    "riddle": "I'm the computer memory that can be read and changed?",
    "answer": "RAM",
    "hint": "Volatile memory."
  },
  {
    "id": 59,
    "riddle": "I'm the non-volatile memory that stores data permanently?",
    "answer": "HARD DRIVE",
    "hint": "Long-term storage."
  },
  {
    "id": 60,
    "riddle": "I'm the language used to style web pages?",
    "answer": "CSS",
    "hint": "Used in HTML to style."
  },
  {
    "id": 61,
    "riddle": "I'm the Malicious software?",
    "answer": "VIRUS",
    "hint": "Even humans can get me."
  },
  {
    "id": 62,
    "riddle": "I'm the Protecting software?",
    "answer": "Antivirus",
    "hint": "Protects against viruses."
  }
];

// Helper function to select 10 random unique questions
const getRandomQuestions = () => {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
};

const RiddlePage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { getRoom, currentPlayer, completeChallenge } = useGame();
  const { toast } = useToast();
  const [selectedQuestions] = useState(() => getRandomQuestions());
  const [showDoorClosingAnimation, setShowDoorClosingAnimation] = useState(false);
  const [showDoorOpeningAnimation, setShowDoorOpeningAnimation] = useState(false);
  
  const room = roomCode ? getRoom(roomCode) : undefined;

  useEffect(() => {
    if (!room || !currentPlayer) {
      navigate('/join');
      return;
    }

    if (room.status !== 'playing') {
      toast({
        title: "Game Not Active",
        description: "The game must be active to play this challenge.",
        variant: "destructive",
      });
      navigate(`/game/${roomCode}`);
      return;
    }

    // Check if challenge is locked (challenge 2 requires challenge 1 to be completed)
    if (currentPlayer.currentChallenge < 2) {
      toast({
        title: "Challenge Locked",
        description: "Complete challenge 1 first.",
        variant: "destructive",
      });
      navigate(`/game/${roomCode}`);
    }
  }, [room, currentPlayer, navigate, roomCode, toast]);

  if (!room || !currentPlayer) {
    return null;
  }

  const handleComplete = () => {
    // Complete challenge #2
    completeChallenge(2);
    
    // Navigate back to the game immediately
    navigate(`/game/${roomCode}`);
  };

  const handleBack = () => {
    navigate(`/game/${roomCode}`);
  };

  return (
    <div 
      className="w-full flex flex-col bg-cover bg-center bg-fixed bg-no-repeat relative overflow-hidden"
      style={{ minHeight: '100vh', minHeight: '100dvh' }}
      style={{
        backgroundImage: 'url(/winterfell-bg.jpg)',
      }}
    >
      {/* Enhanced Color Grading Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[2] bg-gradient-to-b from-blue-900/20 via-slate-900/30 to-blue-950/40" />
      
      {/* Door Closing Animation on First Load - Entering */}
      {showDoorClosingAnimation && (
        <DoorClosingAnimation onAnimationComplete={() => setShowDoorClosingAnimation(false)} />
      )}
      
      {/* Door Opening Animation on Complete - Exiting */}
      {showDoorOpeningAnimation && (
        <DoorOpeningAnimation onAnimationComplete={() => {
          // Navigate immediately when door animation completes
          navigate(`/game/${roomCode}`);
        }} />
      )}

      {/* Animated Snowfall Overlay */}
      <div className="snowfall">
        {Array.from({ length: 200 }).map((_, i) => (
          <div key={i} className="snowflake" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${12 + Math.random() * 6}s`,
            opacity: Math.random() * 0.5 + 0.4,
          }}>
            ❄
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-blue-400/20 bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-md shadow-lg shadow-blue-500/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400/40">
              <Crown className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-cinzel font-semibold text-white">{room.name}</p>
              <p className="text-xs text-blue-300">{HOUSE_NAMES[room.houseTheme]}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Page Layout */}
      <main className="flex-1 w-full px-4 py-8 flex items-center justify-center relative z-10">
        <div className="w-full max-w-4xl space-y-8">
          {/* Page Title Card */}
          <div className="rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70 backdrop-blur-xl p-8 shadow-2xl shadow-cyan-500/30">
            <h1 className="font-cinzel text-2xl font-bold text-center text-white drop-shadow-lg mb-2">
              Challenge #2: Riddle of the Maester
            </h1>
            <p className="text-center text-cyan-200 text-sm">
              Solve the cryptic riddles passed down through generations of the Citadel's wisest scholars.
            </p>
          </div>

          {/* Riddle Challenge Component */}
          <RiddleChallenge 
            onComplete={handleComplete}
            disabled={room.status !== 'playing'}
            preloadedQuestions={selectedQuestions}
          />

          {/* Back Button */}
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hunt
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiddlePage;
