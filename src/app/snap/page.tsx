'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, RefreshCw, RadioTower, Loader2, Upload, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { identifyPokemon } from '@/ai/flows/identify-pokemon-flow';

const PokedexScanner = () => (
    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 overflow-hidden">
        <div className="absolute left-0 w-full h-2 bg-primary/70 shadow-[0_0_10px_theme(colors.primary)] animate-scanline z-20" />
        <div 
            className="absolute inset-0" 
            style={{
                backgroundImage: 'linear-gradient(hsl(var(--foreground)/0.05) 1px, transparent 1px), linear-gradient(to right, hsl(var(--foreground)/0.05) 1px, transparent 1px)',
                backgroundSize: '3px 3px',
            }}
        />
        <p className="font-headline text-lg sm:text-xl text-primary animate-pulse z-10 tracking-widest drop-shadow-[2px_2px_0_hsl(var(--foreground)/0.5)]">
            IDENTIFYING...
        </p>
    </div>
);

const IdleView = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <Upload className="w-16 h-16 text-foreground/30 mb-4" />
        <p className="font-headline text-lg text-foreground/80">Tap the Pokéball</p>
        <p className="text-xs text-muted-foreground mt-2">to open your camera and scan a Pokémon.</p>
    </div>
);


export default function SnapPage() {
    const router = useRouter();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setCapturedImage(result);
        };
        reader.readAsDataURL(file);

        // Reset the input value to allow capturing the same file again if needed.
        event.target.value = '';
    };

    const handleIdentify = async () => {
        if (!capturedImage) return;

        setIsProcessing(true);
        try {
            const result = await identifyPokemon({ photoDataUri: capturedImage });
            if (result.pokemonName) {
                router.push(`/pokemon/${result.pokemonName.toLowerCase()}`);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Identification Failed',
                    description: 'Could not identify a Pokémon. Please try again with a clearer image.',
                });
                // Allow user to try again without retaking photo
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('AI identification error:', error);
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: 'An error occurred while trying to identify the Pokémon.',
            });
            setIsProcessing(false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        fileInputRef.current?.click();
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };
    
    return (
        <div className="bg-black min-h-screen font-body flex flex-col">
            <header className="py-4 px-4 md:px-8 border-b-4 border-gray-700 sticky top-0 z-10 bg-black">
              <div className="container mx-auto grid grid-cols-3 items-center gap-4">
                  <div className="flex justify-start">
                    <Link href="/" aria-label="Back to 8BitDex">
                        <Button variant="outline" size="xs" className="border-2 border-gray-400 bg-gray-900 text-gray-50 hover:bg-gray-700 hover:text-white">
                            <ArrowLeft />
                            Back
                        </Button>
                    </Link>
                  </div>
                  <h1 className="text-xs sm:text-base font-bold font-headline text-white uppercase tracking-tighter sm:tracking-widest text-center">
                      8BIT SCANNER
                  </h1>
                  <div className="flex justify-end">
                    <RadioTower className="text-white" />
                  </div>
              </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-2 text-center mb-4">
                    <p className="font-code text-xs text-green-400 uppercase">SYSTEM STATUS: <span className="text-white">ONLINE</span></p>
                    <p className="font-code text-xs text-green-400 uppercase">TARGETING: <span className="text-white">POKEMON</span></p>
                </div>

                <div className="relative w-full max-w-md aspect-[4/3] bg-black border-4 border-foreground overflow-hidden shadow-[inset_0_0_10px_black,0_0_10px_hsl(var(--primary)/0.5)] flex items-center justify-center">
                    {isProcessing && <PokedexScanner />}
                    
                    {capturedImage && !isProcessing && (
                        <Image src={capturedImage} alt="Captured Pokémon" layout="fill" objectFit="contain" />
                    )}

                    {!capturedImage && !isProcessing && <IdleView />}

                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
                <div className="mt-6 w-full max-w-md p-4 bg-foreground/20 border-t-4 border-foreground">
                    {capturedImage && !isProcessing ? (
                        <div className="flex items-center justify-around gap-4">
                             <Button onClick={handleRetake} variant="outline" className="border-gray-400 bg-gray-900 text-gray-50 hover:bg-gray-700">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retake
                            </Button>
                            <Button onClick={handleIdentify}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Identify
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-6">
                            <div className="w-8 h-8 bg-accent rounded-full border-2 border-foreground animate-pulse" />
                            <button
                                onClick={triggerFileSelect}
                                disabled={isProcessing}
                                aria-label="Open Camera"
                                className="relative group h-20 w-20 rounded-full border-4 border-foreground bg-card overflow-hidden shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute top-0 left-0 h-1/2 w-full bg-primary" />
                                <div className="absolute top-1/2 left-0 w-full h-3.5 -translate-y-1/2 bg-foreground z-10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card border-[3px] border-foreground z-20 flex items-center justify-center group-hover:border-accent transition-colors">
                                    {isProcessing ? (
                                        <Loader2 className="h-5 w-5 text-foreground animate-spin" />
                                    ) : (
                                        <Upload className="h-5 w-5 text-foreground" />
                                    )}
                                </div>
                            </button>
                            <div className="w-8 h-8 bg-accent rounded-full border-2 border-foreground animate-pulse" />
                        </div>
                    )}
                </div>
            </main>
            <footer className="text-center py-4 text-xs text-gray-400 font-code bg-black">
                Made By Ayushman
            </footer>
        </div>
    );
}