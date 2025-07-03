'use client';

import { useReducer, useEffect } from 'react';
import type { GameState, CardData } from '@/types/card-game';
import { initialCards, elementalAdvantages } from '@/lib/card-data';

// --- UTILITY FUNCTIONS ---
const shuffleDeck = (deck: CardData[]): CardData[] => {
  return [...deck].sort(() => Math.random() - 0.5);
};

const drawCards = (deck: CardData[], count: number): { hand: CardData[]; newDeck: CardData[] } => {
  const hand = deck.slice(0, count);
  const newDeck = deck.slice(count);
  return { hand, newDeck };
};

// --- REDUCER SETUP ---
type Action =
  | { type: 'INITIALIZE_GAME' }
  | { type: 'PLAY_CARD'; card: CardData }
  | { type: 'ATTACK' }
  | { type: 'END_TURN' }
  | { type: 'COM_TURN' }
  | { type: 'SET_ANIMATION', animation: GameState['animation'] }
  | { type: 'CLEAR_ANIMATION' };

const initialGameState: GameState = {
  player: { deck: [], hand: [], activeCard: null, defeatedCards: [] },
  com: { deck: [], hand: [], activeCard: null, defeatedCards: [] },
  turn: 'player',
  phase: 'draw',
  winner: null,
  log: 'Game starting...',
  isInitialising: true,
  animation: { type: null, target: null },
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INITIALIZE_GAME': {
      const shuffled = shuffleDeck(initialCards.map(c => ({...c, hp: c.maxHp })));
      const playerDeck = shuffled.slice(0, Math.floor(shuffled.length / 2));
      const comDeck = shuffled.slice(Math.floor(shuffled.length / 2));

      const { hand: playerHand, newDeck: newPlayerDeck } = drawCards(playerDeck, 3);
      const { hand: comHand, newDeck: newComDeck } = drawCards(comDeck, 3);

      return {
        ...initialGameState,
        player: { ...initialGameState.player, deck: newPlayerDeck, hand: playerHand },
        com: { ...initialGameState.com, deck: newComDeck, hand: comHand },
        log: 'Your turn! Play a card.',
        isInitialising: false,
      };
    }

    case 'PLAY_CARD': {
      if (state.turn !== 'player' || state.player.activeCard) return state;
      const cardToPlay = action.card;
      return {
        ...state,
        player: {
          ...state.player,
          hand: state.player.hand.filter(c => c.id !== cardToPlay.id),
          activeCard: cardToPlay,
        },
        phase: 'battle',
        log: `You played ${cardToPlay.name}! Your turn to attack.`
      };
    }

    case 'ATTACK': {
        if (state.turn !== 'player' || !state.player.activeCard || !state.com.activeCard) return state;

        const playerCard = state.player.activeCard;
        let comCard = state.com.activeCard;
        
        let damage = playerCard.attack;
        const advantage = elementalAdvantages[playerCard.elementType] === comCard.elementType;
        if (advantage) damage = Math.floor(damage * 1.5);

        comCard = { ...comCard, hp: Math.max(0, comCard.hp - damage) };

        const log = advantage ? `${playerCard.name} lands a critical hit on ${comCard.name} for ${damage} damage!` : `${playerCard.name} attacks ${comCard.name} for ${damage} damage.`;

        return {
            ...state,
            com: { ...state.com, activeCard: comCard },
            log,
            phase: 'end'
        };
    }
    
    case 'END_TURN': {
        if (state.turn !== 'player' || state.winner) return state;
        
        // Check if COM's card was defeated
        let nextComState = { ...state.com };
        if (state.com.activeCard && state.com.activeCard.hp <= 0) {
            const { hand, newDeck } = drawCards(state.com.deck, 1);
            nextComState = {
                ...state.com,
                deck: newDeck,
                hand: [...state.com.hand, ...hand],
                defeatedCards: [...state.com.defeatedCards, state.com.activeCard],
                activeCard: null
            };
        }

        return { ...state, turn: 'com', com: nextComState, log: "Opponent's turn..." };
    }

    case 'COM_TURN': {
        let newState = { ...state };
        let comCard = newState.com.activeCard;
        let playerCard = newState.player.activeCard;

        // 1. Play a card if slot is empty
        if (!comCard && newState.com.hand.length > 0) {
            const cardToPlay = newState.com.hand.sort((a,b) => b.attack - a.attack)[0];
            newState = {
                ...newState,
                com: {
                    ...newState.com,
                    hand: newState.com.hand.filter(c => c.id !== cardToPlay.id),
                    activeCard: cardToPlay,
                },
                log: `Opponent played ${cardToPlay.name}.`
            };
            comCard = cardToPlay;
        }

        // 2. Attack if possible
        if (comCard && playerCard) {
            let damage = comCard.attack;
            const advantage = elementalAdvantages[comCard.elementType] === playerCard.elementType;
            if (advantage) damage = Math.floor(damage * 1.5);

            playerCard = { ...playerCard, hp: Math.max(0, playerCard.hp - damage) };

            newState = {
                ...newState,
                player: { ...newState.player, activeCard: playerCard },
                log: advantage ? `Opponent's ${comCard.name} lands a critical hit for ${damage} damage!` : `Opponent's ${comCard.name} attacks for ${damage} damage.`
            };
        }

        // 3. Check if player's card was defeated
        if (playerCard && playerCard.hp <= 0) {
            const { hand, newDeck } = drawCards(newState.player.deck, 1);
            newState = {
                ...newState,
                player: {
                    ...newState.player,
                    deck: newDeck,
                    hand: [...newState.player.hand, ...hand],
                    defeatedCards: [...newState.player.defeatedCards, playerCard],
                    activeCard: null
                }
            }
            newState.log = "Your creature was defeated! Play another card.";
        }

        // 4. Check for win/loss conditions
        const playerHasNoCards = newState.player.hand.length === 0 && newState.player.deck.length === 0 && !newState.player.activeCard;
        const comHasNoCards = newState.com.hand.length === 0 && newState.com.deck.length === 0 && !newState.com.activeCard;

        if (playerHasNoCards) newState.winner = 'com';
        if (comHasNoCards) newState.winner = 'player';
        
        return {
            ...newState,
            turn: 'player',
            phase: newState.player.activeCard ? 'battle' : 'play'
        };
    }
    
    case 'SET_ANIMATION': return { ...state, animation: action.animation };
    case 'CLEAR_ANIMATION': return { ...state, animation: { type: null, target: null } };

    default:
      return state;
  }
}

