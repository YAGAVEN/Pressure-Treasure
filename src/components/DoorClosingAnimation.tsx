import { useEffect, useState } from 'react';
import './DoorClosingAnimation.css';

interface DoorClosingAnimationProps {
  onAnimationComplete: () => void;
}

export const DoorClosingAnimation = ({ onAnimationComplete }: DoorClosingAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onAnimationComplete();
    }, 3000); // Animation duration

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (!isAnimating) return null;

  return (
    <div className="door-animation-container">
      {/* Dark overlay with fade in */}
      <div className="door-overlay"></div>

      {/* Left door */}
      <div className="door door-left">
        <div className="door-content">
          <div className="door-metal-frame"></div>
          <div className="door-lock"></div>
        </div>
      </div>

      {/* Right door */}
      <div className="door door-right">
        <div className="door-content">
          <div className="door-metal-frame"></div>
          <div className="door-lock"></div>
        </div>
      </div>

      {/* Center light glow effect */}
      <div className="door-light-glow"></div>

      {/* Text animation */}
      <div className="door-text-container">
        <div className="door-text">Entering the Maester's Chamber...</div>
      </div>
    </div>
  );
};
