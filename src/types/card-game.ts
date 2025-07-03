export type ElementType = 'fire' | 'water' | 'grass' | 'electric' | 'neutral';

export interface CardData {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  elementType: ElementType;
  imageUrl: string;
  imageHint: string;
  description: string;
}

export interface PlayerState {
  deck: CardData[];
  hand: CardData[];
  activeCard: CardData | null;
  defeatedCards: CardData[];
}

export interface GameState {
  player: PlayerState;
  com: PlayerState;
  turn: 'player' | 'com';
  phase: 'draw' | 'play' | 'battle' | 'end';
  winner: 'player' | 'com' | null;
  log: string;
  isInitialising: boolean;
  animation: {
    type: 'attack' | 'defend' | null;
    target: 'player' | 'com' | null;
  }
}
