import React from "react";
import { notFound } from "next/navigation";
import type { Pokemon, PokemonSpecies } from "@/types/pokemon";
import PokemonDetailView, { type CombinedPokemonData } from "@/components/pokemon-detail-view";

interface EvolutionChain {
    species: { name: string; url: string };
    evolves_to: EvolutionChain[];
}

async function getPokemonData(id: string): Promise<CombinedPokemonData> {
    const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
    ]);

    if (!pokemonRes.ok || !speciesRes.ok) {
        if (pokemonRes.status === 404 || speciesRes.status === 404) {
          notFound();
        }
        throw new Error('Failed to fetch data');
    }
    
    const pokemonData: Pokemon = await pokemonRes.json();
    const speciesData: PokemonSpecies = await speciesRes.json();
    
    let evolutionChain = null;
    if(speciesData.evolution_chain?.url) {
        const evoRes = await fetch(speciesData.evolution_chain.url);
        if(evoRes.ok) {
            evolutionChain = await evoRes.json();
        }
    }

    return { ...pokemonData, ...speciesData, evolutionChain };
}

export default async function PokemonDetailPage({ params }: { params: { id: string } }) {
  const pokemon = await getPokemonData(params.id);
  
  return <PokemonDetailView pokemon={pokemon} />;
}
