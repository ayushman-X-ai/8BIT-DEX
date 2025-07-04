'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface GameOverScreenProps {
  winnerName: string | null;
  onRestart: () => void;
}

export default function GameOverScreen({ winnerName, onRestart }: GameOverScreenProps) {
  const message = winnerName ? `${winnerName} Wins!` : "It's a Draw!";
  const subMessage = winnerName ? 'A true brawling champion!' : 'Both fighters were knocked out!';

  return (
    <div className="w-full h-full bg-black/80 flex flex-col items-center justify-center p-8 text-center text-white z-20">
      <h2 className="text-4xl font-headline text-primary uppercase tracking-widest mb-2 animate-pulse">{message}</h2>
      <p className="text-muted-foreground mb-8">{subMessage}</p>
      <Button onClick={onRestart} className="font-headline text-lg" size="lg">
        Play Again
      </Button>
    </div>
  );
}
