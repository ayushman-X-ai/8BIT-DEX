'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Frown, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  winner: 'player' | 'com' | null;
  onPlayAgain: () => void;
}

export default function GameOverModal({ winner, onPlayAgain }: GameOverModalProps) {
  if (!winner) return null;

  const isPlayerWinner = winner === 'player';

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card border-4 border-foreground p-8 flex flex-col items-center justify-center text-center max-w-sm">
        {isPlayerWinner ? (
          <Award className="w-16 h-16 text-primary mb-4" />
        ) : (
          <Frown className="w-16 h-16 text-muted-foreground mb-4" />
        )}
        <h2 className="text-3xl font-headline mb-2">
          {isPlayerWinner ? 'YOU WIN!' : 'YOU LOSE'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isPlayerWinner
            ? 'You have proven your skill. Excellent battle!'
            : 'The opponent was too strong this time. Better luck next time!'}
        </p>
        <Button onClick={onPlayAgain} size="lg" className="border-4 border-foreground">
          <RotateCcw className="mr-2" />
          Play Again
        </Button>
      </div>
    </div>
  );
}
