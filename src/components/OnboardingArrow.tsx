import React, { useEffect, useState, useRef } from 'react';

interface AnimatedArrowProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay?: number;
}

const AnimatedArrow: React.FC<AnimatedArrowProps> = ({ startX, startY, endX, endY, delay = 200 }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPositionRef = useRef<{ startX: number; startY: number; endX: number; endY: number } | null>(null);

  // Check if positions are valid (non-zero)
  const isValidPosition = startX > 0 && startY > 0 && endX > 0 && endY > 0;

  useEffect(() => {
    // Check if position changed
    const hasChanged = !prevPositionRef.current || 
      prevPositionRef.current.startX !== startX ||
      prevPositionRef.current.startY !== startY ||
      prevPositionRef.current.endX !== endX ||
      prevPositionRef.current.endY !== endY;

    if (hasChanged && isValidPosition) {
      // Reset animation
      setIsAnimating(false);
      prevPositionRef.current = { startX, startY, endX, endY };

      // Start animation after a small delay
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [startX, startY, endX, endY, isValidPosition]);

  // Don't render if positions are invalid
  if (!isValidPosition) return null;

  // Calculate arrow head position and angle
  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowLength = 12;
  const arrowAngle = Math.PI / 6; // 30 degrees

  // Arrow head points
  const headX1 = endX - arrowLength * Math.cos(angle - arrowAngle);
  const headY1 = endY - arrowLength * Math.sin(angle - arrowAngle);
  const headX2 = endX - arrowLength * Math.cos(angle + arrowAngle);
  const headY2 = endY - arrowLength * Math.sin(angle + arrowAngle);

  // Calculate path length for animation
  const pathLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) + 20;

  return (
    <svg
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 60,
        overflow: 'visible',
      }}
    >
      <defs>
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* Main arrow line with draw animation */}
      <path
        d={`M ${startX} ${startY} L ${endX} ${endY}`}
        stroke="url(#arrowGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={isAnimating ? 0 : pathLength}
        style={{
          transition: isAnimating ? 'stroke-dashoffset 0.6s ease-out' : 'none',
        }}
      />

      {/* Arrow head with fade-in animation */}
      <path
        d={`M ${endX} ${endY} L ${headX1} ${headY1} L ${headX2} ${headY2} Z`}
        fill="url(#arrowGradient)"
        opacity={isAnimating ? 1 : 0}
        style={{
          transition: isAnimating ? 'opacity 0.3s ease-out' : 'none',
          transitionDelay: isAnimating ? '0.4s' : '0s',
        }}
      />
    </svg>
  );
};

export default AnimatedArrow;
