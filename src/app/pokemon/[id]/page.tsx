import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Weight, Ruler } from "lucide-react";
import type { Pokemon, PokemonSpecies } from "@/types/pokemon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoriteButton } from "@/components/favorite-button";
import { 
  capitalize, 
  formatPokemonId, 
  getPokemonTypeBgClass, 
  getEnglishFlavorText,
  getGenderRatio,
} from "@/lib/pokemon-utils";
import { cn } from "@/lib/utils";

const PokeballIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    {...props}
  >
    <path d="M256 496c132.5 0 240-107.5 240-240S388.5 16 256 16 16 123.5 16 256s107.5 240 240 240zm0-288c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48zm0-48c53 0 96 43 96 96s-43 96-96 96-96-43-96-96 43-96 96-96zM48 256h160v1c0 25.9 21.5 47 48 47s48-21.1 48-47v-1h160c0 114.9-93.1 208-208 208S48 370.9 48 256z" />
  </svg>
);

const MarsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="16" x2="12" y2="22" />
    <line x1="9" y1="19" x2="15" y2="19" />
  </svg>
);

const VenusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="9" cy="9" r="4" />
    <line x1="13.5" y1="4.5" x2="20" y2="11" />
    <line x1="14" y1="11" x2="20" y2="11" />
    <line x1="20" y1="5" x2="20" y2="11" />
  </svg>
);

type CombinedPokemonData = Pokemon & PokemonSpecies;

async function getPokemonData(id: string): Promise<CombinedPokemonData | null> {
  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
    ]);

    if (!pokemonRes.ok) {
      // Return notFound() for 404, allowing Next.js to render the 404 page
      if (pokemonRes.status === 404) return notFound();
      throw new Error(`Failed to fetch Pokémon: ${pokemonRes.statusText}`);
    }
     if (!speciesRes.ok) {
      if (speciesRes.status === 404) return notFound();
      throw new Error(`Failed to fetch Pokémon Species: ${speciesRes.statusText}`);
    }


    const pokemonData: Pokemon = await pokemonRes.json();
    const speciesData: PokemonSpecies = await speciesRes.json();
    
    return { ...pokemonData, ...speciesData };
  } catch (error) {
    console.error("Failed to fetch pokemon data:", error);
    // In case of other errors (e.g., network issues), we also trigger a not found.
    // This could be enhanced to show a specific error page.
    return notFound();
  }
}


export default async function PokemonDetailPage({ params }: { params: { id: string } }) {
  const pokemon = await getPokemonData(params.id);
  
  if (!pokemon) {
    notFound();
  }

  const primaryType = pokemon.types[0].type.name;
  const typeBgClass = getPokemonTypeBgClass(primaryType);
  const flavorText = getEnglishFlavorText(pokemon.flavor_text_entries);
  const gender = getGenderRatio(pokemon.gender_rate);

  return (
    <div className={cn("min-h-screen", typeBgClass)}>
      <div className="relative text-white">
        <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
          <Button asChild variant="ghost" size="icon" className="hover:bg-white/20">
            <Link href="/" aria-label="Back to Pokédex">
              <ArrowLeft />
            </Link>
          </Button>
          <FavoriteButton />
        </header>

        <div className="relative pt-20 pb-16">
          <PokeballIcon className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 text-white/10" />
          <div className="relative aspect-square max-w-60 mx-auto">
            <Image
              src={pokemon.sprites.other['official-artwork'].front_default || `https://placehold.co/256x256.png`}
              alt={pokemon.name}
              fill
              priority
              className="object-contain drop-shadow-xl"
              sizes="60vw, (min-width: 768px) 40vw"
              data-ai-hint="pokemon character"
            />
          </div>
          <div className="text-center mt-4">
            <h1 className="text-4xl font-bold tracking-tight">{capitalize(pokemon.name)}</h1>
            <p className="text-lg font-semibold opacity-80">{formatPokemonId(pokemon.id)}</p>
            <div className="flex justify-center gap-2 mt-2">
                {pokemon.types.map(({ type }) => (
                <Badge key={type.name} variant="outline" className="capitalize bg-white/20 border-white/30 text-white backdrop-blur-sm">
                    {type.name}
                </Badge>
                ))}
            </div>
          </div>
        </div>
      </div>

      <main className="bg-background rounded-t-3xl -mt-8 pt-8 px-4 pb-8">
        <Tabs defaultValue="about" className="container mx-auto max-w-2xl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="moves">Moves</TabsTrigger>
            <TabsTrigger value="evolutions">Evolutions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{flavorText}</p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-secondary/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 mb-1"><Weight className="w-4 h-4" /> Weight</h4>
                        <p className="font-bold text-lg">{(pokemon.weight / 10).toFixed(1)} kg</p>
                    </div>
                     <div className="bg-secondary/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 mb-1"><Ruler className="w-4 h-4" /> Height</h4>
                        <p className="font-bold text-lg">{(pokemon.height / 10).toFixed(1)} m</p>
                    </div>
                 </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Gender</h3>
                    {gender ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-blue-500">
                                <MarsIcon className="w-5 h-5"/>
                                <span className="font-semibold">{gender.male}%</span>
                            </div>
                            <Progress value={gender.male} className="h-2 flex-1" />
                             <div className="flex items-center gap-1 text-pink-500">
                                <VenusIcon className="w-5 h-5"/>
                                <span className="font-semibold">{gender.female}%</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Genderless</p>
                    )}
                </div>

              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Base Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pokemon.stats.map(stat => (
                  <div key={stat.stat.name} className="flex items-center gap-4">
                    <p className="w-28 text-muted-foreground capitalize">{stat.stat.name.replace('-', ' ')}</p>
                    <p className="w-12 font-bold">{stat.base_stat}</p>
                    <Progress value={stat.base_stat} max={255} className="h-2 flex-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="moves" className="mt-6"><p className="text-center text-muted-foreground py-8">Moves information coming soon!</p></TabsContent>
          <TabsContent value="evolutions" className="mt-6"><p className="text-center text-muted-foreground py-8">Evolutions information coming soon!</p></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
