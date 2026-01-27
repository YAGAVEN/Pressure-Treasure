import React, { useEffect, useState } from 'react';
import { HouseTheme } from '@/types/game';
import { cn } from '@/lib/utils';

interface LevelAnimationProps {
  houseTheme: HouseTheme;
  challengeId: number;
  className?: string;
}

const LevelAnimation: React.FC<LevelAnimationProps> = ({ houseTheme, challengeId, className }) => {
  // Restart animation when challenge changes
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [challengeId]);

  const getThemeStyles = () => {
    switch (houseTheme) {
      case 'stark':
        return {
          gradient: 'from-blue-900 via-blue-800 to-blue-950',
          accentColor: 'bg-blue-500',
          particleColor: 'before:bg-blue-400',
        };
      case 'lannister':
        return {
          gradient: 'from-amber-900 via-yellow-900 to-amber-950',
          accentColor: 'bg-yellow-500',
          particleColor: 'before:bg-yellow-400',
        };
      case 'targaryen':
        return {
          gradient: 'from-red-900 via-red-800 to-red-950',
          accentColor: 'bg-red-500',
          particleColor: 'before:bg-red-400',
        };
      case 'baratheon':
        return {
          gradient: 'from-slate-900 via-slate-800 to-slate-950',
          accentColor: 'bg-slate-500',
          particleColor: 'before:bg-slate-400',
        };
      case 'greyjoy':
        return {
          gradient: 'from-slate-900 via-blue-900 to-slate-950',
          accentColor: 'bg-slate-500',
          particleColor: 'before:bg-slate-300',
        };
      case 'tyrell':
        return {
          gradient: 'from-green-900 via-green-800 to-green-950',
          accentColor: 'bg-green-500',
          particleColor: 'before:bg-green-400',
        };
      case 'martell':
        return {
          gradient: 'from-orange-900 via-orange-800 to-orange-950',
          accentColor: 'bg-orange-500',
          particleColor: 'before:bg-orange-400',
        };
      case 'tully':
        return {
          gradient: 'from-blue-900 via-indigo-900 to-blue-950',
          accentColor: 'bg-blue-500',
          particleColor: 'before:bg-indigo-400',
        };
      default:
        return {
          gradient: 'from-gray-900 via-gray-800 to-gray-950',
          accentColor: 'bg-gray-500',
          particleColor: 'before:bg-gray-400',
        };
    }
  };

  // Different animations for different challenges
  const theme = getThemeStyles();

  const getChallengeAnimation = () => {
    switch (challengeId) {
      case 1: // Trial of the First Men - Ancient/Stone theme
        return 'animate-pulse';
      case 2: // Riddle of the Maester - Mystical theme
        return 'animate-spin';
      case 3: // Path Through Kingswood - Forest theme
        return 'animate-bounce';
      case 4: // Secrets of the Citadel - Knowledge/Light theme
        return 'animate-pulse';
      case 5: // Iron Throne Ascension - Victory theme
        return 'animate-bounce';
      default:
        return 'animate-pulse';
    }
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
         @keyframes glow {
          0%, 100% {
            opacity: 0.6;
            box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 30px currentColor, 0 0 60px currentColor;
          }
        }
        @keyframes snowfall {
          0% {
            transform: translateY(-100vh) translateX(0);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(20px);
            opacity: 0;
          }
        }
        @keyframes fireflicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes swirl {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animation-level {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: float 6s infinite;
        }
        .snow-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: snowfall 10s linear infinite;
        }
        .fire-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: fireflicker 2s infinite;
        }
        .mystical-orb {
          position: absolute;
          border-radius: 50%;
          box-shadow: inset 0 0 10px currentColor;
          animation: glow 3s ease-in-out infinite;
        }
        .challenge-icon {
          position: absolute;
          font-size: 2rem;
          opacity: 0.1;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
      <div
        key={animationKey}
        className={cn(
          "animation-level",
          `bg-gradient-to-b ${theme.gradient}`,
          className
        )}
      >
        {/* Render different animations based on challenge */}
        {challengeId === 1 && (
          <>
          {/* Trial of the First Men - Ancient stones & mystical particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`particle-${i}`}
                className={cn("particle", theme.particleColor)}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
            <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-black via-transparent to-transparent" />
          </>
        )}

        {challengeId === 2 && (
          <>
          {/* Riddle of the Maester - Mystical glowing orbs */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`orb-${i}`}
                className={cn("mystical-orb", theme.accentColor)}
                style={{
                  width: `${20 + Math.random() * 30}px`,
                  height: `${20 + Math.random() * 30}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  color: houseTheme === 'targaryen' ? '#ef4444' : houseTheme === 'lannister' ? '#eab308' : '#3b82f6',
                }}
              />
            ))}
            <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-purple-500/20 to-transparent" />
          </>
        )}

        {challengeId === 3 && (
          <>
          {/* Path Through Kingswood - Falling snowflakes (winter vibes) */}
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={`snow-${i}`}
                className="snow-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${10 + Math.random() * 5}s`,
                }}
              />
            ))}
            <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-blue-900 via-transparent to-transparent" />
          </>
        )}

        {challengeId === 4 && (
          <>
          {/* Secrets of the Citadel - Multiple glowing particles with shimmer */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={`citadel-${i}`}
                className={cn("particle", theme.particleColor)}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animation: `float 8s infinite, shimmer 3s infinite`,
                }}
              />
            ))}
            <div className="absolute inset-0 opacity-40 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent" />
          </>
        )}

        {challengeId === 5 && (
          <>
          {/* Iron Throne Ascension - Golden glow & celebration */}
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={`throne-${i}`}
                className="mystical-orb bg-yellow-500"
                style={{
                  width: `${15 + Math.random() * 25}px`,
                  height: `${15 + Math.random() * 25}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.15}s`,
                  color: '#eab308',
                }}
              />
            ))}
            <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-amber-500/30 via-transparent to-transparent" />
          </>
        )}

        {/* Always present: subtle vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      </div>
    </>
  );
};

export default LevelAnimation;
