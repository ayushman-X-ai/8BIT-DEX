import type { CardData, ElementType } from "@/types/card-game";

export const initialCards: CardData[] = [
    {
      id: 1, name: 'Pikachu', maxHp: 60, hp: 60, attack: 20, elementType: 'electric',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', imageHint: 'electric mouse',
      description: 'It occasionally uses an electric shock to recharge a fellow Pikachu that is in a weakened state.'
    },
    {
      id: 2, name: 'Squirtle', maxHp: 80, hp: 80, attack: 15, elementType: 'water',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', imageHint: 'water turtle',
      description: 'When it retracts its long neck into its shell, it squirts out water with vigorous force.'
    },
    {
      id: 3, name: 'Charmander', maxHp: 50, hp: 50, attack: 25, elementType: 'fire',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', imageHint: 'fire lizard',
      description: 'It has a preference for hot things. When it rains, steam is said to spout from the tip of its tail.'
    },
    {
      id: 4, name: 'Bulbasaur', maxHp: 70, hp: 70, attack: 18, elementType: 'grass',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', imageHint: 'seed pokemon',
      description: 'There is a plant seed on its back right from the day this Pokémon is born. The seed slowly grows larger.'
    },
    {
      id: 5, name: 'Eevee', maxHp: 55, hp: 55, attack: 22, elementType: 'neutral',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', imageHint: 'evolution pokemon',
      description: 'It has the ability to alter the composition of its body to suit its surrounding environment.'
    },
    {
      id: 6, name: 'Raichu', maxHp: 100, hp: 100, attack: 30, elementType: 'electric',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png', imageHint: 'electric mouse',
      description: 'Its long tail serves as a ground to protect itself from its own high-voltage power.'
    },
     {
      id: 7, name: 'Vulpix', maxHp: 70, hp: 70, attack: 35, elementType: 'fire',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png', imageHint: 'fire fox',
      description: 'While young, it has six gorgeous tails. When it grows, several new tails are sprouted.'
    },
    {
      id: 8, name: 'Gyarados', maxHp: 90, hp: 90, attack: 25, elementType: 'water',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png', imageHint: 'water serpent',
      description: 'Once it appears, it goes on a rampage. It remains enraged until it demolishes everything around it.'
    }
];

// Simple elemental advantages: Key is strong against Value
export const elementalAdvantages: Record<ElementType, ElementType> = {
    fire: 'grass',
    grass: 'water',
    water: 'fire',
    electric: 'water',
    neutral: 'neutral' // No advantage
};
