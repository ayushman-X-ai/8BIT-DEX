import type { CardData, ElementType } from "@/types/card-game";

export const initialCards: CardData[] = [
    {
      id: 1, name: 'Spark-Pup', maxHp: 60, hp: 60, attack: 20, elementType: 'electric',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', imageHint: 'electric dog',
      description: 'A zappy pup that loves to play fetch.'
    },
    {
      id: 2, name: 'Aqua-Turtle', maxHp: 80, hp: 80, attack: 15, elementType: 'water',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', imageHint: 'water turtle',
      description: 'Slow and steady, with a powerful water jet.'
    },
    {
      id: 3, name: 'Ember-Cub', maxHp: 50, hp: 50, attack: 25, elementType: 'fire',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', imageHint: 'fire cub',
      description: 'A fiery bear cub with a warm heart.'
    },
    {
      id: 4, name: 'Geo-Sprite', maxHp: 70, hp: 70, attack: 18, elementType: 'grass',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', imageHint: 'forest sprite',
      description: 'A tiny guardian of the forest, made of leaves and vines.'
    },
    {
      id: 5, name: 'Byte-Wyrm', maxHp: 55, hp: 55, attack: 22, elementType: 'neutral',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', imageHint: 'digital worm',
      description: 'A digital creature born from corrupted data.'
    },
    {
      id: 6, name: 'Giga-Volt', maxHp: 100, hp: 100, attack: 30, elementType: 'electric',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png', imageHint: 'electric monster',
      description: 'The evolved form of Spark-Pup, crackling with power.'
    },
     {
      id: 7, name: 'Flame-Tail', maxHp: 70, hp: 70, attack: 35, elementType: 'fire',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png', imageHint: 'fire lizard',
      description: 'Its tail burns brighter when it is excited.'
    },
    {
      id: 8, name: 'Hydro-Fang', maxHp: 90, hp: 90, attack: 25, elementType: 'water',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png', imageHint: 'water snake',
      description: 'A serpent of the deep, its bite is venomous.'
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
