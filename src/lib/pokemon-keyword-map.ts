/**
 * @fileOverview A mapping of potential Google Vision API labels to Pokémon names.
 */

/**
 * A map where keys are Pokémon names (lowercase) and values are arrays of
 * potential keywords that the Vision API might return for an image of that Pokémon.
 */
export const pokemonKeywordMap: Record<string, string[]> = {
  pikachu: ['mouse', 'electric', 'yellow', 'rodent', 'pichu'],
  charmander: ['lizard', 'fire', 'orange', 'salamander', 'charmeleon', 'dinosaur'],
  squirtle: ['turtle', 'water', 'blue', 'shell', 'wartortle'],
  bulbasaur: ['dinosaur', 'plant', 'seed', 'frog', 'green', 'ivysaur'],
  jigglypuff: ['pink', 'balloon', 'circle', 'sing', 'wigglytuff'],
  meowth: ['cat', 'coin', 'persian', 'feline'],
  psyduck: ['duck', 'psychic', 'yellow', 'golduck', 'platypus'],
  snorlax: ['sleep', 'bear', 'large', 'fat', 'big'],
  eevee: ['fox', 'dog', 'brown', 'normal', 'fluffy'],
  magikarp: ['fish', 'splash', 'useless', 'gyarados', 'orange'],
};

/**
 * Finds the most likely Pokémon based on a list of labels from the Vision API.
 * It works by scoring each Pokémon based on how many of its keywords appear in the labels.
 * @param labels An array of descriptive labels from the Vision API.
 * @returns The name of the best-matching Pokémon, or null if no confident match is found.
 */
export function findPokemonByKeywords(labels: string[]): string | null {
  const labelSet = new Set(labels.map(l => l.toLowerCase()));
  const scores: Record<string, number> = {};

  // Score each Pokémon based on matching keywords
  for (const label of labelSet) {
    for (const [pokemon, keywords] of Object.entries(pokemonKeywordMap)) {
      if (keywords.includes(label)) {
        scores[pokemon] = (scores[pokemon] || 0) + 1;
      }
    }
  }

  if (Object.keys(scores).length === 0) {
    return null;
  }

  // Find the Pokémon with the highest score
  const bestMatch = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
  
  // To avoid low-confidence matches, we can require a minimum score.
  // For this simple map, a score of 1 is enough.
  if (bestMatch[1] < 1) { 
      return null;
  }

  return bestMatch[0]; // Returns the name of the Pokémon
}
