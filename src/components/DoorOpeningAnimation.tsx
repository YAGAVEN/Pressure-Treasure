import { useEffect, useState } from 'react';
import './DoorOpeningAnimation.css';

interface DoorOpeningAnimationProps {
  onAnimationComplete: () => void;
  moveFurther?: boolean;
}

export const DoorOpeningAnimation = ({ onAnimationComplete, moveFurther = false }: DoorOpeningAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Wait 500ms before starting the animation (reduced from 2000ms)
    const delayTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);

    return () => clearTimeout(delayTimer);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    // 2 second animation duration (match CSS animation)
    const animationTimer = setTimeout(() => {
      if (moveFurther) {
        // If moving further, wait 1 more second then complete
        const moveTimer = setTimeout(() => {
          onAnimationComplete();
        }, 1000);
        return () => clearTimeout(moveTimer);
      } else {
        onAnimationComplete();
      }
    }, 2000);

    return () => clearTimeout(animationTimer);
  }, [isAnimating, onAnimationComplete, moveFurther]);

  if (!isAnimating) return null;

  return (
    <div className={`door-opening-container ${moveFurther ? 'door-move-further' : ''}`}>
      {/* Overlay */}
      <div className="door-opening-overlay"></div>

      {/* Left door opening */}
      <div className="door door-opening-left">
        <div className="door-content">
          <div className="door-metal-frame"></div>
          <div className="door-lock"></div>
        </div>
      </div>

      {/* Right door opening */}
      <div className="door door-opening-right">
        <div className="door-content">
          <div className="door-metal-frame"></div>
          <div className="door-lock"></div>
        </div>
      </div>

      {/* Bright light from beyond */}
      <div className="door-freedom-light"></div>

      {/* Success message */}
      <div className="door-success-container">
        <div className="door-success-text">You Escaped!</div>
        <div className="door-success-subtext">The Maester's Chamber has freed you</div>
      </div>

      {/* Particle effects */}
      <div className="ice-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="ice-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}></div>
        ))}
      </div>
    </div>
  );
};
