export const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-400 text-black",
  fire: "bg-red-500 text-white",
  water: "bg-blue-500 text-white",
  electric: "bg-yellow-400 text-black",
  grass: "bg-green-500 text-white",
  ice: "bg-cyan-300 text-black",
  fighting: "bg-orange-700 text-white",
  poison: "bg-purple-600 text-white",
  ground: "bg-yellow-600 text-white",
  flying: "bg-sky-400 text-black",
  psychic: "bg-pink-500 text-white",
  bug: "bg-lime-500 text-black",
  rock: "bg-stone-500 text-white",
  ghost: "bg-indigo-600 text-white",
  dragon: "bg-indigo-800 text-white",
  dark: "bg-gray-800 text-white",
  steel: "bg-slate-500 text-white",
  fairy: "bg-pink-300 text-black",
};

export const getPokemonTypeClasses = (type: string): string => {
  return POKEMON_TYPE_COLORS[type.toLowerCase()] || "bg-gray-300 text-gray-800";
};

export const getPokemonTypeBgClass = (type: string): string => {
  const classes = POKEMON_TYPE_COLORS[type.toLowerCase()] || "bg-gray-300";
  return classes.split(" ")[0];
};

export const formatPokemonId = (id: number): string => {
  return `#${id.toString().padStart(4, "0")}`;
};

export const capitalize = (s: string) => {
  if (!s) return "";
  const words = s.split('-');
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};


export const getEnglishFlavorText = (
  entries: {
    flavor_text: string;
    language: { name: string };
  }[]
): string => {
  const entry = entries.findLast((e) => e.language.name === "en");
  return entry ? entry.flavor_text.replace(/[\n\f]/g, " ") : "No description available.";
};

export const getGenderRatio = (rate: number): { male: number; female: number } | null => {
  if (rate === -1) {
    return null; // Genderless
  }
  const femalePercentage = (rate / 8) * 100;
  const malePercentage = 100 - femalePercentage;
  return { male: malePercentage, female: femalePercentage };
};
