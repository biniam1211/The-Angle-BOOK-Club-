import React, { useRef, useState } from 'react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: string;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: string;
    color: string;
    label: string;
  };
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX.current;
    setTranslateX(deltaX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (Math.abs(translateX) > 100) {
      if (translateX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (translateX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setTranslateX(0);
  };

  const showLeftAction = translateX > 20 && leftAction;
  const showRightAction = translateX < -20 && rightAction;

  return (
    <div className="swipeable-card-container">
      {showLeftAction && (
        <div className="swipe-action swipe-action-left" style={{ backgroundColor: leftAction.color }}>
          <span>{leftAction.icon}</span>
          <span>{leftAction.label}</span>
        </div>
      )}
      {showRightAction && (
        <div className="swipe-action swipe-action-right" style={{ backgroundColor: rightAction.color }}>
          <span>{rightAction.icon}</span>
          <span>{rightAction.label}</span>
        </div>
      )}
      <div
        ref={cardRef}
        className="swipeable-card"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
