'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CharacterSelect from '@/components/game/brawler/CharacterSelect';
import GameScreen from '@/components/game/brawler/GameScreen';
import GameOverScreen from '@/components/game/brawler/GameOverScreen';
import type { BrawlerCharacter } from '@/types/brawler';
import { CHARACTERS } from '@/lib/brawler-data';

export type GameStage = 'select' | 'fight' | 'end';

export default function DexBrawlersPage() {
  const [gameStage, setGameStage] = useState<GameStage>('select');
  const [playerCharacter, setPlayerCharacter] = useState<BrawlerCharacter>(CHARACTERS[0]);
  const [opponentCharacter, setOpponentCharacter] = useState<BrawlerCharacter>(CHARACTERS[1]);
  const [winner, setWinner] = useState<string | null>(null);

  const handleCharacterSelect = (character: BrawlerCharacter) => {
    setPlayerCharacter(character);
    // Basic AI opponent selection
    const availableOpponents = CHARACTERS.filter(c => c.id !== character.id);
    setOpponentCharacter(availableOpponents[Math.floor(Math.random() * availableOpponents.length)]);
    setGameStage('fight');
  };

  const handleGameOver = (winningPlayerName: string | null) => {
    setWinner(winningPlayerName);
    setGameStage('end');
  };

  const handleRestart = () => {
    setWinner(null);
    setGameStage('select');
  };

  const renderGameStage = () => {
    switch (gameStage) {
      case 'select':
        return <CharacterSelect onCharacterSelect={handleCharacterSelect} />;
      case 'fight':
        return <GameScreen playerChar={playerCharacter} opponentChar={opponentCharacter} onGameOver={handleGameOver} />;
      case 'end':
        return <GameOverScreen winnerName={winner} onRestart={handleRestart} />;
      default:
        return <CharacterSelect onCharacterSelect={handleCharacterSelect} />;
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-body" style={{
      backgroundImage: 'radial-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px)',
      backgroundSize: '15px 15px',
    }}>
      <header className="py-2 px-4 md:px-8 sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b-4 border-foreground">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" aria-label="Back to 8BitDex">
            <Button variant="outline" size="xs" className="border-2 border-foreground">
              <ArrowLeft />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 text-primary font-headline">
            <Gamepad2 className="h-5 w-5" />
            <h1 className="text-sm sm:text-lg tracking-wider">DEX BRAWLERS</h1>
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-4xl aspect-[4/3] bg-black border-4 border-foreground relative overflow-hidden">
          {renderGameStage()}
        </div>
      </main>
    </div>
  );
}
