import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Challenge {
  id: number;
  name: string;
  description: string;
}

interface LevelMapProps {
  challenges: Challenge[];
  completedChallenges: number[];
  currentChallenge: number;
  onLevelClick: (challengeId: number) => void;
  isGamePlaying: boolean;
}

// Floating particle component for ambient effects
const FloatingParticle = ({ delay, duration }: { delay: number; duration: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-30"
    initial={{ x: 0, y: 0, opacity: 0 }}
    animate={{
      x: Math.random() * 100 - 50,
      y: Math.random() * -100,
      opacity: [0, 0.5, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatDelay: 2,
    }}
  />
);

// Particle burst effect for level completion
const ParticleBurst = ({ x, y }: { x: number; y: number }) => {
  const particles = Array.from({ length: 8 });

  return (
    <>
      {particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 40;

        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full pointer-events-none"
            initial={{
              left: x,
              top: y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              left: x + Math.cos(angle) * distance,
              top: y + Math.sin(angle) * distance,
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </>
  );
};

// Ambient fog effect
const AmbientBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Fog layers */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-950/40"
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%'],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
    />

    {/* Floating clouds */}
    {[0, 1, 2].map((i) => (
      <motion.div
        key={`cloud-${i}`}
        className="absolute w-96 h-32 bg-gradient-to-r from-slate-800/10 to-transparent rounded-full blur-3xl"
        initial={{
          left: `${i * 40 - 20}%`,
          top: `${i * 30}%`,
        }}
        animate={{
          left: [`${i * 40 - 20}%`, `${i * 40 + 20}%`],
          top: [`${i * 30}%`, `${i * 30 - 10}%`],
        }}
        transition={{
          duration: 15 + i * 5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
    ))}

    {/* Light rays */}
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={`ray-${i}`}
        className="absolute h-96 w-px bg-gradient-to-b from-amber-400/20 to-transparent blur-xl"
        initial={{
          left: `${25 + i * 25}%`,
          top: 0,
          opacity: 0.3,
        }}
        animate={{
          opacity: [0.1, 0.4, 0.1],
        }}
        transition={{
          duration: 3 + i,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    ))}
  </div>
);

// Level node with enhanced interactivity
const LevelNode = ({
  challenge,
  isCompleted,
  isCurrent,
  isLocked,
  isClickable,
  position,
  onHover,
  onLeave,
  onBurst,
  onClick,
  index,
}: {
  challenge: Challenge;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  isClickable: boolean;
  position: { x: number; y: number };
  onHover: (id: number) => void;
  onLeave: () => void;
  onBurst?: (x: number, y: number) => void;
  onClick: (challengeId: number) => void;
  index: number;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [shake, setShake] = useState(false);

  const handleHover = () => {
    onHover(challenge.id);
    if (isLocked) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isCurrent) return 'Current';
    if (isLocked) return 'Locked';
    return 'Available';
  };

  const nodeSize = isCurrent ? 20 : 16;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Glow background for completed/current */}
      {(isCompleted || isCurrent) && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full',
            isCompleted
              ? 'bg-emerald-500/20 blur-xl'
              : 'bg-amber-500/30 blur-2xl'
          )}
          style={{
            width: nodeSize * 3,
            height: nodeSize * 3,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: isCurrent ? [1, 1.2, 1] : [1, 1.15, 1],
            opacity: isCurrent ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: isCurrent ? 2 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Pulsing ring for current level */}
      {isCurrent && !isCompleted && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-300"
          style={{
            width: nodeSize * 2,
            height: nodeSize * 2,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(251, 191, 36, 0.7)',
              '0 0 0 20px rgba(251, 191, 36, 0)',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
      )}

      {/* Main node button */}
      <motion.button
<<<<<<< HEAD
        onClick={() => {
          console.log('[LEVELNODE] Clicked challenge', challenge.id, 'isClickable:', isClickable, 'isLocked:', isLocked);
          if (isClickable) {
            console.log('[LEVELNODE] ✅ Calling onClick handler for challenge', challenge.id);
            onBurst?.(position.x, position.y);
            onClick(challenge.id);
          } else {
            console.log('[LEVELNODE] ❌ Challenge is not clickable');
=======
        onClick={(e) => {
          console.log('[LEVELNODE] 🖱️ BUTTON CLICKED - Raw click event fired!', challenge.id);
          console.log('[LEVELNODE] Event details:', e.type, e.target);
          console.log('[LEVELNODE] Clicked challenge', challenge.id, 'isClickable:', isClickable, 'isLocked:', isLocked);
          if (isClickable) {
            console.log('[LEVELNODE] ✅ Clicking is allowed, calling onClick');
            onBurst?.(position.x, position.y);
            onClick(challenge.id);
          } else {
            console.log('[LEVELNODE] ❌ Click blocked - isClickable is false');
>>>>>>> 54b89a13a9ce4ea4a428f8aa8c9435f162229bab
          }
        }}
        onMouseEnter={handleHover}
        onMouseLeave={onLeave}
        disabled={!isClickable}
        className={cn(
          'relative rounded-full font-cinzel font-bold transition-all',
          'border-2 shadow-lg',
          `w-${nodeSize} h-${nodeSize}`,
          isCompleted
            ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-300 shadow-emerald-500/50 text-white'
            : isCurrent
            ? 'bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-300 shadow-amber-500/50 text-slate-900'
            : isLocked
            ? 'bg-slate-700 border-slate-600 shadow-slate-700/30 text-slate-500 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-br from-blue-500 to-cyan-600 border-blue-300 shadow-blue-500/50 text-white hover:shadow-blue-400/70',
          isClickable && !isLocked && 'cursor-pointer hover:scale-110',
          shake && 'animate-pulse',
        )}
        style={{
          width: `${nodeSize * 4}px`,
          height: `${nodeSize * 4}px`,
          fontSize: `${nodeSize * 0.8}px`,
        }}
        animate={
          shake
            ? {
                x: [0, -5, 5, -5, 0],
              }
            : {}
        }
        transition={shake ? { duration: 0.4 } : {}}
        whileHover={
          isClickable && !isLocked
            ? { 
                scale: 1.15,
                boxShadow: '0 0 20px rgba(217, 119, 6, 0.6)',
              }
            : {}
        }
        whileTap={isClickable && !isLocked ? { scale: 0.95 } : {}}
      >
        {/* Completed star */}
        {isCompleted && (
          <motion.span
            className="absolute -top-2 -right-2 text-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            ⭐
          </motion.span>
        )}

        {/* Completed checkmark */}
        {isCompleted && (
          <motion.span
            className="absolute -top-3 -left-3 text-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
          >
            ✓
          </motion.span>
        )}

        {/* Lock icon for locked levels */}
        {isLocked && (
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl"
          >
            🔒
          </motion.span>
        )}

        {/* Level number */}
        {!isLocked && !isCompleted && <span>{challenge.id}</span>}
        {!isLocked && isCompleted && <span>✓</span>}
      </motion.button>

      {/* Enhanced tooltip */}
      <div
        className="absolute top-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap mt-2"
        style={{
          pointerEvents: showTooltip ? 'auto' : 'none',
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.div
          className="bg-slate-900/95 border-2 border-amber-400/60 rounded-lg px-4 py-2 text-xs text-amber-100 shadow-xl backdrop-blur-sm space-y-1"
          initial={{ opacity: 0, y: -10, scale: 0.8 }}
          animate={
            showTooltip
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: -10, scale: 0.8 }
          }
          transition={{ duration: 0.2 }}
        >
          <p className="font-cinzel font-bold">Level {challenge.id}</p>
          <p className="text-amber-300">{challenge.name}</p>
          <p className={cn(
            'text-xs font-semibold',
            isCompleted && 'text-emerald-300',
            isCurrent && 'text-amber-300',
            isLocked && 'text-slate-400',
            !isLocked && !isCompleted && !isCurrent && 'text-blue-300',
          )}>
            {getStatusText()}
          </p>
          {isLocked && (
            <p className="text-slate-400 italic mt-1">Complete previous challenge to unlock</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Animated path connector with travel tracking
const PathConnector = ({
  startPos,
  endPos,
  isCompleted,
  isCurrent,
  isLocked,
  index,
  isTraveled,
}: {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  index: number;
  isTraveled: boolean;
}) => {
  const midX = (startPos.x + endPos.x) / 2;
  const startY = startPos.y + 7;
  const endY = endPos.y + 7;
  const pathData = `M ${startPos.x} ${startY} Q ${midX} ${(startY + endY) / 2} ${endPos.x} ${endY}`;

  // Path is traveled if it's completed or is the current active path
  const showTraveled = isTraveled || isCompleted;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        <linearGradient id={`pathGradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor={
              showTraveled
                ? 'rgba(16, 185, 129, 0.6)'
                : isCurrent
                ? 'rgba(217, 119, 6, 0.5)'
                : 'rgba(100, 116, 139, 0.2)'
            }
          />
          <stop
            offset="100%"
            stopColor={
              showTraveled
                ? 'rgba(16, 185, 129, 0.3)'
                : isCurrent
                ? 'rgba(217, 119, 6, 0.2)'
                : 'rgba(100, 116, 139, 0.1)'
            }
          />
        </linearGradient>

        <filter id={`pathGlow-${index}`}>
          <feGaussianBlur stdDeviation={showTraveled ? 3 : isCurrent ? 3 : 1} />
        </filter>
      </defs>

      {/* Glow layer for traveled/current paths */}
      {(showTraveled || isCurrent) && (
        <motion.path
          d={pathData}
          fill="none"
          stroke={showTraveled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(217, 119, 6, 0.3)'}
          strokeWidth="6"
          filter={`url(#pathGlow-${index})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: isCurrent ? [0.4, 0.8, 0.4] : 0.7 }}
          transition={{
            pathLength: { duration: 1.5, delay: index * 0.1 },
            opacity: isCurrent ? { duration: 2, repeat: Infinity } : { duration: 0.5 },
          }}
        />
      )}

      {/* Main path - thicker for traveled paths */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={`url(#pathGradient-${index})`}
        strokeWidth={showTraveled ? 4 : isCurrent ? 3 : 2}
        strokeLinecap="round"
        strokeDasharray={showTraveled ? "0" : "5,5"}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: index * 0.1 }}
      />

      {/* Animated dots along traveled path */}
      {showTraveled && (
        <>
          <motion.circle
            cx={startPos.x + (endPos.x - startPos.x) * 0.25}
            cy={startY + (endY - startY) * 0.25}
            r="3"
            fill="rgba(16, 185, 129, 0.8)"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.circle
            cx={startPos.x + (endPos.x - startPos.x) * 0.5}
            cy={startY + (endY - startY) * 0.5}
            r="3"
            fill="rgba(16, 185, 129, 0.8)"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.3,
            }}
          />
          <motion.circle
            cx={startPos.x + (endPos.x - startPos.x) * 0.75}
            cy={startY + (endY - startY) * 0.75}
            r="3"
            fill="rgba(16, 185, 129, 0.8)"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.6,
            }}
          />
        </>
      )}

      {/* Pulsing dot on current path */}
      {isCurrent && (
        <motion.circle
          cx={midX}
          cy={(startY + endY) / 2}
          r="4"
          fill="rgba(251, 191, 36, 0.9)"
          animate={{
            r: [3, 6, 3],
            opacity: [0.9, 0.3, 0.9],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
      )}
    </svg>
  );
};

// Player token that moves along the path
const PlayerToken = ({
  levelPositions,
  currentLevelIndex,
}: {
  levelPositions: { x: number; y: number }[];
  currentLevelIndex: number;
}) => {
  // Position token at the current level (where the player is now)
  const tokenLevelIndex = Math.min(currentLevelIndex, levelPositions.length - 1);
  const tokenPos = levelPositions[tokenLevelIndex];

  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      initial={false}
      animate={{
        left: `${tokenPos.x}%`,
        top: `${tokenPos.y}%`,
      }}
      style={{
        transform: 'translate(-50%, -50%)',
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      }}
    >
      {/* Glow effect around player */}
      <motion.div
        className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl"
        style={{
          width: '80px',
          height: '80px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="text-4xl filter drop-shadow-2xl relative z-10"
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        👑
      </motion.div>
      
      {/* Sparkle effects */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [0, (i - 1) * 20],
            y: [0, -30 - i * 5],
            opacity: [1, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </motion.div>
  );
};

const LevelMap = ({
  challenges,
  completedChallenges,
  currentChallenge,
  onLevelClick,
  isGamePlaying,
}: LevelMapProps) => {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [burstParticles, setBurstParticles] = useState<
    Array<{ id: string; x: number; y: number }>
  >([]);

  // Calculate level positions in a snake-like curved path
  const levelPositions = challenges.map((_, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = col === 0 ? 20 : 80;
    const y = 15 + row * 18;
    return { x, y };
  });

  const handleLevelBurst = (x: number, y: number) => {
    const burstId = `${Date.now()}-${Math.random()}`;
    setBurstParticles((prev) => [...prev, { id: burstId, x, y }]);
    setTimeout(() => {
      setBurstParticles((prev) => prev.filter((p) => p.id !== burstId));
    }, 800);

    // Trigger the actual level click
    const levelAtPos = challenges.find((_, index) => {
      const pos = levelPositions[index];
      const dx = Math.abs(pos.x - x);
      const dy = Math.abs(pos.y - y);
      return dx < 5 && dy < 5;
    });

    if (levelAtPos) {
      onLevelClick(levelAtPos.id);
    }
  };

  return (
    <div 
      className="relative w-full h-screen min-h-[600px] overflow-hidden"
      style={{
        backgroundImage: 'url(/images/mapimage.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/70 to-slate-950/80 pointer-events-none" />

      {/* Ambient background effects */}
      <AmbientBackground />

      {/* Decorative grid background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gold" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle
            key={`particle-${i}`}
            delay={i * 0.1}
            duration={3 + Math.random() * 2}
          />
        ))}
      </div>

      {/* Particle bursts */}
      {burstParticles.map((burst) => (
        <ParticleBurst key={burst.id} x={burst.x} y={burst.y} />
      ))}

      {/* SVG Paths connecting levels */}
      {levelPositions.map((pos, index) => {
        if (index === levelPositions.length - 1) return null;

        const nextPos = levelPositions[index + 1];
        const challenge = challenges[index];
        const nextChallenge = challenges[index + 1];

        const isCompleted = completedChallenges.includes(challenge.id);
        const isCurrent = currentChallenge === challenge.id;
        // Path to next challenge: locked if next challenge is > 1 and > currentChallenge
        const nextIsLocked = nextChallenge.id > 1 && nextChallenge.id > currentChallenge;
        const isTraveled = isCompleted; // Path is traveled if starting challenge is completed

        return (
          <PathConnector
            key={`path-${index}`}
            startPos={pos}
            endPos={nextPos}
            isCompleted={isCompleted}
            isCurrent={isCurrent}
            isLocked={nextIsLocked}
            isTraveled={isTraveled}
            index={index}
          />
        );
      })}

      {/* Player token - positioned at current level */}
      <PlayerToken 
        levelPositions={levelPositions} 
        currentLevelIndex={currentChallenge - 1}
      />

      {/* Level nodes container */}
      <div className="relative w-full h-full p-8" style={{ zIndex: 2 }}>
        {challenges.map((challenge, index) => {
          const position = levelPositions[index];
          const isCompleted = completedChallenges.includes(challenge.id);
          const isCurrent = currentChallenge === challenge.id;
          // Game 1 is always unlocked when game is playing (first challenge)
          // Other challenges are locked until reached
          const isLocked = challenge.id > 1 && challenge.id > currentChallenge;
          const isClickable = !isLocked && isGamePlaying;

          if (challenge.id === 1) {
            console.log('[LEVELMAP] Game 1 state - isLocked:', isLocked, 'isGamePlaying:', isGamePlaying, 'isClickable:', isClickable, 'currentChallenge:', currentChallenge);
          }

          return (
            <LevelNode
              key={challenge.id}
              challenge={challenge}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isLocked={isLocked}
              isClickable={isClickable}
              position={position}
              onHover={setHoveredLevel}
              onLeave={() => setHoveredLevel(null)}
              onBurst={handleLevelBurst}
              onClick={onLevelClick}
              index={index}
            />
          );
        })}
      </div>

      {/* Progress indicator at bottom */}
      <div className="absolute left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-6 z-10" style={{ bottom: '80px' }}>
        <div className="container mx-auto">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-cinzel text-amber-200">Quest Progress</span>
              <span className="text-sm font-cinzel text-amber-300">
                {completedChallenges.length}/{challenges.length}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden border border-amber-400/30">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/50"
                initial={{ width: 0 }}
                animate={{
                  width: `${(completedChallenges.length / challenges.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-6 right-6 bg-slate-800/80 border border-amber-400/50 rounded-lg p-4 z-20">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 border border-amber-300 shadow-md" />
            <span className="text-amber-100">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 border border-emerald-300 shadow-md" />
            <span className="text-emerald-100">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600 shadow-md" />
            <span className="text-slate-400">Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 border border-blue-300 shadow-md" />
            <span className="text-blue-100">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
