
'use client';

import React, { useState, useEffect, ReactElement, use } from "react";
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
} from "@/lib/pokemon-utils";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

// --- START: ICONS ---
const WaterDropIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C5 11.1 4 13 4 15a7 7 0 0 0 7 7z" />
  </svg>
);

const GenderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="15" r="3" />
      <path d="M9 12v-2" />
      <path d="m11 10-2-2-2 2" />
      <path d="m15 15 3-3" />
      <path d="M18 9v6h-6" />
  </svg>
);
// --- END: ICONS ---

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


function PokemonDetailPresentation({ pokemon }: { pokemon: CombinedPokemonData }) {
    const [activeTab, setActiveTab] = useState('about');
    const [isFavorite, setIsFavorite] = useState(false);

    const flavorText = getEnglishFlavorText(pokemon.flavor_text_entries);
    const gender = getGenderRatio(pokemon.gender_rate);

    const allEvolutions = parseEvolutionChain(pokemon.evolutionChain?.chain);

    return (
        <div className="bg-background bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] bg-[size:16px_16px] min-h-screen font-body">
            <header className="py-4 px-4 md:px-8 border-b sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto grid grid-cols-3 items-center">
                    <div className="justify-self-start">
                        <Link href="/" aria-label="Back to Pokédex">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex flex-col items-center justify-self-center">
                        <h1 className="text-3xl font-bold font-headline">{capitalize(pokemon.name)}</h1>
                        <p className="text-muted-foreground font-mono">{formatPokemonId(pokemon.id)}</p>
                    </div>
                    <div className="flex items-center gap-2 justify-self-end">
                        <Button variant="ghost" size="icon" onClick={() => setIsFavorite(p => !p)} aria-label="Toggle Favorite">
                            <Heart className={cn("h-6 w-6", isFavorite ? "text-red-500 fill-current" : "text-foreground/50")} />
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-8 px-4 md:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl border-2 border-foreground shadow-neo p-2 bg-card">
                        <div className="relative aspect-square rounded-lg overflow-hidden">
                            <div className="absolute inset-0 bg-[#F87171] top-0 h-1/2"></div>
                            <div className="absolute inset-0 bg-card bottom-0 h-1/2 top-1/2"></div>
                            <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-foreground z-10"></div>
                            <div className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card border-4 border-foreground z-20"></div>
                            <div className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted border-2 border-foreground z-30"></div>

                            <div className="relative w-full h-full p-4 z-40">
                                <Image
                                    src={pokemon.sprites.other['official-artwork'].front_default || `https://placehold.co/256x256.png`}
                                    alt={pokemon.name}
                                    fill
                                    priority
                                    className="object-contain drop-shadow-lg"
                                    sizes="90vw, (min-width: 768px) 40vw"
                                    data-ai-hint="pokemon character"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center my-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground shadow-neo-sm bg-blue-300 text-black font-semibold">
                           <WaterDropIcon className="w-5 h-5"/>
                           <span>{capitalize(pokemon.types[0].type.name)}</span>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="w-full">
                        <div className="flex border-b-2 border-foreground mb-4">
                            {['about', 'stats', 'moves', 'evolutions'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
                                    "px-4 py-2 font-bold -mb-[2px] text-muted-foreground",
                                    activeTab === tab && "bg-lime-300 border-2 border-foreground rounded-t-lg text-black border-b-card"
                                )}>
                                    {capitalize(tab)}
                                </button>
                            ))}
                        </div>

                        <div className="bg-card rounded-xl border-2 border-foreground shadow-neo p-4 min-h-[200px]">
                            {activeTab === 'about' && (
                                <div className="space-y-4">
                                    <p className="text-card-foreground/80 leading-relaxed">{flavorText}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-lime-300 p-3 rounded-full border-2 border-foreground shadow-neo-sm flex items-center justify-center gap-2 text-black">
                                            <Weight className="w-5 h-5"/>
                                            <span className="font-bold">{(pokemon.weight / 10).toFixed(1)}</span>
                                            <span className="text-sm">kg</span>
                                        </div>
                                        <div className="bg-lime-300 p-3 rounded-full border-2 border-foreground shadow-neo-sm flex items-center justify-center gap-2 text-black">
                                            <Ruler className="w-5 h-5"/>
                                            <span className="font-bold">{(pokemon.height / 10).toFixed(1)}</span>
                                            <span className="text-sm">m</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 font-bold">
                                            <GenderIcon className="w-5 h-5" />
                                            <span>Gender Ratio</span>
                                        </div>
                                        {gender ? (
                                            <div className="relative w-full h-8 rounded-full border-2 border-foreground shadow-neo-sm overflow-hidden flex">
                                                <div className="absolute inset-0 flex items-center px-4 z-10">
                                                    <span className="font-bold text-white text-shadow">{gender.male}% Male</span>
                                                </div>
                                                <div style={{width: `${gender.male}%`}} className="h-full bg-blue-400"></div>
                                                <div style={{width: `${gender.female}%`}} className="h-full bg-pink-400"></div>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">Genderless</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'stats' && (
                                <div className="space-y-3">
                                    {pokemon.stats.map(stat => (
                                      <div key={stat.stat.name} className="grid grid-cols-3 items-center gap-2">
                                        <p className="font-medium text-muted-foreground capitalize col-span-1">{stat.stat.name.replace('-', ' ')}</p>
                                        <div className="col-span-2">
                                            <div className="relative h-6 w-full bg-muted rounded-full border-2 border-foreground">
                                                <div className="absolute h-full bg-yellow-400 rounded-full" style={{width: `${(stat.base_stat/255)*100}%`}}></div>
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-black">{stat.base_stat}</span>
                                            </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                            )}
                            {activeTab === 'moves' && (
                                <div className="max-h-[250px] overflow-y-auto -mr-4 pr-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                                        {pokemon.moves.length > 0 ? (
                                            pokemon.moves.map(({ move }) => (
                                                <div key={move.name} className="bg-muted p-2 rounded-lg border-2 border-foreground font-medium text-sm shadow-neo-sm text-card-foreground">
                                                    {capitalize(move.name.replace(/-/g, ' '))}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="col-span-full text-center text-muted-foreground py-8">No moves available for this Pokémon.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'evolutions' && (
                                <div className="space-y-4">
                                    {allEvolutions.length > 1 ? (
                                        <div className="flex justify-center items-center gap-2 flex-wrap">
                                            {allEvolutions.map((evo, index) => (
                                                <React.Fragment key={evo.id}>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="bg-muted rounded-lg border-2 border-foreground p-2 w-24 h-24">
                                                            <div className="relative w-full h-full">
                                                                <Image
                                                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`}
                                                                    alt={evo.name}
                                                                    fill
                                                                    sizes="96px"
                                                                    className="object-contain"
                                                                    data-ai-hint="pokemon character"
                                                                />
                                                            </div>
                                                        </div>
                                                        <p className="font-semibold text-sm">{evo.name}</p>
                                                    </div>
                                                    {index < allEvolutions.length - 1 && (
                                                        <ArrowLeft className="w-8 h-8 rotate-180 text-gray-400" />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    ) : (
                                       <p className="text-center text-muted-foreground py-8">This Pokémon does not evolve.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function PokemonDetailPage() {
  const params = use(useParams());
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
      <div className="bg-background bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] bg-[size:16px_16px] min-h-screen font-body">
        <header className="py-4 px-4 md:px-8 border-b sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>
        </header>
        <main className="container mx-auto py-8 px-4 md:px-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="w-full aspect-square rounded-xl" />
            <Skeleton className="w-32 h-10 mx-auto rounded-full" />
            <Skeleton className="w-full h-48 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!pokemon) {
    // This can happen on error after loading, or if notFound() is triggered.
    // notFound() will throw an error that Next.js catches to show the 404 page.
    return null;
  }
  
  return <PokemonDetailPresentation pokemon={pokemon} />;
}
