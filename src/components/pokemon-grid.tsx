"use client";

import { useState, useEffect, useCallback } from "react";
import type { Pokemon, PokemonListResult } from "@/types/pokemon";
import { PokemonCard, PokemonCardSkeleton } from "@/components/pokemon-card";
import { Button } from "@/components/ui/button";

const INITIAL_POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon?limit=20";
const ALL_POKEMON_URL = "https://pokeapi.co/api/v2/pokemon?limit=1025";

export function PokemonGrid({ searchQuery }: { searchQuery: string }) {
  // Master list for searching
  const [allPokemonList, setAllPokemonList] = useState<PokemonListResult[]>([]);
  
  // List for browsing/paginating
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(INITIAL_POKEAPI_URL);
  
  // List for displaying search results
  const [searchedPokemon, setSearchedPokemon] = useState<Pokemon[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all pokemon names/urls for the search functionality
  useEffect(() => {
    async function fetchAllPokemon() {
      try {
        const response = await fetch(ALL_POKEMON_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch the complete Pokémon list");
        }
        const data = await response.json();
        setAllPokemonList(data.results);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAllPokemon();
  }, []);
  
  // Fetch a page of pokemon for browsing
  const fetchPokemonPage = useCallback(async (url: string) => {
    if (!url) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch Pokémon list");
      }
      const data = await response.json();
      setNextUrl(data.next);

      const pokemonPromises: Promise<Pokemon | null>[] = data.results.map(
        async (p: PokemonListResult) => {
          try {
            const res = await fetch(p.url);
            if (!res.ok) return null;
            return res.json();
          } catch (e) {
            return null;
          }
        }
      );

      const newPokemon = (await Promise.all(pokemonPromises)).filter(Boolean) as Pokemon[];

      setPokemonList((prevList) => {
        const existingIds = new Set(prevList.map((p) => p.id));
        const uniqueNewPokemon = newPokemon.filter((p) => !existingIds.has(p.id));
        const combined = [...prevList, ...uniqueNewPokemon];
        combined.sort((a, b) => a.id - b.id);
        return combined;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger initial fetch
  useEffect(() => {
    if (pokemonList.length === 0) {
      fetchPokemonPage(INITIAL_POKEAPI_URL);
    }
  }, [fetchPokemonPage, pokemonList.length]);

  // Handle search logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
        setSearchedPokemon([]);
        setIsLoadingSearch(false);
        return;
    }

    const search = async () => {
        if (allPokemonList.length === 0) return; // Wait for master list

        setIsLoadingSearch(true);
        setError(null);
        
        const query = searchQuery.toLowerCase().trim();
        const filtered = allPokemonList.filter(pokemon =>
            pokemon.name.toLowerCase().includes(query) ||
            pokemon.url.split('/')[6].includes(query)
        );

        try {
            const pokemonPromises: Promise<Pokemon | null>[] = filtered.map(
                async (p: PokemonListResult) => {
                    try {
                        const res = await fetch(p.url);
                        if (!res.ok) return null;
                        return res.json();
                    } catch (e) {
                        return null;
                    }
                }
            );
            const newPokemon = (await Promise.all(pokemonPromises)).filter(Boolean) as Pokemon[];
            newPokemon.sort((a,b) => a.id - b.id);
            setSearchedPokemon(newPokemon);
        } catch (err) {
            setError("Failed to fetch search results.");
        } finally {
            setIsLoadingSearch(false);
        }
    }
    
    const debounceTimer = setTimeout(() => {
        search();
    }, 300);

    return () => clearTimeout(debounceTimer);

  }, [searchQuery, allPokemonList]);

  const handleLoadMore = () => {
    if (nextUrl && !isLoading) {
      fetchPokemonPage(nextUrl);
    }
  };

  const isSearching = searchQuery.trim().length > 0;
  const pokemonToDisplay = isSearching ? searchedPokemon : pokemonList;
  const showLoadingSkeletons = isSearching ? isLoadingSearch : isLoading;
  const showNoResultsMessage = isSearching && !isLoadingSearch && pokemonToDisplay.length === 0;

  if (error && pokemonList.length === 0 && !isSearching) {
    return <div className="text-destructive text-center">{error}</div>;
  }
  
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {pokemonToDisplay.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
        {showLoadingSkeletons &&
          Array.from({ length: 20 }).map((_, index) => (
            <PokemonCardSkeleton key={`skeleton-${pokemonList.length + index}`} />
          ))}
      </div>

      {showNoResultsMessage && (
        <div className="text-center text-muted-foreground py-16">
          <p className="text-lg font-semibold">No Pokémon found</p>
          <p>Your search for &quot;{searchQuery}&quot; did not return any results.</p>
        </div>
      )}

      {error && (
        <div className="text-destructive text-center my-4">{error}</div>
      )}
      <div className="flex justify-center my-8">
        {!isSearching && nextUrl && !isLoading && (
          <Button onClick={handleLoadMore}>Load More Pokémon</Button>
        )}
      </div>
    </div>
  );
}