// --- THE HOOK ---
export function useCardGame() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    dispatch({ type: 'INITIALIZE_GAME' });
  }, []);

  useEffect(() => {
    if (state.winner) return;

    if (state.turn === 'com') {
      const timer = setTimeout(() => dispatch({ type: 'COM_TURN' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.turn, state.winner]);
  
  useEffect(() => {
      if(state.animation.type) {
          const timer = setTimeout(() => dispatch({type: 'CLEAR_ANIMATION'}), 500);
          return () => clearTimeout(timer);
      }
  }, [state.animation]);

  // Exposed actions
  const playCard = (cardId: number) => {
    const card = state.player.hand.find(c => c.id === cardId);
    if(card && state.turn === 'player' && !state.player.activeCard) {
      dispatch({ type: 'PLAY_CARD', card });
    }
  };

  const attack = () => {
    if(state.turn === 'player' && state.phase === 'battle') {
        dispatch({ type: 'SET_ANIMATION', animation: { type: 'attack', target: 'player' }});
        const attackTimer = setTimeout(() => {
            dispatch({ type: 'ATTACK' });
            dispatch({ type: 'SET_ANIMATION', animation: { type: 'defend', target: 'com' }});
            const endTimer = setTimeout(() => dispatch({ type: 'END_TURN'}), 1000);
            return () => clearTimeout(endTimer);
        }, 500);
        return () => clearTimeout(attackTimer);
    }
  };

  const endTurn = () => {
    if(state.turn === 'player' && state.phase === 'battle') {
        dispatch({ type: 'END_TURN' });
    }
  }

  const initializeGame = () => {
      dispatch({ type: 'INITIALIZE_GAME' });
  };

  return { state, playCard, attack, initializeGame, endTurn };
}
