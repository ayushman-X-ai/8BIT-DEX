'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Resizer from 'react-image-file-resizer';
import { ArrowLeft, RadioTower, Loader2, Camera, RefreshCw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { identifyPokemon } from '@/ai/flows/identify-pokemon-flow';
import Webcam from 'react-webcam';
import Image from 'next/image';

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

// Resizes a base64 Data URI and returns a new base64 Data URI
const resizeDataUri = (dataUri: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            Resizer.imageFileResizer(
                dataUri, // Is the base64 string
                512,      // Max width
                512,      // Max height
                'JPEG',   // Format
                80,       // Quality
                0,        // Rotation
                (uri) => {
                    resolve(uri as string);
                },
                'base64'  // Output type
            );
        } catch (error) {
            reject(error);
        }
    });
};


export default function SnapPage() {
    const router = useRouter();
    const { toast } = useToast();
    const webcamRef = useRef<Webcam>(null);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "environment"
    };

    const capture = useCallback(() => {
        const image = webcamRef.current?.getScreenshot();
        if (image) {
            setImageSrc(image);
        }
    }, [webcamRef]);

    const handleRetake = () => {
        setImageSrc(null);
    };

    const handleIdentify = async () => {
        if (!imageSrc) return;
        
        setIsProcessing(true);
        
        try {
            const resizedDataUri = await resizeDataUri(imageSrc);
            const result = await identifyPokemon({ photoDataUri: resizedDataUri });

            if (result.pokemonName) {
                router.push(`/pokemon/${result.pokemonName.toLowerCase()}`);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Identification Failed',
                    description: 'Could not identify a Pokémon. Please try again.',
                });
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
                      8BIT-SCANNER
                  </h1>
                  <div className="flex justify-end">
                    <RadioTower className="text-white" />
                  </div>
              </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-2 text-center mb-4">
                    <p className="font-code text-xs text-green-400 uppercase">SYSTEM STATUS: <span className="text-white">READY</span></p>
                    <p className="font-code text-xs text-green-400 uppercase">TARGETING: <span className="text-white">POKEMON</span></p>
                </div>
                
                <div className="relative w-full max-w-md aspect-[4/3] bg-black border-4 border-foreground overflow-hidden shadow-[inset_0_0_10px_black,0_0_10px_hsl(var(--primary)/0.5)] flex items-center justify-center">
                    {isProcessing && <PokedexScanner />}
                    
                    {imageSrc ? (
                         <Image src={imageSrc} alt="Pokémon Preview" fill className="object-contain" />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-full object-cover"
                            onUserMediaError={(err) => {
                                console.error(err);
                                toast({
                                    variant: 'destructive',
                                    title: 'Camera Error',
                                    description: 'Could not access the camera. Please check permissions.',
                                })
                            }}
                        />
                    )}
                </div>

                <div className="mt-6 w-full max-w-md p-4 bg-foreground/20 border-t-4 border-foreground">
                    {imageSrc ? (
                        <div className="flex items-center justify-center gap-6">
                            <Button onClick={handleRetake} disabled={isProcessing} variant="outline" className="border-2 border-gray-400 bg-gray-900 text-gray-50 hover:bg-gray-700 hover:text-white">
                                <RefreshCw className="mr-2"/> Retake
                            </Button>
                            <Button onClick={handleIdentify} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="mr-2 animate-spin"/> : <Send className="mr-2" />}
                                Identify
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-6">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-foreground animate-pulse" />
                            <button
                                onClick={capture}
                                disabled={isProcessing}
                                aria-label="Capture Pokémon"
                                className="relative group h-20 w-20 rounded-full border-4 border-foreground bg-card overflow-hidden shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute top-0 left-0 h-1/2 w-full bg-primary" />
                                <div className="absolute top-1/2 left-0 w-full h-3.5 -translate-y-1/2 bg-foreground z-10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card border-[3px] border-foreground z-20 flex items-center justify-center group-hover:border-accent transition-colors">
                                    <Camera className="h-5 w-5 text-foreground" />
                                </div>
                            </button>
                            <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-foreground animate-pulse" />
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
