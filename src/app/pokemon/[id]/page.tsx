'use client';

import React, { useState, useEffect, ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Heart, Weight, Ruler } from "lucide-react";
import type { Pokemon, PokemonSpecies } from "@/types/pokemon";
import { 
  capitalize, 
  formatPokemonId, 
  getEnglishFlavorText,
  getGenderRatio,
  getPokemonTypeClasses,
} from "@/lib/pokemon-utils";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface Evolution {
  id: number;
  name: string;
}

interface EvolutionChain {
    species: { name: string; url: string };
    evolves_to: EvolutionChain[];
}

interface CombinedPokemonData extends Pokemon, PokemonSpecies {
  evolutionChain: { chain: EvolutionChain } | null;
}

const parseEvolutionChain = (chainNode: EvolutionChain | undefined): Evolution[] => {
    if (!chainNode) return [];
    
    let evolutions: Evolution[] = [];
    let currentNode: EvolutionChain | undefined = chainNode;

    while(currentNode) {
        const urlParts = currentNode.species.url.split('/');
        const id = parseInt(urlParts[urlParts.length - 2]);
        if (!evolutions.some(e => e.id === id)) {
            evolutions.push({ id, name: capitalize(currentNode.species.name) });
        }
        
        if (currentNode.evolves_to.length > 0) {
            for (const evo of currentNode.evolves_to) {
                const nestedEvolutions = parseEvolutionChain(evo);
                nestedEvolutions.forEach(ne => {
                    if (!evolutions.some(e => e.id === ne.id)) {
                        evolutions.push(ne);
                    }
                });
            }
        }
        currentNode = currentNode.evolves_to[0];
    }
    
    return evolutions;
};


const StatBar = ({ value, max }: { value: number; max: number }) => {
    const percentage = (value / max) * 100;
    const blockCount = 20;
    const filledBlocks = Math.round((percentage / 100) * blockCount);
  
    return (
      <div className="w-full flex gap-0.5 h-4 border-2 border-foreground bg-muted p-0.5">
        {Array.from({ length: blockCount }).map((_, i) => (
          <div
            key={i}
            className={`w-full h-full ${i < filledBlocks ? 'bg-accent' : 'bg-transparent'}`}
          />
        ))}
      </div>
    );
};

