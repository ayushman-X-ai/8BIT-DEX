'use client';

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Direction = 'none' | 'up' | 'down' | 'left' | 'right';

interface JoystickProps {
  onDirectionChange: (direction: Direction) => void;
}

const JoystickButton = ({
  direction,
  onDirectionChange,
  className,
  children,
}: {
  direction: Direction;
  onDirectionChange: (d: Direction) => void;
  className?: string;
  children: React.ReactNode;
}) => {
  const handlePointerDown = (e: React.PointerEvent) => {
    // Allow multiple buttons to be captured for diagonal-like feel
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onDirectionChange(direction);
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    onDirectionChange('none');
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp} // Handles case where pointer leaves screen
      className={cn(
        "bg-foreground/80 text-background flex items-center justify-center active:bg-primary active:border-primary-foreground focus:outline-none transition-colors duration-100",
        className
      )}
      aria-label={`Move ${direction}`}
    >
      {children}
    </button>
  );
};

export default function Joystick({ onDirectionChange }: JoystickProps) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 w-32 h-32 sm:w-36 sm:h-36 touch-none shadow-lg">
      <div className="col-start-2 row-start-1">
        <JoystickButton direction="up" onDirectionChange={onDirectionChange} className="w-full h-full rounded-t-md"><ArrowUp size={24} /></JoystickButton>
      </div>
      
      <div className="col-start-1 row-start-2">
        <JoystickButton direction="left" onDirectionChange={onDirectionChange} className="w-full h-full rounded-l-md"><ArrowLeft size={24} /></JoystickButton>
      </div>
      
      <div className="col-start-2 row-start-2 bg-foreground/80 flex items-center justify-center">
        <div className="w-4 h-4 bg-foreground/60 rounded-full" />
      </div>

      <div className="col-start-3 row-start-2">
        <JoystickButton direction="right" onDirectionChange={onDirectionChange} className="w-full h-full rounded-r-md"><ArrowRight size={24} /></JoystickButton>
      </div>
      
      <div className="col-start-2 row-start-3">
        <JoystickButton direction="down" onDirectionChange={onDirectionChange} className="w-full h-full rounded-b-md"><ArrowDown size={24} /></JoystickButton>
      </div>
    </div>
  );
}
