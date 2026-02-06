import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiddleChallenge } from '@/components/RiddleChallenge';
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
    "hint": "That one body part ppls in love lacks?.",
    "options": ["BRAIN", "HEART", "NERVE", "SPINAL CORD"]
  },
  {
    "id": 2,
    "riddle": "I am the brain's invisible friend, holding memories in ordered rows. Delete me and chaos unfolds. What am I?",
    "answer": "ARRAY",
    "hint": "Data structure",
    "options": ["ARRAY", "LINKED LIST", "TREE", "VECTOR"]
  },
  {
    "id": 3,
    "riddle": "I store only the recent/ frequently accessed data. What am I?",
    "answer": "CACHE",
    "hint": "Fast storage",
    "options": ["CACHE", "BUFFER", "QUEUE", "STACK"]
  },
  {
    "id": 4,
    "riddle": "I guard the gates with questions three. Right answers pass, wrong ones flee. I stand between you and your data. What am I?",
    "answer": "LOGIN",
    "hint": "1st step to access account",
    "options": ["LOGIN", "PASSWORD", "CIPHER", "AUTHENTICATION"]
  },
  {
    "id": 5,
    "riddle": "A circle's home where heads and tails both meet. Remove one end, join it back, and still I'm complete. What am I?",
    "answer": "QUEUE",
    "hint": "First in, first out",
    "options": ["QUEUE", "DEQUE", "STACK", "BUFFER"]
  },
  {
    "id": 6,
    "riddle": "Last in, first out, I grow from the bottom. Push me down, pop me up. A tower of data. What am I?",
    "answer": "STACK",
    "hint": "Plates pile up",
    "options": ["STACK", "HEAP", "QUEUE", "ARRAY"]
  },
  {
    "id": 7,
    "riddle": "I branch like a tree but have no leaves. My roots spread data, my nodes hold keys. Search me wisely. What am I?",
    "answer": "GRAPH",
    "hint": "I have Nodes & edges",
    "options": ["GRAPH", "TREE", "MATRIX", "NODE"]
  },
  {
    "id": 8,
    "riddle": "One becomes two, two becomes many. I repeat myself endlessly, calling my own name. Beware the infinite fall. What am I?",
    "answer": "LOOP",
    "hint": "Repeating code",
    "options": ["LOOP", "FUNCTION", "ITERATION", "RECURSION"]
  },
  {
    "id": 9,
    "riddle": "I connect the disconnected, bridging worlds apart. Click a path and I'll transport you through hyperspace. What am I?",
    "answer": "LINK",
    "hint": "People often as in instagram comments",
    "options": ["LINK", "URL", "ANCHOR", "HYPERLINK"]
  },
  {
    "id": 10,
    "riddle": "I speak in zeros and ones, the language of gods. Humans fear my tongue but machines obey. What am I?",
    "answer": "BINARY",
    "hint": "Two digits only",
    "options": ["BINARY", "DECIMAL", "HEXADECIMAL", "OCTAL"]
  },
  {
    "id": 11,
    "riddle": "I help to arrange the data. What am I?",
    "answer": "SORTING",
    "hint": "Organizing data",
    "options": ["SORTING", "SEARCHING", "FILTERING", "MAPPING"]
  },
  {
    "id": 12,
    "riddle": "I store the address of a data. What am I?",
    "answer": "POINTER",
    "hint": "Memory address & used to define by * in c/c++",
    "options": ["POINTER", "REFERENCE", "ADDRESS", "VARIABLE"]
  },
  {
    "id": 13,
    "riddle": "I am a question that returns an answer. Feed me input, I give you output. Many call my name in code. What am I?",
    "answer": "FUNCTION",
    "hint": "Reusable code",
    "options": ["FUNCTION", "METHOD", "PROCEDURE", "SUBROUTINE"]
  },
  {
    "id": 14,
    "riddle": "Neither true nor false, I exist in emptiness. I am nothing, yet programmers fear me most. What am I?",
    "answer": "NULL",
    "hint": "No value",
    "options": ["NULL", "VOID", "UNDEFINED", "ZERO"]
  },
  {
    "id": 15,
    "riddle": "I convert the human tongue to machine language, translating dreams into reality, one line at a time. What am I?",
    "answer": "COMPILER",
    "hint": "Turbo C++ is a ??",
    "options": ["COMPILER", "INTERPRETER", "ASSEMBLER", "LINKER"]
  },
  {
    "id": 35,
    "riddle": "I'm the brain within your computer. What am I?",
    "answer": "CPU",
    "hint": "Processes tasks...",
    "options": ["CPU", "GPU", "RAM", "MOTHERBOARD"]
  },
  {
    "id": 16,
    "riddle": "Tiny yet powerful, I can be positive or negative. What am I?",
    "answer": "BIT",
    "hint": "Binary unit...",
    "options": ["BIT", "BYTE", "PIXEL", "NIBBLE"]
  },
  {
    "id": 17,
    "riddle": "I am the universe's library, holding vast knowledge. What am I?",
    "answer": "DATABASE",
    "hint": "Stores data...",
    "options": ["DATABASE", "CACHE", "STORAGE", "WAREHOUSE"]
  },
  {
    "id": 18,
    "riddle": "I sort by swapping neighbors. What am I?",
    "answer": "BUBBLE SORT",
    "hint": "Adjacent swaps...",
    "options": ["BUBBLE SORT", "QUICK SORT", "INSERTION SORT", "SELECTION SORT"]
  },
  {
    "id": 19,
    "riddle": "I let teams edit code together. What am I?",
    "answer": "GIT",
    "hint": "Version control...",
    "options": ["GIT", "SVN", "GITHUB", "GITLAB"]
  },
  {
    "id": 20,
    "riddle": "I'm a guardian of secrets, turning info unreadable. What am I?",
    "answer": "ENCRYPTION",
    "hint": "Secure data...",
    "options": ["ENCRYPTION", "DECRYPTION", "COMPRESSION", "ENCODING"]
  },
  {
    "id": 21,
    "riddle": "I care about spaces more than braces. Who am I?",
    "answer": "PYTHON",
    "hint": "Indentation matters...",
    "options": ["PYTHON", "JAVA", "C++", "JAVASCRIPT"]
  },
  {
    "id": 22,
    "riddle": "I'm the keyword to define a class. What am I?",
    "answer": "CLASS",
    "hint": "OOP blueprint...",
    "options": ["CLASS", "STRUCT", "INTERFACE", "OBJECT"]
  },
  {
    "id": 23,
    "riddle": "I uniquely identify a row in a table. What am I?",
    "answer": "PRIMARY KEY",
    "hint": "Unique ID...",
    "options": ["PRIMARY KEY", "FOREIGN KEY", "COMPOSITE KEY", "CANDIDATE KEY"]
  },
  {
    "id": 24,
    "riddle": "I'm a tree where every level is fully filled left to right. What am I?",
    "answer": "COMPLETE BINARY TREE",
    "hint": "Heap structure...",
    "options": ["COMPLETE BINARY TREE", "PERFECT BINARY TREE", "BALANCED BINARY TREE", "FULL BINARY TREE"]
  },
  {
    "id": 25,
    "riddle": "I repeat code without copying it. What am I?",
    "answer": "LOOP",
    "hint": "Iteration...",
    "options": ["LOOP", "CONDITIONAL", "FUNCTION", "STATEMENT"]
  },
  {
    "id": 26,
    "riddle": "I'm the fastest sort, but need sorted input. What am I?",
    "answer": "MERGE SORT",
    "hint": "Divide and merge...",
    "options": ["MERGE SORT", "QUICK SORT", "HEAP SORT", "INSERTION SORT"]
  },
  {
    "id": 27,
    "riddle": "I store key-value pairs for quick lookup. What am I?",
    "answer": "HASHMAP",
    "hint": "Fast access...",
    "options": ["HASHMAP", "HASHTABLE", "DICTIONARY", "ARRAY"]
  },
  {
    "id": 28,
    "riddle": "I'm the memory where variables live temporarily. What am I?",
    "answer": "STACK",
    "hint": "Function calls...",
    "options": ["STACK", "HEAP", "CACHE", "REGISTER"]
  },
  {
    "id": 29,
    "riddle": "I'm the language of the web, run in browsers. What am I?",
    "answer": "JAVASCRIPT",
    "hint": "Frontend king...",
    "options": ["JAVASCRIPT", "PYTHON", "JAVA", "TYPESCRIPT"]
  },
  {
    "id": 30,
    "riddle": "I'm the fastest way to find duplicates. Who am I?",
    "answer": "HASHSET",
    "hint": "Unique elements...",
    "options": ["HASHSET", "ARRAY", "LINKEDLIST", "TREE"]
  },
  {
    "id": 31,
    "riddle": "Im the volatile memory type?",
    "answer": "RAM",
    "hint": "Temporary storage...",
    "options": ["RAM", "ROM", "HARD DRIVE", "SSD"]
  },
  {
    "id": 32,
    "riddle": "Starting computer proccess is called as?",
    "answer": "BOOTING",
    "hint": "System startup...",
    "options": ["BOOTING", "LOADING", "INITIALIZING", "LAUNCHING"]
  },
  {
    "id": 33,
    "riddle": "I'm the blueprint for objects. What am I?",
    "answer": "CLASS",
    "hint": "Object template...",
    "options": ["CLASS", "OBJECT", "INSTANCE", "INTERFACE"]
  },
  {
    "id": 34,
    "riddle": "I optimize queries in databases. What am I?",
    "answer": "INDEX",
    "hint": "Fast search...",
    "options": ["INDEX", "KEY", "CONSTRAINT", "SCHEMA"]
  },
  {
    "id": 36,
    "riddle": "I repeat code multiple times. I can count from 1 to 10. Users can control how many times I run. What am I?",
    "answer": "LOOP",
    "hint": "I help avoid writing the same code over and over.",
    "options": ["LOOP", "CONDITIONAL", "FUNCTION", "RECURSION"]
  },
  {
    "id": 37,
    "riddle": "I am a process where systems learn patterns from examples and improve without being explicitly programmed. What am I?",
    "answer": "MACHINE LEARNING",
    "hint": "It's about learning from data.",
    "options": ["MACHINE LEARNING", "DEEP LEARNING", "NEURAL NETWORK", "AI"]
  },
  {
    "id": 38,
    "riddle": "Im the most used OS in the world right now?",
    "answer": "WINDOWS",
    "hint": "Microsoft's operating system.",
    "options": ["WINDOWS", "MACOS", "LINUX", "ANDROID"]
  },
  {
    "id": 39,
    "riddle": "I am inspired by how the human brain works and consist of connected units. What am I?",
    "answer": "NEURAL NETWORK",
    "hint": "Inspired by biological brains.",
    "options": ["NEURAL NETWORK", "DECISION TREE", "RANDOM FOREST", "SVM"]
  },
  {
    "id": 40,
    "riddle": "I use many layers to learn complex patterns from data. What am I?",
    "answer": "DEEP LEARNING",
    "hint": "Multiple processing layers.",
    "options": ["DEEP LEARNING", "MACHINE LEARNING", "NEURAL NETWORK", "AI"]
  },
  {
    "id": 41,
    "riddle": "I help machines understand human language and power chatbots and translators. What am I?",
    "answer": "NLP",
    "hint": "Natural language processing.",
    "options": ["NLP", "NLU", "SPEECH RECOGNITION", "COMPUTER VISION"]
  },
  {
    "id": 42,
    "riddle": "I convert words into numbers while preserving meaning. What am I?",
    "answer": "EMBEDDING",
    "hint": "Words become vectors.",
    "options": ["EMBEDDING", "TOKENIZATION", "ENCODING", "VECTORIZATION"]
  },
  {
    "id": 43,
    "riddle": "Im the open source OS?",
    "answer": "LINUX",
    "hint": "Popular in servers and desktops.",
    "options": ["LINUX", "WINDOWS", "MACOS", "UNIX"]
  },
  {
    "id": 44,
    "riddle": "I group similar items together without labels. What am I?",
    "answer": "CLUSTERING",
    "hint": "Unsupervised grouping.",
    "options": ["CLUSTERING", "CLASSIFICATION", "REGRESSION", "ANOMALY DETECTION"]
  },
  {
    "id": 45,
    "riddle": "I make machines act smart and intelligent. What am I?",
    "answer": "AI",
    "hint": "Rapidly growing field?",
    "options": ["AI", "ML", "DL", "ROBOTICS"]
  },
  {
    "id": 46,
    "riddle": "I predict numerical values like price or temperature. What am I?",
    "answer": "REGRESSION",
    "hint": "Predicting continuous values.",
    "options": ["REGRESSION", "CLASSIFICATION", "CLUSTERING", "PREDICTION"]
  },
  {
    "id": 47,
    "riddle": "I used to delete the previous character. What am I?",
    "answer": "BACKSPACE",
    "hint": "I'm in your keyboard.",
    "options": ["BACKSPACE", "DELETE", "ENTER", "ESCAPE"]
  },
  {
    "id": 48,
    "riddle": "Physical components of a computer. What am I?",
    "answer": "HARDWARE",
    "hint": "Physical parts of a computer.",
    "options": ["HARDWARE", "SOFTWARE", "FIRMWARE", "MIDDLEWARE"]
  },
  {
    "id": 49,
    "riddle": "I describe data like images, audio, and videos that don't fit into tables. What am I?",
    "answer": "UNSTRUCTURED DATA",
    "hint": "Not rows and columns.",
    "options": ["UNSTRUCTURED DATA", "STRUCTURED DATA", "SEMI-STRUCTURED DATA", "RAW DATA"]
  },
  {
    "id": 50,
    "riddle": "Learning with labeled data is called what?",
    "answer": "SUPERVISED LEARNING",
    "hint": "Answers are provided during training.",
    "options": ["SUPERVISED LEARNING", "UNSUPERVISED LEARNING", "REINFORCEMENT LEARNING", "TRANSFER LEARNING"]
  },
  {
    "id": 51,
    "riddle": "AI that talks like humans and answers questions is called what?",
    "answer": "CHATBOT",
    "hint": "ChatGPT is one.",
    "options": ["CHATBOT", "BOT", "ASSISTANT", "AGENT"]
  },
  {
    "id": 52,
    "riddle": "A neural network that learns from past or sequential data is called what?",
    "answer": "RNN",
    "hint": "Learn from feedback?",
    "options": ["RNN", "CNN", "LSTM", "GRU"]
  },
  {
    "id": 54,
    "riddle": "1024 bytes make up what unit of digital information?",
    "answer": "KILOBYTE",
    "hint": "1000 grams are also called by the same name.",
    "options": ["KILOBYTE", "MEGABYTE", "GIGABYTE", "BYTE"]
  },
  {
    "id": 55,
    "riddle": "I'm the Web Protocol?",
    "answer": "HTTP",
    "hint": "You can see me in the 1st few letters of link in browser.",
    "options": ["HTTP", "HTTPS", "FTP", "SMTP"]
  },
  {
    "id": 56,
    "riddle": "I'm the error in the code?",
    "answer": "BUG",
    "hint": "People often say that I can fly.",
    "options": ["BUG", "ERROR", "EXCEPTION", "CRASH"]
  },
  {
    "id": 57,
    "riddle": "I'm the query language for databases?",
    "answer": "SQL",
    "hint": "Used to manage data in RDBMS.",
    "options": ["SQL", "NOSQL", "MONGODB", "PYTHON"]
  },
  {
    "id": 58,
    "riddle": "I'm the computer memory that can be read and changed?",
    "answer": "RAM",
    "hint": "Volatile memory.",
    "options": ["RAM", "ROM", "CACHE", "REGISTER"]
  },
  {
    "id": 59,
    "riddle": "I'm the non-volatile memory that stores data permanently?",
    "answer": "HARD DRIVE",
    "hint": "Long-term storage.",
    "options": ["HARD DRIVE", "SSD", "FLASH DRIVE", "OPTICAL DRIVE"]
  },
  {
    "id": 60,
    "riddle": "I'm the language used to style web pages?",
    "answer": "CSS",
    "hint": "Used in HTML to style.",
    "options": ["CSS", "HTML", "JAVASCRIPT", "XML"]
  },
  {
    "id": 61,
    "riddle": "I'm the Malicious software?",
    "answer": "VIRUS",
    "hint": "Even humans can get me.",
    "options": ["VIRUS", "ANTIVIRUS", "MALWARE", "RANSOMWARE"]
  },
  {
    "id": 62,
    "riddle": "I'm the Protecting software?",
    "answer": "ANTIVIRUS",
    "hint": "Protects against viruses.",
    "options": ["ANTIVIRUS", "VIRUS", "MALWARE", "FIREWALL"]
  }
];

