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
    e.currentTarget.setPointerCapture(e.pointerId);
    onDirectionChange(direction);
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    onDirectionChange('none');
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp} // Handles case where pointer leaves screen
      className={cn(
        "bg-gray-700 border-2 border-gray-500 text-white flex items-center justify-center active:bg-primary active:border-primary-foreground focus:outline-none",
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
    <div className="grid grid-cols-3 grid-rows-3 w-36 h-36 sm:w-40 sm:h-40 touch-none">
      <div />
      <JoystickButton direction="up" onDirectionChange={onDirectionChange}><ArrowUp size={24} /></JoystickButton>
      <div />

      <JoystickButton direction="left" onDirectionChange={onDirectionChange}><ArrowLeft size={24} /></JoystickButton>
      <div className="bg-gray-600 border-y-2 border-gray-500" />
      <JoystickButton direction="right" onDirectionChange={onDirectionChange}><ArrowRight size={24} /></JoystickButton>

      <div />
      <JoystickButton direction="down" onDirectionChange={onDirectionChange}><ArrowDown size={24} /></JoystickButton>
      <div />
    </div>
  );
}
