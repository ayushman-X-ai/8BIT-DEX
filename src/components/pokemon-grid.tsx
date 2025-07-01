"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Pokemon, PokemonListResult } from "@/types/pokemon";
import { PokemonCard, PokemonCardSkeleton } from "@/components/pokemon-card";
import { Button } from "@/components/ui/button";

const INITIAL_POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon?limit=20";
const MAX_POKEMON_ID = 1025;

export function PokemonGrid({ searchQuery }: { searchQuery: string }) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  const fetchPokemon = useCallback(async (url: string) => {
    if (!url) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch Pokémon list");
      }
      const data = await response.json();
      
      const filteredResults = data.results.filter(
        (p: PokemonListResult) => {
          const urlParts = p.url.split("/");
          const id = parseInt(urlParts[urlParts.length - 2]);
          return id <= MAX_POKEMON_ID;
        }
      );

      if (!data.next || filteredResults.length < data.results.length) {
        setNextUrl(null);
      } else {
        setNextUrl(data.next);
      }

      const pokemonPromises: Promise<Pokemon | null>[] = filteredResults.map(
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
      const newPokemon = settledPokemon.filter((p) => p !== null) as Pokemon[];

      setPokemonList((prevList) => {
        const existingIds = new Set(prevList.map((p) => p.id));
        const uniqueNewPokemon = newPokemon.filter(
          (p) => !existingIds.has(p.id)
        );
        const combined = [...prevList, ...uniqueNewPokemon];
        combined.sort((a, b) => a.id - b.id);
        return combined;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPokemon(INITIAL_POKEAPI_URL);
  }, [fetchPokemon]);

  const handleLoadMore = () => {
    if (nextUrl && !isLoading) {
      fetchPokemon(nextUrl);
    }
  };

  const filteredPokemon = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return pokemonList;
    }
    return pokemonList.filter(pokemon =>
      pokemon.name.toLowerCase().includes(query) ||
      String(pokemon.id).includes(query)
    );
  }, [pokemonList, searchQuery]);

  if (error && pokemonList.length === 0) {
    return <div className="text-destructive text-center">{error}</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {filteredPokemon.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
        {isLoading &&
          Array.from({ length: 20 }).map((_, index) => (
            <PokemonCardSkeleton key={`skeleton-${pokemonList.length + index}`} />
          ))}
      </div>

      {searchQuery && filteredPokemon.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground py-16">
          <p className="text-lg font-semibold">No Pokémon found</p>
          <p>Your search for &quot;{searchQuery}&quot; did not return any results.</p>
        </div>
      )}

      {error && (
        <div className="text-destructive text-center my-4">{error}</div>
      )}
      <div className="flex justify-center my-8">
        {!searchQuery && nextUrl && !isLoading && (
          <Button onClick={handleLoadMore}>Load More Pokémon</Button>
        )}
      </div>
    </div>
  );
}
