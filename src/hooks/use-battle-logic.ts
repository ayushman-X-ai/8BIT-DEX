'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BattleTeam, BattlePokemon, Move } from '@/types/battle';
import { createPlayerTeam, createOpponentTeam } from '@/lib/battle-data';
import { produce } from 'immer';

type GamePhase = 'pre-battle' | 'player-turn' | 'opponent-turn' | 'post-battle';
type AnimationTrigger = 'idle' | 'attacking' | 'hit' | 'fainted';

const useBattleLogic = () => {
  const [playerTeam, setPlayerTeam] = useState<BattleTeam>([]);
  const [opponentTeam, setOpponentTeam] = useState<BattleTeam>([]);
  
  const [playerPokemon, setPlayerPokemon] = useState<BattlePokemon | null>(null);
  const [opponentPokemon, setOpponentPokemon] = useState<BattlePokemon | null>(null);

  const [phase, setPhase] = useState<GamePhase>('pre-battle');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isSelectingMove, setIsSelectingMove] = useState(false);
  const [isSelectingPokemon, setIsSelectingPokemon] = useState(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  const [animationState, setAnimationState] = useState<{player: AnimationTrigger, opponent: AnimationTrigger}>({ player: 'idle', opponent: 'idle' });

  const addToLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  const initializeBattle = useCallback(() => {
    const newPlayerTeam = createPlayerTeam();
    const newOpponentTeam = createOpponentTeam();
    setPlayerTeam(newPlayerTeam);
    setOpponentTeam(newOpponentTeam);
    setPlayerPokemon(newPlayerTeam[0]);
    setOpponentPokemon(newOpponentTeam[0]);
    setBattleLog(['Battle started!']);
    setWinner(null);
    setPhase('player-turn');
  }, []);

  useEffect(() => {
    initializeBattle();
  }, [initializeBattle]);

  const handleRestart = () => {
    initializeBattle();
  };

  const processAttack = (attacker: BattlePokemon, defender: BattlePokemon, move: Move) => {
    const damage = Math.floor((attacker.stats.attack / defender.stats.defense) * move.power * 0.2 + 2);
    const newHp = Math.max(0, defender.currentHp - damage);

    addToLog(`${attacker.name} used ${move.name}! It dealt ${damage} damage.`);

    return newHp;
  };

  const handlePlayerMove = (move: Move) => {
    if (!playerPokemon || !opponentPokemon || phase !== 'player-turn') return;
    
    setIsSelectingMove(false);
    
    const playerGoesFirst = playerPokemon.stats.speed >= opponentPokemon.stats.speed;
    
    const executeTurn = (attacker: BattlePokemon, defender: BattlePokemon, attackMove: Move, isPlayerAttacking: boolean) => {
        setAnimationState(isPlayerAttacking ? { player: 'attacking', opponent: 'idle' } : { player: 'idle', opponent: 'attacking' });
        
        setTimeout(() => {
            const newDefenderHp = processAttack(attacker, defender, attackMove);
            setAnimationState(isPlayerAttacking ? { player: 'attacking', opponent: 'hit' } : { player: 'hit', opponent: 'attacking' });
            
            if (isPlayerAttacking) {
                const updatedOpponent = { ...defender, currentHp: newDefenderHp };
                setOpponentPokemon(updatedOpponent);
                if (newDefenderHp <= 0) handleFaint('opponent', updatedOpponent);
            } else {
                const updatedPlayer = { ...defender, currentHp: newDefenderHp };
                setPlayerPokemon(updatedPlayer);
                if (newDefenderHp <= 0) handleFaint('player', updatedPlayer);
            }

            setTimeout(() => setAnimationState({ player: 'idle', opponent: 'idle' }), 300);

        }, 500);
    };

    if (playerGoesFirst) {
        executeTurn(playerPokemon, opponentPokemon, move, true);
        setTimeout(() => {
            if (opponentPokemon.currentHp > 0) {
                 const opponentMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
                 executeTurn(opponentPokemon, playerPokemon, opponentMove, false);
            }
        }, 1500);
    } else {
        const opponentMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
        executeTurn(opponentPokemon, playerPokemon, opponentMove, false);
        setTimeout(() => {
            if (playerPokemon.currentHp > 0) {
                executeTurn(playerPokemon, opponentPokemon, move, true);
            }
        }, 1500);
    }
  };

  const handleFaint = (faintedBy: 'player' | 'opponent', faintedPokemon: BattlePokemon) => {
    addToLog(`${faintedPokemon.name} fainted!`);
    const teamToUpdate = faintedBy === 'opponent' ? opponentTeam : playerTeam;
    const setTeam = faintedBy === 'opponent' ? setOpponentTeam : setPlayerTeam;

    const updatedTeam = produce(teamToUpdate, draft => {
        const p = draft.find(p => p.id === faintedPokemon.id);
        if (p) p.isFainted = true;
    });
    setTeam(updatedTeam);
    
    const nextPokemon = updatedTeam.find(p => !p.isFainted);
    if (!nextPokemon) {
        setWinner(faintedBy === 'opponent' ? 'player' : 'opponent');
        setPhase('post-battle');
        return;
    }
    
    setTimeout(() => {
        if (faintedBy === 'opponent') {
            addToLog(`Opponent sent out ${nextPokemon.name}!`);
            setOpponentPokemon(nextPokemon);
        } else {
            addToLog(`You must choose another Pokémon!`);
            setIsSelectingPokemon(true);
        }
    }, 1000);
  };
  
  const handleMoveSelect = (move: Move | null, isInitiating = false) => {
    if (isInitiating) {
      setIsSelectingMove(true);
      return;
    }
    if (move) {
      handlePlayerMove(move);
    }
  };

  const handleSwitchPokemon = (index: number | null, isInitiating = false, isCancelling = false) => {
    if (isInitiating) {
        setIsSelectingPokemon(true);
        return;
    }
    if(isCancelling){
        setIsSelectingPokemon(false);
        return;
    }
    if (index !== null) {
        const newPokemon = playerTeam[index];
        if (newPokemon && !newPokemon.isFainted && newPokemon.id !== playerPokemon?.id) {
            setPlayerPokemon(newPokemon);
            setIsSelectingPokemon(false);
            addToLog(`Go ${newPokemon.name}!`);
            // Switching costs a turn, so let opponent attack
            setTimeout(() => {
                if(opponentPokemon) {
                    const opponentMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
                    processAttack(opponentPokemon, newPokemon, opponentMove);
                }
            }, 1000);
        }
    }
  };


  const gameState = {
    turn: phase === 'player-turn' ? 'player' : 'opponent',
    battleLog,
    isSelectingMove,
    isSelectingPokemon,
    playerTeam,
    winner,
  };

  return { 
    gameState, 
    playerPokemon, 
    opponentPokemon, 
    handleMoveSelect,
    handleSwitchPokemon,
    handleRestart,
    animationState
  };
};

export { useBattleLogic };
