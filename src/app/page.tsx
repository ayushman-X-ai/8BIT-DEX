import { PokemonGrid } from '@/components/pokemon-grid';

const PokeballIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <line x1="3" y1="12" x2="21" y2="12" />
    <path d="M12 21a9 9 0 0 0 9-9" />
    <path d="M12 3a9 9 0 0 0-9 9" />
    <path d="M12 21a2.5 2.5 0 0 0 0-5" />
    <path d="M12 3a2.5 2.5 0 0 1 0 5" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <header className="py-6 px-4 md:px-8 border-b sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-4">
          <PokeballIcon className="text-accent h-8 w-8" />
          <h1 className="text-3xl font-bold font-headline text-foreground">
            Kanto Dex
          </h1>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4 md:px-8">
        <PokemonGrid />
      </main>
    </div>
  );
}
