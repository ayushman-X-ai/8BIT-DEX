'use client';

import React from 'react';
import { useCardGame } from '@/hooks/use-card-game';
import CardDisplay from './card-display';
import GameOverModal from './game-over-modal';
import { Button } from '@/components/ui/button';
import { Swords, RotateCcw, Shield, Loader2 } from 'lucide-react';

export default function GameBoard() {
  const { state, playCard, attack, initializeGame, endTurn } = useCardGame();
  const { player, com, turn, phase, winner, log, isInitialising, animation } = state;

  if (isInitialising) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-card border-4 border-foreground w-full max-w-lg h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-headline text-lg">Shuffling Decks...</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {winner && <GameOverModal winner={winner} onPlayAgain={initializeGame} />}
      
      {/* COM's Area */}
      <div className="w-full flex flex-col items-center mb-2">
        <div className="flex gap-2 sm:gap-4 items-center">
          <CardDisplay card={com.activeCard} isFlipped={!com.activeCard} isDefending={animation.target === 'com'}/>
          <div className="flex flex-col items-center gap-2">
             <div className="px-2 py-1 bg-card border-2 border-foreground text-xs">DECK: {com.deck.length}</div>
             <div className="px-2 py-1 bg-card border-2 border-foreground text-xs">HAND: {com.hand.length}</div>
          </div>
        </div>
      </div>
      
      {/* Center Area / Log */}
      <div className="w-full max-w-md h-12 my-2 bg-black/50 border-y-4 border-foreground/50 text-white font-code text-xs flex items-center justify-center p-2 text-center">
        <p className="animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">{log}</p>
      </div>

      {/* Player's Area */}
      <div className="w-full flex flex-col items-center mt-2">
        <div className="flex gap-2 sm:gap-4 items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="px-2 py-1 bg-card border-2 border-foreground text-xs">DECK: {player.deck.length}</div>
            <Button 
                onClick={attack} 
                disabled={turn !== 'player' || phase !== 'battle' || !!animation.type}
                className="border-4 border-foreground hover:bg-primary/90"
            >
                <Swords /> Attack
            </Button>
          </div>
          <CardDisplay card={player.activeCard} isPlayer isAttacking={animation.target === 'player'} isFlipped={!player.activeCard}/>
          <div className="flex flex-col items-center gap-2">
            <Button 
                onClick={initializeGame} 
                variant="secondary"
                size="icon"
                className="border-2 border-foreground h-10 w-10"
                aria-label="New Game"
            >
                <RotateCcw />
            </Button>
            <Button 
                onClick={endTurn} 
                disabled={turn !== 'player' || phase !== 'battle' || !!animation.type}
                variant="secondary"
                size="icon"
                className="border-2 border-foreground h-10 w-10"
                aria-label="End Turn"
            >
                <Shield />
            </Button>
          </div>
        </div>
      </div>

      {/* Player's Hand */}
      <div className="w-full bg-card border-4 border-foreground mt-4 p-2">
          <p className="text-center text-xs font-headline mb-2 uppercase">Your Hand</p>
          <div className="flex justify-center items-center gap-2 min-h-[10rem] overflow-x-auto p-2">
            {player.hand.length > 0 ? player.hand.map(card => (
              <CardDisplay 
                key={card.id} 
                card={card} 
                isPlayer
                onClick={() => playCard(card.id)}
              />
            )) : (
              <p className="text-muted-foreground text-sm">No cards in hand.</p>
            )}
          </div>
      </div>
    </div>
  );
}
