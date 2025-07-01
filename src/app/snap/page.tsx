'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { identifyPokemon } from '@/ai/flows/identify-pokemon-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PokedexScanner = () => (
    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20">
        <RefreshCw className="h-16 w-16 animate-spin text-primary" />
        <p className="font-headline text-lg text-foreground mt-4 tracking-wider">IDENTIFYING...</p>
    </div>
);

export default function SnapPage() {
    const router = useRouter();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const getCameraPermission = async () => {
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

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                setHasCameraPermission(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                });
            }
        };

        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [toast]);

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsProcessing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            setIsProcessing(false);
            toast({ variant: "destructive", title: "Could not process image." });
            return;
        }

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const photoDataUri = canvas.toDataURL('image/jpeg');

        try {
            const result = await identifyPokemon({ photoDataUri });
            if (result.pokemonName) {
                router.push(`/pokemon/${result.pokemonName.toLowerCase()}`);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Identification Failed',
                    description: 'Could not identify a Pokémon. Please try again with a clearer image.',
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

    const CameraFrame = () => (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
        <div className="w-full h-full border-4 border-dashed border-white/50 relative">
          {/* Corners */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-accent"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-accent"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-accent"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-accent"></div>
        </div>
      </div>
    );

    return (
        <div className="bg-background min-h-screen font-body flex flex-col">
            <header className="py-4 px-4 md:px-8 border-b-4 border-foreground sticky top-0 z-10 bg-background flex items-center justify-between">
                <Link href="/" aria-label="Back to Pokédex">
                    <Button variant="outline" size="sm" className="border-2 border-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                 <h1 className="text-xl font-bold font-headline text-foreground uppercase tracking-wider text-center">
                    Snap & Identify
                </h1>
                <div className="w-[88px] sm:w-[100px]"></div> {/* Spacer */}
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="relative w-full max-w-md aspect-[4/3] bg-foreground/20 border-4 border-foreground overflow-hidden">
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
                <div className="mt-8">
                    <Button
                        size="lg"
                        className="h-16 w-16 rounded-full border-4 border-foreground bg-primary hover:bg-primary/90 focus-visible:ring-offset-8"
                        onClick={handleCapture}
                        disabled={isProcessing || hasCameraPermission !== true}
                        aria-label="Capture Pokémon"
                    >
                        <Camera className="h-8 w-8 text-primary-foreground" />
                    </Button>
                </div>
            </main>
        </div>
    );
}
