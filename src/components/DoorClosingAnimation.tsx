import { useEffect, useState } from 'react';
import './DoorClosingAnimation.css';

interface DoorClosingAnimationProps {
  onAnimationComplete: () => void;
}

export const DoorClosingAnimation = ({ onAnimationComplete }: DoorClosingAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    // Wait for close animation to complete (2.5s), then start opening
    const closeTimer = setTimeout(() => {
      setIsOpening(true);
    }, 2500);

    // After opening animation completes (2s), hide completely
    const completeTimer = setTimeout(() => {
      setIsAnimating(false);
      onAnimationComplete();
    }, 5000); // 2.5s close + 2.5s open

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete]);

  if (!isAnimating) return null;

  return (
    <div className="door-animation-container">
      {/* Dark overlay with fade in */}
      <div className="door-overlay"></div>

      {/* Left door */}
      <div className={`door door-left ${isOpening ? 'door-opening' : ''}`}>
        <div className="door-content">
          <div className="door-metal-frame"></div>
          <div className="door-lock"></div>
        </div>
      </div>

      {/* Right door */}
      <div className={`door door-right ${isOpening ? 'door-opening' : ''}`}>
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
