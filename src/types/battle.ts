export interface Move {
  name: string;
  power: number;
  type: 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'flying';
}

export interface BattlePokemon {
  id: number;
  name:string;
  spriteUrl: string;
  backSpriteUrl: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  currentHp: number;
  moves: Move[];
  isFainted: boolean;
}

export type BattleTeam = BattlePokemon[];
