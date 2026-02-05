import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiddleChallenge } from '@/components/RiddleChallenge';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft, Crown } from 'lucide-react';
import { HOUSE_NAMES } from '@/types/game';
import './RiddlePage.css';

// All questions embedded directly - no network fetch needed
const ALL_QUESTIONS = [
  {
    "id": 1,
    "riddle": "I am a biological wonder that inspired artificial intelligence. Neural networks mimic my structure of connected units that process information. Scientists created computer systems based on how I work. When people fall in love, they say they lose me. Which crucial human body part am I?",
    "answer": "BRAIN",
    "hint": "That one body part ppls in love lacks?."
  },
  {

    "id": 2,
    "riddle": "I am a list where each item is stored in a sequence and can be accessed using an index number. I store multiple values under a single name. I make handling large amounts of data easier. What am I?",
    "hint": "I stores multiple values in a single variable.",
    "answer": "ARRAY"
  },
  {
    "id": 3,
    "riddle": "I am a small but mighty storage system that remembers the most recent and frequently used data. By keeping important information nearby, I help computers work much faster. Without me, retrieving data would be slow and painful. I am every computer's secret speed booster. What am I?",
    "answer": "CACHE",
    "hint": "Fast storage"
  },
  {
    "id": 4,
    "riddle": "I guard the gates with questions three. Right answers pass, wrong ones flee. I stand between you and your data. What am I?",
    "answer": "LOGIN",
    "hint": "1st step to access account"
  },
   {
    "id": 5,
    "riddle": "I define a relationship where one class acquires the properties and behaviors of another class. I support code reuse and establish hierarchy in object-oriented programming. Who am I?",
    "hint": "Parent–child class relationship.",
    "answer": "INHERITANCE"
  },
  {
    "id": 6,
    "riddle": "I represent a value that is assigned once and cannot be changed during program execution. I help protect data from accidental modification. What am I?",
    "hint": "Value never changes.",
    "answer": "CONSTANT"
  },
  {
    "id": 7,
    "riddle": "I branch like a tree but have no leaves. My roots spread data, my nodes hold keys. Search me wisely. What am I?",
    "answer": "GRAPH",
    "hint": "I have Nodes & edges"
  },
  {
    
    "id": 8,
    "riddle": "I divide a large problem into smaller reusable blocks. Each block performs a specific task and can be called again and again. I improve readability, reduce redundancy, and help manage complex programs efficiently. What am I?",
    "hint": "I am a reusable block of code.",
    "answer": "FUNCTION"}
  ,
  {
    "id": 9,
    "riddle": "I am born when a program starts and disappear when it ends. I can store numbers, text, or even decisions. My value can change while the program is running, and every programmer depends on me to remember things. Without me, calculations and logic would forget everything. Who am I?",
    "hint": "I am used to store data temporarily during program execution.",
    "answer": "VARIABLE"
  },
  {
    "id": 10,
    "riddle": "I speak in zeros and ones, the language of gods. Humans fear my tongue but machines obey. What am I?",
    "answer": "BINARY",
    "hint": "Two digits only"
  },
  {
    "id": 11,
    "riddle": "I am a fundamental operation in computing where data is arranged in a specific order. I can organize numbers from smallest to largest, or sort names alphabetically. Without me, finding information would be chaotic and time-consuming. Programmers rely on me constantly to make data organized and searchable. What am I?",
    "answer": "SORTING",
    "hint": "Order the data"
  },
  {
    "id": 12,
    "riddle": "I am a special variable that does not hold data itself, but instead holds the memory address where data is stored. In C and C++, I am marked with a special symbol. I allow programmers to access and manipulate data indirectly. What am I?",
    "answer": "POINTER",
    "hint": "Memory address & used to define by * in c/c++"
  },
  {
    "id": 13,
    "riddle": "I am a set of instructions written in a language that computers understand. Humans write me using logic and rules, and machines execute me without questioning. I can solve problems, play games, and control machines. Without me, a computer is just a box of hardware. What am I?",
    "hint": "I is written using programming languages.",
    "answer": "PROGRAM"
  },
  {
    "id": 14,
    "riddle": "Neither true nor false, I exist in emptiness. I am nothing, yet programmers fear me most. What am I?",
    "answer": "NULL",
    "hint": "No value"
  },
  {
    "id": 15,
    "riddle": "I translate the entire program into machine language before execution. I create a separate file and execute faster once translation is complete. Errors are shown only after the full program is checked. What am I?",
    "hint": "I translate the whole program at once.",
    "answer": "COMPILER"
  },
  {
    "id": 16,
    "riddle": "I am the central processing unit, the true brain of your computer. Every calculation, every decision, and every operation flows through me. I execute millions of instructions per second and determine how fast your system runs. Without me, your computer would be just an empty shell with no processing power. What am I?",
    "answer": "CPU",
    "hint": "Processes tasks..."
  },
  {
    "id": 17,
    "riddle": "I am the smallest unit of information in computing. I am either 0 or 1, representing off or on, false or true. Though tiny individually, millions of me combine to form all digital data in the world. Every file, every image, every piece of information is made from countless copies of me. What am I?",
    "answer": "BIT",
    "hint": "Binary unit..."
  },
  {
    "id": 18,
    "riddle": "I am a digital library that stores vast amounts of organized information. Businesses, governments, and websites rely on me to keep track of everything from customers to inventory to transactions. I arrange data in tables and relationships so that information can be found quickly and efficiently. What am I?",
    "answer": "DATABASE",
    "hint": "Stores data..."
  },
  {
    "id": 19,
    "riddle": "I am a sorting algorithm that works by repeatedly stepping through the list and comparing adjacent elements. If they are in the wrong order, I swap them. I continue this process until no more swaps are needed. Though simple to understand, I am not the fastest method for large datasets. What am I?",
    "answer": "BUBBLE SORT",
    "hint": "Adjacent swaps..."
  },
  {
    "id": 20,
    "riddle": "I am a version control system that allows multiple developers to work on the same project simultaneously. I track every change made to code, allowing teams to collaborate seamlessly and revert to previous versions if needed. Major platforms like GitHub and GitLab are built on me. What am I?",
    "answer": "GIT",
    "hint": "Version control..."
  },
  {
    "id": 21,
    "riddle": "I am a security process that transforms readable information into an unreadable format using complex mathematical algorithms. Only those with the correct key can decode me and access the original data. I protect sensitive information like passwords, credit cards, and personal messages from hackers. What am I?",
    "answer": "ENCRYPTION",
    "hint": "Secure data..."
  },
  {
    "id": 22,
    "riddle": "I am a programming language known for my clean and readable syntax. My defining feature is that I use indentation and whitespace to define code blocks instead of curly braces. Beginners love me for being easy to learn, and professionals use me for data science and artificial intelligence. Who am I?",
    "answer": "PYTHON",
    "hint": "Indentation matters..."
  },
  {
    "id": 23,
    "riddle": "I am a fundamental concept in object-oriented programming that serves as a blueprint for creating objects. I define the properties and behaviors that objects of my type will have. Without me, programmers would struggle to organize complex code in a structured way. What am I?",
    "answer": "CLASS",
    "hint": "OOP blueprint..."
  },
  {
    "id": 24,
    "riddle": "I am a special field in a database table that uniquely identifies each row. No two rows can have the same value for me. I ensure data integrity and make it possible to retrieve specific records quickly. What am I?",
    "answer": "PRIMARY KEY",
    "hint": "Unique ID..."
  },
  {
    "id": 25,
    "riddle": "I am a special type of binary tree where all levels are completely filled except possibly the last level, which is filled from left to right. I am frequently used to implement heaps and priority queues efficiently. What am I?",
    "answer": "COMPLETE BINARY TREE",
    "hint": "Heap structure..."
  },
  {
    "id": 26,
    "riddle": "I help you repeat the same task again and again without rewriting the same code. I continue until a certain condition tells me to stop. I save time, reduce effort, and make programs shorter and smarter. What concept am I?",
    "hint": "I am used for repetition in programming.",
    "answer": "LOOP"
  },
  {
    "id": 27,
    "riddle": "I am a sorting algorithm that uses a divide-and-conquer approach. I split the unsorted list into smaller pieces, sort them individually, and then merge them back together in order. I guarantee efficiency even in worst-case scenarios and am widely used in practice. What am I?",
    "answer": "MERGE SORT",
    "hint": "Divide and merge..."
  },
  {
    "id": 28,
    "riddle": "I am a data structure that maps keys to values using a hash function to compute an index. This allows me to look up, insert, and delete elements in nearly constant time. I am essential for building fast and efficient programs. What am I?",
    "answer": "HASHMAP",
    "hint": "Fast access..."
  },
  {
    "id": 29,
    "riddle": "I am a region of memory used to store local variables and function call information. I follow a Last-In-First-Out structure, meaning the most recently added item is the first to be removed. When a function is called, data is pushed onto me, and when it returns, data is popped off. What am I?",
    "answer": "STACK",
    "hint": "Function calls..."
  },
  {
    "id": 30,
    "riddle": "I am the programming language that powers the interactive features of websites. Every modern browser runs me natively, allowing developers to create dynamic web pages and powerful web applications. I can run both on the client-side in browsers and server-side with Node.js. What am I?",
    "answer": "JAVASCRIPT",
    "hint": "Frontend king..."
  },
  {
    "id": 31,
    "riddle": "I am a type of computer memory that is very fast but loses all its data when the power is turned off. I store the data that your computer is currently using or processing. The more of me you have, the more programs your computer can run smoothly. What am I?",
    "answer": "RAM",
    "hint": "Temporary storage..."
  },
  {
    "id": 32,
    "riddle": "I am the process that happens when you turn on your computer. The system loads the operating system from storage into memory and prepares all hardware components to work. This process happens every time you press the power button until the desktop is fully ready. What am I?",
    "answer": "BOOTING",
    "hint": "System startup..."
  },
   {
    "id": 33,
    "riddle": "I am a decision-maker in a program. I check a condition and choose one path if it is true and another if it is false. Because of me, programs can think logically instead of running blindly. Who am I?",
    "hint": "I am used for decision making in programs.",
    "answer": "IF ELSE"
  },
  {
    "id": 34,
    "riddle": "I translate high-level language into machine language line by line. If I find an error, I stop immediately and show it. I do not create a separate file. Who am I?",
    "hint": "I convert code line by line.",
    "answer": "INTERPRETER"
  },
  {
    "id": 36,
    "riddle": "I repeat code multiple times. I can count from 1 to 10. Users can control how many times I run. What am I?",
    "answer": "LOOP",
    "hint": "I help avoid writing the same code over and over."
  },
  {
    "id": 37,
    "riddle": "I am a subset of artificial intelligence where computer systems learn and improve from experience without being explicitly programmed. I analyze patterns in data, identify trends, and make predictions. Every recommendation you see online is powered by me. What am I?",
    "answer": "MACHINE LEARNING",
    "hint": "It's about learning from data."
  },
  {
    "id": 38,
    "riddle": "I am the most popular operating system in the world, developed by Microsoft. Billions of computers use me for work, gaming, and entertainment. I have been the dominant OS for personal computers since the 1990s. What am I?",
    "answer": "WINDOWS",
    "hint": "Microsoft's operating system."
  },
   {
    "id": 66,
    "riddle": "I am a step-by-step procedure used to solve a problem. I am written before coding begins. I help programmers think logically and plan solutions clearly. What am I?",
    "hint": "I am the foundation before writing a program.",
    "answer": "ALGORITHM"
  },
 {
    "id": 67,
    "riddle": "I am a visual way to represent the flow of a program using symbols and arrows. I show how control moves from start to end. I help beginners understand logic easily. Who am I?",
    "hint": "I use shapes like oval, diamond, and rectangle.",
    "answer": "FLOWCHART"
  },
   {
    "id": 68,
    "riddle": "I follow a strict order where the first element added is the first one to be removed. I am commonly used in scheduling systems, printer queues, and real-life waiting lines. Which data structure represents me?",
    "hint": "FIFO principle.",
    "answer": "QUEUE"
  },
  {
    "id": 41,
    "riddle": "I am a field of artificial intelligence that focuses on making computers understand and process human language in a meaningful way. I power translation tools, voice assistants, sentiment analysis, and chatbots. Through me, machines can comprehend context, grammar, and meaning. What am I?",
    "answer": "NLP",
    "hint": "Natural language processing."
  },
   {
    "id": 13,
    "riddle": "I store data in a structured order, but I remove the most recently added element first. I am widely used in undo operations, expression evaluation, and function calls. Who am I?",
    "hint": "LIFO principle.",
    "answer": "STACK"
  },
  {
    "id": 43,
    "riddle": "I am a free and open-source operating system that was created by Linus Torvalds. I power most of the world's servers, supercomputers, and Android devices. My source code is available for anyone to view, modify, and distribute. What am I?",
    "answer": "LINUX",
    "hint": "Popular in servers and desktops."
  },
  {
    "id": 44,
    "riddle": "I bind data and methods together into a single unit while hiding the internal details from the outside world. I improve security and reduce system complexity. Which object-oriented concept am I?",
    "hint": "Data hiding concept.",
    "answer": "ENCAPSULATION"
  },
  {
    "id": 45,
    "riddle": "I am the branch of computer science that aims to create intelligent machines capable of learning, reasoning, and making decisions like humans. I encompass machine learning, deep learning, and natural language processing. Every smart device you use today incorporates aspects of me. What am I?",
    "answer": "AI",
    "hint": "Rapidly growing field?"
  },
  {
    "id": 15,
    "riddle": "I allow the same function name or operator to perform different tasks based on context. I reduce code duplication and increase flexibility in object-oriented programs. What am I?",
    "hint": "Many forms, one name.",
    "answer": "POLYMORPHISM"
  },
  {
    "id": 47,
    "riddle": "I am a key on your keyboard that removes the character before the cursor. I help you correct typos and errors as you type. Every keyboard has me, and I have been essential to typing since the days of typewriters. What am I?",
    "answer": "BACKSPACE",
    "hint": "I'm in your keyboard."
  },
  {
    "id": 48,
    "riddle": "I am the physical, tangible components of a computer that you can touch and hold. I include the processor, memory, hard drive, motherboard, and all other mechanical and electronic devices inside and outside the computer case. Software runs on me. What am I?",
    "answer": "HARDWARE",
    "hint": "Physical parts of a computer."
  },
   {
    "id": 49,
    "riddle": "I measure how an algorithm’s execution time grows as the input size increases. I ignore hardware details and focus only on growth rate to compare efficiency. What concept am I?",
    "hint": "Uses Big-O notation.",
    "answer": "TIME COMPLEXITY"
  },
  {
    "id": 50,
    "riddle": "I am a programming technique where a function repeatedly calls itself until a stopping condition is met. If that condition is missing, the program may crash. What am I?",
    "hint": "Function calling itself.",
    "answer": "RECURSION"
  },
  {
    "id": 51,
    "riddle": "I am an artificial intelligence program designed to simulate conversation with human users. I can answer questions, provide information, and engage in dialogue across text or voice. Famous examples of me include ChatGPT, Google Assistant, and Siri. What am I?",
    "answer": "CHATBOT",
    "hint": "ChatGPT is one."
  },
  {
    "id": 52,
    "riddle": "I am a type of neural network that is particularly good at processing sequential data and time-series information. I can remember previous inputs and use them to influence current decisions, making me ideal for speech recognition and language translation. What am I?",
    "answer": "RNN",
    "hint": "Learn from feedback?"
  },
  {
    "id": 54,
    "riddle": "I am a unit of digital storage that equals 1024 bytes in binary notation. I am commonly used to measure file sizes and storage capacity. When you download a document or small image, its size is often measured in units of me. What am I?",
    "answer": "KILOBYTE",
    "hint": "1000 grams are also called by the same name."
  },
  {
    "id": 55,
    "riddle": "I am a protocol used for transferring data across the World Wide Web. I define how messages are sent between web browsers and web servers. You can see my letters at the beginning of every website URL, and I am the foundation of how the internet works. What am I?",
    "answer": "HTTP",
    "hint": "You can see me in the 1st few letters of link in browser."
  },
  {
    "id": 56,
    "riddle": "I am an error or flaw in a computer program that causes it to behave unexpectedly or produce incorrect results. I can range from minor issues that just annoy users to critical problems that crash the entire system. Developers spend countless hours hunting for and fixing me. What am I?",
    "answer": "BUG",
    "hint": "People often say that I can fly."
  },
  {
    "id": 57,
    "riddle": "I am the standard language used to communicate with relational databases. I allow you to retrieve, insert, update, and delete data from databases. Data analysts, database administrators, and web developers rely on me constantly to work with data. What am I?",
    "answer": "SQL",
    "hint": "Used to manage data in RDBMS."
  },
  {
    "id": 58,
    "riddle": "I am random access memory that stores temporary data used by your computer during operation. I am extremely fast but volatile, meaning I lose all data when power is cut off. Having more of me installed allows your computer to multitask more efficiently. What am I?",
    "answer": "RAM",
    "hint": "Volatile memory."
  },
  {
    "id": 59,
    "riddle": "I am a storage device that permanently stores all your files, programs, and operating system. Unlike RAM, I am non-volatile, meaning my data persists even when the computer is powered off. Every piece of information saved to your computer is stored on me. What am I?",
    "answer": "HARD DRIVE",
    "hint": "Long-term storage."
  },
  {
    "id": 60,
    "riddle": "I am the language used to style and layout web pages. I control colors, fonts, spacing, and positioning of elements. Without me, web pages would be plain and unattractive. Every beautiful website you see uses me to create visual appeal and responsive design. What am I?",
    "answer": "CSS",
    "hint": "Used in HTML to style."
  },
  {
    "id": 61,
    "riddle": "I am malicious software designed to infect your computer and damage or disable it. I spread from computer to computer, often through email attachments or infected websites. I can steal data, corrupt files, and slow down your system. What am I?",
    "answer": "VIRUS",
    "hint": "Even humans can get me."
  },
  {
    "id": 62,
    "riddle": "I am security software designed to protect your computer from malicious threats. I scan files and programs for known malware signatures and remove threats before they can harm your system. Installing me on your computer is one of the best ways to stay safe online. What am I?",
    "answer": "ANTIVIRUS",
    "hint": "Protects against viruses."}, {
    "id": 63,
    "riddle": "I am a data structure that stores only unique elements and allows very fast lookups to check if an element exists. I use a hash function to store and retrieve elements efficiently. When you need to find duplicates or maintain a collection of unique items, I am your best choice. What am I?",
    "answer": "HASHSET",
    "hint": "Unique elements..."
  },
  {
    "id": 68,
    "riddle": "I am an error that appears only when the program is executed, not during compilation. I usually occur due to invalid input, memory issues, or logical mistakes. What type of error am I?",
    "hint": "Occurs during execution.",
    "answer": "RUNTIME ERROR"
  },
  {
    "id": 69,
    "riddle": "I am a type of software that manages computer hardware and allows other programs to run smoothly. I act as a bridge between the user and the machine. Without me, no application could function. What am I?",
    "hint": "Controls hardware and software.",
    "answer": "OS"
  },{
    "id": 70,
    "riddle": "I am a collection of connected computers that share data and resources with each other. I help people communicate, share files, and access information easily. What am I?",
    "hint": "Connected computers.",
    "answer": "NETWORK"
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
  const { getRoom, completeChallenge } = useGame();
  const [selectedQuestions] = useState(() => getRandomQuestions());
  const [showDoorClosingAnimation, setShowDoorClosingAnimation] = useState(true);
  const [showDoorOpeningAnimation, setShowDoorOpeningAnimation] = useState(false);
  
  const room = roomCode ? getRoom(roomCode) : undefined;

  if (!room) {
    navigate('/join');
    return null;
  }

  const handleComplete = () => {
    // Show door opening animation to exit
    setShowDoorOpeningAnimation(true);
    
    // Complete challenge #2
    completeChallenge(2);
    
    // Navigate back to the game when door animation completes
    // 2 seconds opening animation
    setTimeout(() => {
      navigate(`/game/${roomCode}`);
    }, 2000);
  };

  const handleBack = () => {
    navigate(`/game/${roomCode}`);
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-fixed bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: 'url(/winterfell-bg.jpg)',
      }}
    >
      {/* Enhanced Color Grading Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[2] bg-gradient-to-b from-blue-900/20 via-slate-900/30 to-blue-950/40" />
      
      {/* Door Closing Animation on First Load - Entering */}
     

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
