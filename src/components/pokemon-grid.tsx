"use client";

import { useState, useEffect, useCallback } from "react";
import type { Pokemon, PokemonListResult } from "@/types/pokemon";
import { PokemonCard, PokemonCardSkeleton } from "@/components/pokemon-card";
import { Button } from "@/components/ui/button";

const INITIAL_POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon?limit=20";
const ALL_POKEMON_URL = "https://pokeapi.co/api/v2/pokemon?limit=1025";

// Helper to fetch details for a list of pokemon
const fetchPokemonDetails = async (pokemonList: PokemonListResult[]): Promise<Pokemon[]> => {
    const pokemonPromises: Promise<Pokemon | null>[] = pokemonList.map(
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
    const results = (await Promise.all(pokemonPromises)).filter(Boolean) as Pokemon[];
    results.sort((a,b) => a.id - b.id);
    return results;
}

export function PokemonGrid({ searchQuery, selectedTypes }: { searchQuery: string, selectedTypes: string[] }) {
  // Master list for client-side search
  const [allPokemonList, setAllPokemonList] = useState<PokemonListResult[]>([]);
  
  // List for standard paginated browsing
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(INITIAL_POKEAPI_URL);
  
  // List for displaying search/filter results
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActionActive = searchQuery.trim().length > 0 || selectedTypes.length > 0;

  // Fetch all pokemon names/urls for the search/filter functionality
  useEffect(() => {
    async function fetchAllPokemon() {
      try {
        const response = await fetch(ALL_POKEMON_URL);
        if (!response.ok) throw new Error("Failed to fetch the complete Pokémon list");
        const data = await response.json();
        setAllPokemonList(data.results);
      } catch (err) {
        console.error(err);
        setError("Could not load master Pokémon list for searching.");
      }
    }
    fetchAllPokemon();
  }, []);
  
  // Fetch a page of pokemon for standard browsing
  const fetchPokemonPage = useCallback(async (url: string) => {
    if (!url) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch Pokémon list");
      const data = await response.json();
      setNextUrl(data.next);

      const newPokemon = await fetchPokemonDetails(data.results);
      
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

  // Trigger initial fetch for standard browsing
  useEffect(() => {
    if (pokemonList.length === 0 && !isActionActive) {
      fetchPokemonPage(INITIAL_POKEAPI_URL);
    }
  }, [fetchPokemonPage, pokemonList.length, isActionActive]);

  // Handle combined search and filter logic
  useEffect(() => {
    if (!isActionActive) {
        setFilteredPokemon([]);
        setIsLoadingFilters(false);
        return;
    }

    const processFilters = async () => {
        if (allPokemonList.length === 0) return; // Wait for master list

        setIsLoadingFilters(true);
        setError(null);
        
        try {
            let finalPokemonList: PokemonListResult[] = [...allPokemonList];

            // Apply type filters first, as it's a network request
            if (selectedTypes.length > 0) {
                const typePromises = selectedTypes.map(type => 
                    fetch(`https://pokeapi.co/api/v2/type/${type}`)
                        .then(res => {
                            if (!res.ok) throw new Error(`Failed to fetch type: ${type}`);
                            return res.json();
                        })
                );
                
                const typeResults = await Promise.all(typePromises);
                
                const pokemonFromTypes = typeResults.map(result => 
                    new Set(result.pokemon.map((p: { pokemon: PokemonListResult }) => p.pokemon.name))
                );

                const intersection = pokemonFromTypes.reduce((acc, currentSet) => {
                    return new Set([...acc].filter(name => currentSet.has(name)));
                });
                
                const intersectionNames = Array.from(intersection);
                
                finalPokemonList = allPokemonList.filter(p => intersectionNames.includes(p.name));
            }

            // Apply search query on the (potentially type-filtered) list
            if (searchQuery.trim().length > 0) {
                const query = searchQuery.toLowerCase().trim();
                finalPokemonList = finalPokemonList.filter(pokemon =>
                    pokemon.name.toLowerCase().includes(query) ||
                    pokemon.url.split('/')[6].includes(query)
                );
            }

            const pokemonDetails = await fetchPokemonDetails(finalPokemonList);
            setFilteredPokemon(pokemonDetails);

        } catch (err) {
            setError("Failed to fetch filter results.");
            console.error(err);
        } finally {
            setIsLoadingFilters(false);
        }
    }
    
    const debounceTimer = setTimeout(() => {
        processFilters();
    }, 300);

    return () => clearTimeout(debounceTimer);

  }, [searchQuery, selectedTypes, allPokemonList, isActionActive]);

  const pokemonToDisplay = isActionActive ? filteredPokemon : pokemonList;
  const showLoadingSkeletons = isActionActive ? isLoadingFilters : isLoading;
  const showNoResultsMessage = isActionActive && !isLoadingFilters && pokemonToDisplay.length === 0;

  if (error && pokemonList.length === 0 && !isActionActive) {
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
            <PokemonCardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>

      {showNoResultsMessage && (
        <div className="text-center text-muted-foreground py-16">
          <p className="text-lg font-semibold">No Pokémon found</p>
          <p>Your search and filter criteria did not return any results.</p>
        </div>
      )}

      {error && !isActionActive && (
        <div className="text-destructive text-center my-4">{error}</div>
      )}

      {error && isActionActive && (
        <div className="text-destructive text-center my-4">{error}</div>
      )}

      <div className="flex justify-center my-8">
        {!isActionActive && nextUrl && !isLoading && (
          <Button onClick={() => fetchPokemonPage(nextUrl!)}>Load More Pokémon</Button>
        )}
      </div>
    </div>
  );
}
