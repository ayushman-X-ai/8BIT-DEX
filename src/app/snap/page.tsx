'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, RefreshCw, RadioTower } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { identifyPokemon } from '@/ai/flows/identify-pokemon-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// New, more retro scanner animation
const PokedexScanner = () => (
    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute left-0 w-full h-2 bg-primary/70 shadow-[0_0_10px_theme(colors.primary)] animate-scanline z-20" />
        
        {/* Pixel grid overlay */}
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

// New, more detailed camera frame
const CameraFrame = () => (
    <div className="absolute inset-0 pointer-events-none p-2" aria-hidden="true">
        <div className="w-full h-full relative">
            {/* Main corner brackets */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-accent"></div>
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-accent"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-accent"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-accent"></div>
            
            {/* Center targeting reticle */}
            <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2">
                <div className="absolute top-0 left-0 w-5 h-px bg-accent/80"></div>
                <div className="absolute top-0 left-0 w-px h-5 bg-accent/80"></div>
                <div className="absolute top-0 right-0 w-5 h-px bg-accent/80"></div>
                <div className="absolute top-0 right-0 w-px h-5 bg-accent/80"></div>
                <div className="absolute bottom-0 left-0 w-5 h-px bg-accent/80"></div>
                <div className="absolute bottom-0 left-0 w-px h-5 bg-accent/80"></div>
                <div className="absolute bottom-0 right-0 w-5 h-px bg-accent/80"></div>
                <div className="absolute bottom-0 right-0 w-px h-5 bg-accent/80"></div>
            </div>

            {/* Top Info Bar */}
            <div className="absolute top-2 left-12 right-12 flex justify-between items-center text-accent font-code text-xs">
                <span>REC</span>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            </div>
        </div>
    </div>
);

export default function SnapPage() {
    const router = useRouter();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const getCameraPermission = useCallback(async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Camera not supported on this browser.');
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Not Supported',
                description: 'Your browser does not support camera access.',
            });
            return;
        }

        let stream;
        try {
            // First, try to get the environment-facing camera (for phones)
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
        } catch (error) {
            console.warn('Could not get environment camera, trying default camera.', error);
            // If that fails, fall back to any available video camera (for laptops, etc.)
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
            } catch (fallbackError) {
                console.error('Error accessing any camera:', fallbackError);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                });
                return;
            }
        }

        // If we have a stream, set it up
        if (stream) {
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }
    }, [toast]);

    useEffect(() => {
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [getCameraPermission]);

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current || !videoRef.current.srcObject) {
            toast({ variant: "destructive", title: "Camera not available."});
            return;
        };
        
        const video = videoRef.current;
        if (video.readyState < video.HAVE_CURRENT_DATA || video.videoWidth === 0) {
          toast({
            variant: 'destructive',
            title: 'Camera Error',
            description: 'The camera is not ready yet. Please try again in a moment.',
          });
          return;
        }

        setIsProcessing(true);

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) {
            setIsProcessing(false);
            toast({ variant: "destructive", title: "Could not process image." });
            return;
        }

        // Resize the image to a max dimension to avoid overly large uploads
        const MAX_DIMENSION = 720;
        const { videoWidth, videoHeight } = video;
        const scale = Math.min(MAX_DIMENSION / videoWidth, MAX_DIMENSION / videoHeight, 1);
        canvas.width = videoWidth * scale;
        canvas.height = videoHeight * scale;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoDataUri = canvas.toDataURL('image/jpeg', 0.9);

        try {
            const result = await identifyPokemon({ photoDataUri });
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
        <div className="bg-foreground min-h-screen font-body flex flex-col">
            <header className="py-4 px-4 md:px-8 border-b-4 border-foreground/50 sticky top-0 z-10 bg-foreground flex items-center justify-between">
                <Link href="/" aria-label="Back to 8BitDex">
                    <Button variant="outline" size="sm" className="border-2 border-foreground bg-background text-foreground hover:bg-accent hover:text-accent-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                 <h1 className="text-lg sm:text-xl font-bold font-headline text-background uppercase tracking-wider text-center">
                    8Bit-Scanner
                 </h1>
                <div className="w-[88px] sm:w-[100px] flex justify-end">
                  <RadioTower className="text-background/50" />
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4 bg-black">
                <div className="w-full max-w-md space-y-2 text-center mb-4">
                    <p className="font-code text-xs text-green-400 uppercase">SYSTEM STATUS: <span className="text-white">ONLINE</span></p>
                    <p className="font-code text-xs text-green-400 uppercase">TARGETING: <span className="text-white">POKEMON</span></p>
                </div>

                <div className="relative w-full max-w-md aspect-[4/3] bg-black border-4 border-foreground overflow-hidden shadow-[inset_0_0_10px_black,0_0_10px_hsl(var(--primary)/0.5)]">
                    {isProcessing && <PokedexScanner />}
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <CameraFrame />
                    <canvas ref={canvasRef} className="hidden" />

                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 bg-background flex flex-col gap-4 items-center justify-center p-4 text-center">
                            <Alert variant="destructive" className="border-2 border-foreground">
                                <AlertTitle className="font-headline">Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to use this feature. You may need to change permissions in your browser settings.
                                </AlertDescription>
                            </Alert>
                             <Button onClick={() => window.location.reload()}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </div>
                    )}
                </div>
                <div className="mt-6 w-full max-w-md p-4 bg-foreground/20 border-t-4 border-foreground">
                    <div className="flex items-center justify-center gap-6">
                        <div className="w-8 h-8 bg-primary rounded-full border-2 border-foreground animate-pulse" />
                        <Button
                            size="lg"
                            className="h-20 w-20 rounded-full border-4 border-foreground bg-primary hover:bg-primary/90 focus-visible:ring-offset-8 active:scale-95 transition-transform"
                            onClick={handleCapture}
                            disabled={isProcessing || hasCameraPermission !== true}
                            aria-label="Capture Pokémon"
                        >
                            <Camera className="h-10 w-10 text-primary-foreground" />
                        </Button>
                        <div className="w-8 h-8 bg-primary rounded-full border-2 border-foreground animate-pulse" />
                    </div>
                </div>
            </main>
            <footer className="text-center py-4 text-xs text-background/50 font-code bg-black">
                Made By Ayushman
            </footer>
        </div>
    );
}
