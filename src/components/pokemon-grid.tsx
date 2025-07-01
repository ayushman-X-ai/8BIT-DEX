"use client";

import { useState, useEffect } from "react";
import type { Pokemon, PokemonListResult } from "@/types/pokemon";
import { PokemonCard, PokemonCardSkeleton } from "@/components/pokemon-card";

const POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon?limit=151";

export function PokemonGrid() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(POKEAPI_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch Pokémon list");
        }
        const data = await response.json();

        const pokemonPromises: Promise<Pokemon | null>[] = data.results.map(
          async (p: PokemonListResult) => {
            try {
              const res = await fetch(p.url);
              if (!res.ok) {
                console.error(`Failed to fetch details for ${p.name}`);
                return null;
              }
              return res.json();
            } catch (e) {
              console.error(`Error fetching details for ${p.name}:`, e);
              return null;
            }
          }
        );

        const settledPokemon = await Promise.all(pokemonPromises);
        const filteredPokemon = settledPokemon.filter(p => p !== null) as Pokemon[];
        
        filteredPokemon.sort((a, b) => a.id - b.id);

        setPokemonList(filteredPokemon);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  if (error) {
    return <div className="text-destructive text-center">{error}</div>;
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {isLoading
        ? Array.from({ length: 20 }).map((_, index) => (
            <PokemonCardSkeleton key={index} />
          ))
        : pokemonList.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
    </div>
  );
}