function PokemonDetailPresentation({ pokemon }: { pokemon: CombinedPokemonData }) {
    const [activeTab, setActiveTab] = useState('about');
    const [isFavorite, setIsFavorite] = useState(false);

    const flavorText = getEnglishFlavorText(pokemon.flavor_text_entries);
    const gender = getGenderRatio(pokemon.gender_rate);

    const allEvolutions = parseEvolutionChain(pokemon.evolutionChain?.chain);
    const primaryType = pokemon.types[0].type.name;
    const typeClasses = getPokemonTypeClasses(primaryType);


    const StatPill = ({ icon, label, value, unit }: {icon: ReactElement, label: string, value: string | number, unit?: string}) => (
        <div className="flex-1 p-2 border-2 border-foreground bg-card flex flex-col items-center justify-center gap-1 text-center min-w-[100px]">
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-bold text-xs uppercase">{label}</span>
            </div>
            <p className="text-base sm:text-lg font-headline text-accent">
                {value}
                {unit && <span className="text-xs ml-1 text-muted-foreground">{unit}</span>}
            </p>
        </div>
    );

    return (
        <div className="bg-background min-h-screen font-body text-xs sm:text-sm">
            <header className="py-4 px-4 md:px-8 border-b-4 border-foreground sticky top-0 z-10 bg-background">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" aria-label="Back to 8BitDex">
                        <Button variant="outline" size="xs" className="border-2 border-foreground">
                            <ArrowLeft />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setIsFavorite(p => !p)} aria-label="Toggle Favorite" className="border-2 border-transparent hover:border-foreground">
                          <Heart className={cn("h-5 w-5", isFavorite ? "text-primary fill-current" : "text-foreground/50")} />
                      </Button>
                      <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-8 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                        <div className={cn("relative flex-shrink-0 w-full max-w-[280px] aspect-square p-4 border-4 border-foreground bg-card", typeClasses)}>
                            <Image
                                src={pokemon.sprites.other['official-artwork'].front_default || `https://placehold.co/256x256.png`}
                                alt={pokemon.name}
                                fill
                                priority
                                className="object-contain drop-shadow-lg"
                                sizes="(max-width: 768px) 90vw, 280px"
                                data-ai-hint="pokemon character"
                            />
                            <span className="absolute bottom-1 right-2 text-lg font-bold text-black/50">{formatPokemonId(pokemon.id)}</span>
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline uppercase tracking-wide text-foreground">{capitalize(pokemon.name)}</h1>
                            <p className="mt-2 text-muted-foreground leading-relaxed max-w-prose mx-auto md:mx-0 text-xs">{flavorText}</p>
                            <div className="flex justify-center md:justify-start gap-2 mt-4">
                                {pokemon.types.map(({ type }) => (
                                    <div key={type.name} className={cn("px-3 py-1 border-2 border-foreground font-bold text-xs uppercase", getPokemonTypeClasses(type.name))}>
                                        {type.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full">
                        <div className="flex border-b-2 border-foreground mb-4 overflow-x-auto">
                            {['About', 'Stats', 'Stages', 'Profile', 'Moves'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={cn(
                                    "px-4 py-2 font-bold text-sm uppercase -mb-[2px] text-muted-foreground border-2 border-transparent flex-shrink-0",
                                    activeTab === tab.toLowerCase() && "bg-card border-foreground border-b-card text-accent"
                                )}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="bg-card border-2 border-foreground p-4 sm:p-6 min-h-[250px]">
                            {activeTab === 'about' && (
                                <div className="space-y-6">
                                    <div className="flex flex-wrap gap-4">
                                        <StatPill icon={<Weight className="w-5 h-5"/>} label="Weight" value={(pokemon.weight / 10).toFixed(1)} unit="kg" />
                                        <StatPill icon={<Ruler className="w-5 h-5"/>} label="Height" value={(pokemon.height / 10).toFixed(1)} unit="m" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold uppercase text-muted-foreground mb-2">Gender</h4>
                                        {gender ? (
                                            <div className="flex items-center gap-4">
                                                <div className="w-full border-2 border-foreground flex h-6 p-0.5 bg-muted">
                                                    <div style={{width: `${gender.male}%`}} className="h-full bg-chart-2"></div>
                                                    <div style={{width: `${gender.female}%`}} className="h-full bg-chart-5"></div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <span className="text-chart-2 font-bold">{gender.male}% M</span> / <span className="text-chart-5 font-bold">{gender.female}% F</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">Genderless</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'stats' && (
                                <div className="space-y-4">
                                    {pokemon.stats.map(stat => (
                                      <div key={stat.stat.name} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                                        <div className="flex justify-between items-baseline sm:w-1/3">
                                          <p className="font-medium text-muted-foreground uppercase text-xs truncate">{stat.stat.name.replace('-', ' ')}</p>
                                          <p className="font-bold text-base sm:hidden">{stat.base_stat}</p>
                                        </div>
                                        <div className="w-full sm:w-2/3 flex items-center gap-4">
                                            <StatBar value={stat.base_stat} max={255} />
                                            <p className="font-bold text-lg hidden sm:block w-12 text-right">{stat.base_stat}</p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                            )}
                             {activeTab === 'stages' && (
                                <div className="space-y-4">
                                    {allEvolutions.length > 1 ? (
                                        <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
                                            {allEvolutions.map((evo, index) => (
                                                <React.Fragment key={evo.id}>
                                                    <div className="flex flex-col items-center gap-1 text-center">
                                                        <div className="bg-muted border-2 border-foreground p-2 w-24 h-24">
                                                            <div className="relative w-full h-full">
                                                                <Image
                                                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                                                                    alt={evo.name}
                                                                    fill
                                                                    sizes="96px"
                                                                    className="object-contain"
                                                                    data-ai-hint="pokemon character"
                                                                />
                                                            </div>
                                                        </div>
                                                        <p className="font-semibold text-xs uppercase mt-2">{evo.name}</p>
                                                        <p className="text-xs text-muted-foreground">{formatPokemonId(evo.id)}</p>
                                                    </div>
                                                    {index < allEvolutions.length - 1 && (
                                                        <ArrowLeft className="w-8 h-8 rotate-180 text-gray-400 hidden sm:block" />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    ) : (
                                       <p className="text-center text-muted-foreground py-8">This Pokémon does not evolve.</p>
                                    )}
                                </div>
                            )}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <div>
                                            <h4 className="font-bold uppercase text-muted-foreground mb-2 text-xs">Habitat</h4>
                                            <p className="font-bold text-foreground">{pokemon.habitat ? capitalize(pokemon.habitat.name) : 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold uppercase text-muted-foreground mb-2 text-xs">Shape</h4>
                                            <p className="font-bold text-foreground">{pokemon.shape ? capitalize(pokemon.shape.name) : 'Unknown'}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <h4 className="font-bold uppercase text-muted-foreground mb-2 text-xs">Egg Groups</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {pokemon.egg_groups.map((group) => (
                                                    <div key={group.name} className="px-3 py-1 border-2 border-foreground font-bold text-xs uppercase bg-muted">
                                                        {capitalize(group.name)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'moves' && (
                                <div className="max-h-[300px] overflow-y-auto pr-2 -mr-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {pokemon.moves.map(({ move }) => (
                                            <div key={move.name} className="bg-muted p-2 text-foreground truncate text-xs font-medium border-2 border-foreground/10">
                                                {capitalize(move.name)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="text-center py-4 text-xs text-muted-foreground font-code">
                Made By Ayushman
            </footer>
        </div>
    )
}

export default function PokemonDetailPage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const [pokemon, setPokemon] = useState<CombinedPokemonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function getPokemonData(id: string): Promise<CombinedPokemonData> {
        const [pokemonRes, speciesRes] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
        ]);

        if (!pokemonRes.ok || !speciesRes.ok) {
            if (pokemonRes.status === 404 || speciesRes.status === 404) {
              throw new Error('Not Found');
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
    
    if (!id) return;

    setIsLoading(true);
    getPokemonData(id)
        .then(data => {
            setPokemon(data);
        })
        .catch(error => {
            if (error.message === 'Not Found') {
                notFound();
            }
            console.error(error);
        })
        .finally(() => {
            setIsLoading(false);
        });
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen font-body">
        <header className="py-4 px-4 md:px-8 border-b-4 border-foreground">
          <div className="container mx-auto flex items-center justify-between">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </header>
        <main className="container mx-auto py-8 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
             <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                <Skeleton className="w-full max-w-[280px] aspect-square" />
                <div className="flex-grow space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-8 w-1/3" />
                </div>
            </div>
            <Skeleton className="w-full h-64" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!pokemon) {
    return null;
  }
  
  return <PokemonDetailPresentation pokemon={pokemon} />;
}
