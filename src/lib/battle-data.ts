import type { BattlePokemon, Move } from '@/types/battle';

// A small library of moves for this game
const moves: Record<string, Move> = {
  tackle: { name: 'Tackle', power: 40, type: 'normal' },
  quickAttack: { name: 'Quick Attack', power: 40, type: 'normal' },
  razorLeaf: { name: 'Razor Leaf', power: 55, type: 'grass' },
  flamethrower: { name: 'Flamethrower', power: 90, type: 'fire' },
  wingAttack: { name: 'Wing Attack', power: 60, type: 'flying' },
  surf: { name: 'Surf', power: 90, type: 'water' },
  hyperFang: { name: 'Hyper Fang', power: 80, type: 'normal' },
  karateChop: { name: 'Karate Chop', power: 50, type: 'normal' },
};

// Function to create a fresh copy of a team to avoid mutation issues on reset
export const createPlayerTeam = (): BattlePokemon[] => ([
  {
    id: 6,
    name: 'Charizard',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    backSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/6.png',
    stats: { hp: 78, attack: 84, defense: 78, speed: 100 },
    currentHp: 78,
    moves: [moves.flamethrower, moves.wingAttack],
    isFainted: false,
  },
  {
    id: 9,
    name: 'Blastoise',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    backSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/9.png',
    stats: { hp: 79, attack: 83, defense: 100, speed: 78 },
    currentHp: 79,
    moves: [moves.surf, moves.quickAttack],
    isFainted: false,
  },
  {
    id: 3,
    name: 'Venusaur',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    backSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/3.png',
    stats: { hp: 80, attack: 82, defense: 83, speed: 80 },
    currentHp: 80,
    moves: [moves.razorLeaf, moves.tackle],
    isFainted: false,
  },
]);

export const createOpponentTeam = (): BattlePokemon[] => ([
    {
        id: 18,
        name: 'Pidgeot',
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png',
        backSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/18.png',
        stats: { hp: 83, attack: 80, defense: 75, speed: 101 },
        currentHp: 83,
        moves: [moves.wingAttack, moves.quickAttack],
        isFainted: false,
    },
    {
        id: 20,
        name: 'Raticate',
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/20.png',
        backSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/20.png',
        stats: { hp: 55, attack: 81, defense: 60, speed: 97 },
        currentHp: 55,
        moves: [moves.hyperFang, moves.tackle],
        isFainted: false,
    },
    {
        id: 57,
        name: 'Primeape',
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/57.png',
        backSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/57.png',
        stats: { hp: 65, attack: 105, defense: 60, speed: 95 },
        currentHp: 65,
        moves: [moves.karateChop, moves.tackle],
        isFainted: false,
    },
]);
