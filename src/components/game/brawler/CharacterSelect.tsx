'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { BrawlerCharacter } from '@/types/brawler';
import { CHARACTERS } from '@/lib/brawler-data';
import { Button } from '@/components/ui/button';
import { capitalize, getPokemonTypeClasses } from '@/lib/pokemon-utils';
import { cn } from '@/lib/utils';
import { Shield, Sword, Zap, Droplets, Flame, Leaf } from 'lucide-react';

const ElementIcon = ({ type }: { type: string }) => {
    const props = { className: "w-4 h-4" };
    switch (type) {
        case 'electric': return <Zap {...props} />;
        case 'water': return <Droplets {...props} />;
        case 'fire': return <Flame {...props} />;
        case 'grass': return <Leaf {...props} />;
        default: return <Sword {...props} />;
    }
}

interface CharacterSelectProps {
    onCharacterSelect: (character: BrawlerCharacter) => void;
}

export default function CharacterSelect({ onCharacterSelect }: CharacterSelectProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleNext = () => setSelectedIndex(prev => (prev + 1) % CHARACTERS.length);
    const handlePrev = () => setSelectedIndex(prev => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);

    const selectedCharacter = CHARACTERS[selectedIndex];

    return (
        <div className="w-full h-full bg-card flex flex-col items-center justify-center p-8 text-center text-white">
            <h2 className="text-3xl font-headline text-primary uppercase tracking-widest mb-4">Choose Your Brawler</h2>
            <div className="relative w-full max-w-xs flex items-center justify-center">
                <Button variant="outline" size="icon" onClick={handlePrev} className="absolute -left-8 sm:-left-16">
                    &lt;
                </Button>
                <div className="w-48 h-48 relative">
                    <Image
                        src={selectedCharacter.spriteUrl}
                        alt={selectedCharacter.name}
                        width={192}
                        height={192}
                        className="object-contain drop-shadow-lg animate-pulse"
                        data-ai-hint="pokemon character"
                    />
                </div>
                <Button variant="outline" size="icon" onClick={handleNext} className="absolute -right-8 sm:-right-16">
                    &gt;
                </Button>
            </div>
            <h3 className="text-2xl font-headline text-accent mt-4">{capitalize(selectedCharacter.name)}</h3>
            <div className={cn("mt-2 px-3 py-1 border-2 border-foreground font-bold text-xs uppercase", getPokemonTypeClasses(selectedCharacter.elementType))}>
                {capitalize(selectedCharacter.elementType)}
            </div>

            <div className="flex gap-4 mt-6 text-xs uppercase">
                <div className="flex items-center gap-1"><Sword /> ATK: {selectedCharacter.attack}</div>
                <div className="flex items-center gap-1"><Shield /> DEF: {selectedCharacter.defense}</div>
            </div>

            <Button onClick={() => onCharacterSelect(selectedCharacter)} className="mt-8 font-headline text-lg" size="lg">
                Let&apos;s Brawl!
            </Button>
        </div>
    );
}
