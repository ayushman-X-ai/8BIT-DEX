'use client';

import React from 'react';
import Image from 'next/image';
import { useBattleLogic } from '@/hooks/use-battle-logic';
import type { BattlePokemon, Move } from '@/types/battle';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Swords, Shield, ChevronsRight, RotateCw } from 'lucide-react';

const HealthBar = ({ current, max }: { current: number; max: number }) => {
  const percentage = Math.max(0, (current / max) * 100);
  const color = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full bg-slate-200 border border-slate-900 h-2">
      <div
        className={cn("h-full transition-all duration-300", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const BattleHud = ({ pokemon, isPlayer = false }: { pokemon: BattlePokemon; isPlayer?: boolean }) => (
  <div className={cn("bg-card/90 border-2 border-foreground p-2 w-40 sm:w-48 text-left", { 'rounded-tr-lg rounded-bl-lg': isPlayer, 'rounded-tl-lg rounded-br-lg': !isPlayer })}>
    <h3 className="font-bold font-headline text-xs sm:text-sm capitalize truncate">{pokemon.name}</h3>
    <div className="flex items-center gap-2 text-xs">
      <span>HP:</span>
      <HealthBar current={pokemon.currentHp} max={pokemon.stats.hp} />
    </div>
  </div>
);

export default function BattleScreen() {
  const {
    gameState,
    playerPokemon,
    opponentPokemon,
    handleMoveSelect,
    handleSwitchPokemon,
    handleRestart,
    animationState,
  } = useBattleLogic();

  const { turn, battleLog, isSelectingMove, isSelectingPokemon, winner } = gameState;

  return (
    <div className="w-full max-w-2xl aspect-[4/3] bg-card border-4 border-foreground p-2 sm:p-4 flex flex-col relative overflow-hidden">
      {/* Battle Scene */}
      <div 
        className="flex-grow bg-cover bg-center relative border-2 border-foreground" 
        style={{ backgroundImage: "url('https://placehold.co/600x400.png')", imageRendering: 'pixelated' }}
        data-ai-hint="pixel landscape"
      >
        {/* Opponent */}
        <div className="absolute top-[10%] right-[5%] sm:right-[10%] w-24 h-24 sm:w-32 sm:h-32">
          {opponentPokemon && (
            <>
              <Image
                src={opponentPokemon.spriteUrl}
                alt={opponentPokemon.name}
                width={128}
                height={128}
                className={cn("object-contain transition-transform duration-300", animationState.opponent === 'hit' && 'animate-flash')}
              />
              <div className="absolute -top-4 -left-16">
                <BattleHud pokemon={opponentPokemon} />
              </div>
            </>
          )}
        </div>

        {/* Player */}
        <div className="absolute bottom-[22%] left-[5%] sm:left-[10%] w-28 h-28 sm:w-40 sm:h-40">
          {playerPokemon && (
            <>
              <Image
                src={playerPokemon.backSpriteUrl}
                alt={playerPokemon.name}
                width={160}
                height={160}
                className={cn("object-contain transition-transform duration-300", animationState.player === 'attacking' && 'animate-shake', animationState.player === 'hit' && 'animate-flash')}
              />
              <div className="absolute -bottom-12 -right-16">
                 <BattleHud pokemon={playerPokemon} isPlayer />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Panel */}
      <div className="h-28 sm:h-32 mt-2 sm:mt-4 border-2 border-foreground bg-background p-2 grid grid-cols-3 gap-2">
        <div className="col-span-1 border-2 border-foreground/30 p-2 overflow-y-auto">
            {/* Action Buttons: Fight / Switch */}
            {!isSelectingMove && !isSelectingPokemon && turn === 'player' && (
                <div className="flex flex-col gap-2 h-full justify-center">
                    <Button onClick={() => handleMoveSelect(null, true)} variant="outline" className="text-xs sm:text-sm w-full border-2 border-foreground">
                        <Swords className="mr-2 h-4 w-4" /> Fight
                    </Button>
                    <Button onClick={() => handleSwitchPokemon(null, true)} variant="outline" className="text-xs sm:text-sm w-full border-2 border-foreground">
                        <Shield className="mr-2 h-4 w-4" /> Pokémon
                    </Button>
                </div>
            )}
             {/* Battle Log */}
            {(turn !== 'player' || isSelectingMove || isSelectingPokemon) && (
                 <div className="text-left font-code text-[10px] sm:text-xs leading-tight h-full overflow-y-auto pr-1">
                    {battleLog.slice(-5).map((msg, i) => <p key={i}>{`> ${msg}`}</p>)}
                </div>
            )}
        </div>
        <div className="col-span-2 border-2 border-foreground/30 p-2 text-xs sm:text-sm">
            {/* Move Selection */}
            {isSelectingMove && playerPokemon && (
                 <div className="grid grid-cols-2 gap-2 h-full">
                    {playerPokemon.moves.map(move => (
                        <Button key={move.name} onClick={() => handleMoveSelect(move)} variant="secondary" className="border-2 border-foreground text-xs sm:text-sm justify-between">
                            {move.name} <ChevronsRight />
                        </Button>
                    ))}
                 </div>
            )}
            {/* Pokemon Selection */}
            {isSelectingPokemon && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-full">
                    {gameState.playerTeam.map((p, i) => (
                        <Button key={p.id} onClick={() => handleSwitchPokemon(i)} disabled={p.isFainted || p.id === playerPokemon?.id} className="border-2 border-foreground text-xs sm:text-sm justify-between">
                            <span className="capitalize">{p.name}</span>
                            <span className="text-muted-foreground">{p.isFainted ? 'FAINTED' : `${p.currentHp}/${p.stats.hp}`}</span>
                        </Button>
                    ))}
                    <Button onClick={() => handleSwitchPokemon(null, false, true)} variant="ghost" className="text-xs">Back</Button>
                </div>
            )}
            {/* Default Text */}
            {!isSelectingMove && !isSelectingPokemon && (
                <div className="flex items-center justify-center h-full">
                    <p className="font-code text-xs sm:text-sm text-muted-foreground">
                        {turn === 'player' ? "What will you do?" : "Opponent is thinking..."}
                    </p>
                </div>
            )}
        </div>
      </div>

      {/* Winner Overlay */}
      {winner && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center animate-in fade-in-0">
          <h2 className="text-4xl font-headline text-primary animate-pulse">{winner === 'player' ? 'You Win!' : 'You Lose...'}</h2>
          <Button onClick={handleRestart} className="mt-4 border-2 border-foreground">
            <RotateCw className="mr-2" />
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
}
