'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RadioTower, Loader2, Camera, VideoOff } from 'lucide-react';
import Webcam from 'react-webcam';
import Resizer from 'react-image-file-resizer';

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

const dataURItoBlob = (dataURI: string): Blob => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
};

const resizeImage = (dataUri: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const blob = dataURItoBlob(dataUri);
            Resizer.imageFileResizer(
                blob,
                512,
                512,
                'JPEG',
                70,
                0,
                (uri) => {
                    resolve(uri as string);
                },
                'base64'
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
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

    const handleIdentify = useCallback(async () => {
        if (!webcamRef.current) return;
        
        setIsProcessing(true);
        
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            toast({
                variant: 'destructive',
                title: 'Capture Error',
                description: 'Could not get an image from the camera.',
            });
            setIsProcessing(false);
            return;
        }

        try {
            const resizedDataUri = await resizeImage(imageSrc);
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
    }, [router, toast]);
    
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
                    <p className="font-code text-xs text-green-400 uppercase">SYSTEM STATUS: <span className="text-white">{hasCameraPermission === null ? 'INITIALIZING' : hasCameraPermission ? 'READY' : 'ERROR'}</span></p>
                    <p className="font-code text-xs text-green-400 uppercase">TARGETING: <span className="text-white">POKEMON</span></p>
                </div>
                
                <div className="relative w-full max-w-md aspect-[4/3] bg-black border-4 border-foreground overflow-hidden shadow-[inset_0_0_10px_black,0_0_10px_hsl(var(--primary)/0.5)] flex items-center justify-center">
                    {isProcessing && <PokedexScanner />}
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        className="w-full h-full object-cover"
                        onUserMedia={() => {
                            setHasCameraPermission(true);
                        }}
                        onUserMediaError={(error) => {
                            console.error('Error accessing camera:', error);
                            setHasCameraPermission(false);
                            toast({
                                variant: 'destructive',
                                title: 'Camera Access Denied',
                                description: 'Please enable camera permissions in your browser settings.',
                            });
                        }}
                    />
                    {hasCameraPermission === false && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center p-4">
                            <VideoOff className="w-12 h-12 text-destructive mb-4"/>
                            <h3 className="font-headline text-lg text-white">Camera Access Denied</h3>
                            <p className="text-xs mt-2 text-gray-400">Please enable camera permissions in your browser settings to use the scanner.</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 w-full max-w-md p-4 bg-foreground/20 border-t-4 border-foreground">
                    <div className="flex items-center justify-center gap-6">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-foreground animate-pulse" />
                        <button
                            onClick={handleIdentify}
                            disabled={isProcessing || !hasCameraPermission}
                            aria-label="Capture Pokémon"
                            className="relative group h-20 w-20 rounded-full border-4 border-foreground bg-card overflow-hidden shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute top-0 left-0 h-1/2 w-full bg-primary" />
                            <div className="absolute top-1/2 left-0 w-full h-3.5 -translate-y-1/2 bg-foreground z-10" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card border-[3px] border-foreground z-20 flex items-center justify-center group-hover:border-accent transition-colors">
                                {isProcessing ? (
                                    <Loader2 className="h-5 w-5 text-foreground animate-spin" />
                                ) : (
                                    <Camera className="h-5 w-5 text-foreground" />
                                )}
                            </div>
                        </button>
                        <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-foreground animate-pulse" />
                    </div>
                </div>
            </main>
            <footer className="text-center py-4 text-xs text-gray-400 font-code bg-black">
                Made By Ayushman
            </footer>
        </div>
    );
}
