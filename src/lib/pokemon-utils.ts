export const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-300 text-gray-800",
  fire: "bg-red-400 text-white",
  water: "bg-blue-400 text-white",
  electric: "bg-yellow-300 text-gray-800",
  grass: "bg-green-400 text-white",
  ice: "bg-cyan-300 text-gray-800",
  fighting: "bg-orange-500 text-white",
  poison: "bg-purple-500 text-white",
  ground: "bg-yellow-500 text-white",
  flying: "bg-indigo-300 text-gray-800",
  psychic: "bg-pink-400 text-white",
  bug: "bg-lime-400 text-gray-800",
  rock: "bg-stone-400 text-white",
  ghost: "bg-violet-500 text-white",
  dragon: "bg-indigo-500 text-white",
  dark: "bg-gray-700 text-white",
  steel: "bg-slate-400 text-gray-800",
  fairy: "bg-pink-300 text-gray-800",
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
  return s.charAt(0).toUpperCase() + s.slice(1);
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