// Helper function to select 10 random unique questions from all 60+ available questions
const getRandomQuestions = () => {
  // Shuffle all questions and take first 10
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  // Return 10 random questions with shuffled options
  return shuffled.slice(0, 10).map(question => ({
    ...question,
    options: question.options ? [...question.options].sort(() => Math.random() - 0.5) : []
  }));
};

const RiddlePage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { getRoom, currentPlayer, completeChallenge } = useGame();
  const { toast } = useToast();
  const [selectedQuestions] = useState(() => getRandomQuestions());
  
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

    // Check if challenge is locked (challenge 2 requires challenge 1 to be completed) - DISABLED FOR TESTING
    // if (currentPlayer.currentChallenge < 2) {
    //   toast({
    //     title: "Challenge Locked",
    //     description: "Complete challenge 1 first.",
    //     variant: "destructive",
    //   });
    //   navigate(`/game/${roomCode}`);
    // }
  }, [room, currentPlayer, navigate, roomCode, toast]);

  // Attempt to enter fullscreen when the game starts (best-effort, respects user/browser preferences)
  useEffect(() => {
    if (!room || !currentPlayer || room.status !== 'playing') return;

    let userExitedFullscreen = false;
    const elem = document.documentElement;

    const tryEnterFullscreen = async () => {
      // Don't retry if user explicitly exited fullscreen
      if (userExitedFullscreen || document.fullscreenElement) return;
      
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
      } catch (err) {
        // Fullscreen request failed - respect browser/user preference
        console.log('Fullscreen request declined');
      }
    };

    const handleFullscreenChange = () => {
      // If user exits fullscreen, respect their choice and don't force re-entry
      if (!document.fullscreenElement) {
        userExitedFullscreen = true;
      }
    };

    // Try once when game starts playing
    tryEnterFullscreen();
    
    // Listen for fullscreen changes to track user preference
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [room, currentPlayer]);

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
            allAvailableQuestions={ALL_QUESTIONS}
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