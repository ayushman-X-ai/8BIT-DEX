export interface PokemonListResult {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  moves: {
    move: {
      name: string;
      url: string;
    };
  }[];
}

export interface PokemonType {
  damage_relations: {
    double_damage_to: {
      name: string;
      url: string;
    }[];
  };
}
