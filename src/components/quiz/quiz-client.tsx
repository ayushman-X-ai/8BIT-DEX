'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { PokemonListResult, PokemonType } from '@/types/pokemon';
import { capitalize } from '@/lib/pokemon-utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Award, Loader2, BrainCircuit, Swords, Shuffle, Image as ImageIcon } from 'lucide-react';

// prettier-ignore
const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
  "dragon", "dark", "steel", "fairy"
];

type QuizMode = 'identify-pokemon' | 'type-matchup' | 'mixed';

type QuizQuestion = {
    type: 'identify-pokemon';
    questionText: string;
    pokemonSpriteUrl: string;
    options: { label: string; id: number }[];
    correctAnswerId: number;
} | {
    type: 'type-matchup';
    questionText: string;
    options: { label: string; id: string }[];
    correctAnswerId: string;
};

const NUM_QUESTIONS = 10;

// Utility to get the ID from a Pokémon URL
const getIdFromUrl = (url: string) => {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 2]);
};

// --- Question Generation Logic ---

// Generates a "Who's That Pokémon?" question
const generateIdentifyPokemonQuestion = (allPokemon: PokemonListResult[]): QuizQuestion | null => {
    const shuffledPokemon = [...allPokemon].sort(() => 0.5 - Math.random());
    if (shuffledPokemon.length < 4) return null;

    const correctPokemon = shuffledPokemon[0];
    const correctPokemonId = getIdFromUrl(correctPokemon.url);
    
    let options = [{ label: capitalize(correctPokemon.name), id: correctPokemonId }];
    
    shuffledPokemon.slice(1, 4).forEach(p => {
        options.push({ label: capitalize(p.name), id: getIdFromUrl(p.url) });
    });

    return {
        type: 'identify-pokemon',
        questionText: "Who's that Pokémon?",
        pokemonSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${correctPokemonId}.png`,
        options: options.sort(() => 0.5 - Math.random()),
        correctAnswerId: correctPokemonId,
    };
};

// Generates a "Type Matchup" question
const generateTypeMatchupQuestion = async (): Promise<QuizQuestion | null> => {
    try {
        const randomType = POKEMON_TYPES[Math.floor(Math.random() * POKEMON_TYPES.length)];
        const res = await fetch(`https://pokeapi.co/api/v2/type/${randomType}`);
        if (!res.ok) throw new Error(`Failed to fetch type data for ${randomType}`);
        const data: PokemonType = await res.json();
        
        const effectiveRelations = data.damage_relations.double_damage_to;
        if (effectiveRelations.length === 0) {
            // This type is not super-effective against anything, try again recursively.
            return generateTypeMatchupQuestion();
        }

        const correctAnswer = effectiveRelations[Math.floor(Math.random() * effectiveRelations.length)].name;
        
        const incorrectOptions = POKEMON_TYPES
            .filter(t => t !== correctAnswer && t !== randomType && !effectiveRelations.some(r => r.name === t))
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
            
        const options = [
            { label: capitalize(correctAnswer), id: correctAnswer },
            ...incorrectOptions.map(t => ({ label: capitalize(t), id: t }))
        ].sort(() => 0.5 - Math.random());
        
        return {
            type: 'type-matchup',
            questionText: `${capitalize(randomType)} is super effective against...?`,
            options,
            correctAnswerId: correctAnswer,
        };
    } catch (error) {
        console.error("Failed to generate type matchup question:", error);
        return null;
    }
};

export default function QuizClient({ allPokemon }: { allPokemon: PokemonListResult[] }) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [userAnswerId, setUserAnswerId] = useState<number | string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameState, setGameState] = useState<'loading' | 'selecting' | 'generating' | 'playing' | 'finished'>('loading');

    const generateQuestions = useCallback(async (mode: QuizMode) => {
        setGameState('generating');
        
        const questionPromises: Promise<QuizQuestion | null>[] = [];
        for (let i = 0; i < NUM_QUESTIONS; i++) {
            let questionType: 'identify-pokemon' | 'type-matchup';

            switch(mode) {
                case 'identify-pokemon':
                    questionType = 'identify-pokemon';
                    break;
                case 'type-matchup':
                    questionType = 'type-matchup';
                    break;
                case 'mixed':
                default:
                    questionType = Math.random() > 0.5 ? 'identify-pokemon' : 'type-matchup';
                    break;
            }

            if (questionType === 'identify-pokemon' && allPokemon.length >= 4) {
                 questionPromises.push(Promise.resolve(generateIdentifyPokemonQuestion(allPokemon)));
            } else {
                questionPromises.push(generateTypeMatchupQuestion());
            }
        }

        const newQuestions = (await Promise.all(questionPromises)).filter((q): q is QuizQuestion => q !== null);
        
        if (newQuestions.length < NUM_QUESTIONS) {
            console.warn("Could not generate all questions. Retrying...");
            setTimeout(() => generateQuestions(mode), 1000);
            return;
        }

        setQuestions(newQuestions);
        setGameState('playing');
    }, [allPokemon]);
    
    useEffect(() => {
        if (allPokemon.length > 0 && gameState === 'loading') {
            setGameState('selecting');
        }
    }, [allPokemon, gameState]);

    const handleModeSelect = (mode: QuizMode) => {
        generateQuestions(mode);
    }
    
    const handleAnswer = (answerId: number | string) => {
        if (showFeedback) return;
        
        setUserAnswerId(answerId);
        if (answerId === questions[currentQuestionIndex].correctAnswerId) {
            setScore(prev => prev + 1);
        }
        setShowFeedback(true);
    };
    
    const handleNextQuestion = () => {
        setShowFeedback(false);
        setUserAnswerId(null);
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setGameState('finished');
        }
    };
    
    const restartQuiz = () => {
        setScore(0);
        setCurrentQuestionIndex(0);
        setUserAnswerId(null);
        setShowFeedback(false);
        setQuestions([]);
        setGameState('selecting');
    };

    if (gameState === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="font-headline text-lg">Loading Pokémon Data...</p>
            </div>
        );
    }

    if (gameState === 'selecting') {
        return (
            <Card className="w-full max-w-2xl p-6 sm:p-8 text-center border-2 border-foreground bg-card">
                <BrainCircuit className="w-16 h-16 mx-auto text-accent" />
                <h2 className="text-2xl sm:text-3xl font-headline mt-4">Choose Your Challenge!</h2>
                <p className="text-muted-foreground mt-2 mb-8">Select a category to begin the quiz.</p>
                <div className="grid grid-cols-1 gap-4">
                     <Button onClick={() => handleModeSelect('identify-pokemon')} size="lg" variant="outline" className="h-auto py-4 border-2 !border-foreground justify-start">
                        <ImageIcon className="mr-4 h-8 w-8 text-primary" />
                        <div className="text-left">
                            <p className="font-bold text-base">Sprite Mode</p>
                            <p className="font-normal text-xs text-muted-foreground">Guess the Pokémon from its picture.</p>
                        </div>
                    </Button>
                    <Button onClick={() => handleModeSelect('type-matchup')} size="lg" variant="outline" className="h-auto py-4 border-2 !border-foreground justify-start">
                        <Swords className="mr-4 h-8 w-8 text-primary" />
                        <div className="text-left">
                            <p className="font-bold text-base">Battle Mode</p>
                            <p className="font-normal text-xs text-muted-foreground">Test your knowledge of type matchups.</p>
                        </div>
                    </Button>
                     <Button onClick={() => handleModeSelect('mixed')} size="lg" variant="outline" className="h-auto py-4 border-2 !border-foreground justify-start">
                        <Shuffle className="mr-4 h-8 w-8 text-primary" />
                        <div className="text-left">
                            <p className="font-bold text-base">Mystery Mode</p>
                            <p className="font-normal text-xs text-muted-foreground">A random mix of all question types.</p>
                        </div>
                    </Button>
                </div>
            </Card>
        );
    }

     if (gameState === 'generating') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="font-headline text-lg">Generating Quiz...</p>
            </div>
        );
    }
    
    if (gameState === 'finished') {
        return (
            <Card className="w-full max-w-2xl p-6 sm:p-8 text-center border-2 border-foreground bg-card">
                <Award className="w-16 h-16 mx-auto text-accent" />
                <h2 className="text-2xl sm:text-3xl font-headline mt-4">Quiz Complete!</h2>
                <p className="text-muted-foreground mt-2">You scored</p>
                <p className="text-5xl font-bold font-headline my-4 text-primary">{score} / {NUM_QUESTIONS}</p>
                <Button onClick={restartQuiz} size="lg">
                    Play Again
                </Button>
            </Card>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
        <div className="w-full max-w-2xl">
            <div className="mb-4 space-y-2">
                <div className="flex justify-between items-baseline font-code text-xs">
                    <p>Score: <span className="font-bold text-accent">{score}</span></p>
                    <p>Question: <span className="font-bold">{currentQuestionIndex + 1} / {NUM_QUESTIONS}</span></p>
                </div>
                <Progress value={((currentQuestionIndex + 1) / NUM_QUESTIONS) * 100} />
            </div>

            <Card className="border-2 border-foreground bg-card p-4 sm:p-8">
                {currentQuestion.type === 'identify-pokemon' && (
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6">
                        <Image
                            src={currentQuestion.pokemonSpriteUrl}
                            alt="A mystery Pokémon"
                            fill
                            priority
                            className="object-contain"
                            data-ai-hint="pokemon character"
                        />
                    </div>
                )}
                
                <h2 className="text-xl sm:text-2xl font-bold font-headline text-center mb-6">{currentQuestion.questionText}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map(option => {
                        const isCorrect = option.id === currentQuestion.correctAnswerId;
                        const isSelected = option.id === userAnswerId;
                        
                        let customClasses = "";
                        if (showFeedback) {
                            if (isCorrect) {
                                customClasses = "bg-chart-4 text-primary-foreground hover:bg-chart-4/90";
                            } else if (isSelected) {
                                customClasses = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
                            }
                        }

                        return (
                            <Button
                                key={option.id}
                                variant="outline"
                                onClick={() => handleAnswer(option.id)}
                                disabled={showFeedback}
                                className={cn(
                                    "h-auto justify-between p-3 text-sm sm:text-base border-2 !border-foreground",
                                    showFeedback && !isCorrect && !isSelected && "opacity-50",
                                    customClasses
                                )}
                            >
                                <span>{option.label}</span>
                                {showFeedback && isCorrect && <CheckCircle />}
                                {showFeedback && isSelected && !isCorrect && <XCircle />}
                            </Button>
                        );
                    })}
                </div>
                
                {showFeedback && (
                    <div className="mt-6 text-center">
                        <Button onClick={handleNextQuestion} size="lg" className="w-full sm:w-auto">
                            {currentQuestionIndex === NUM_QUESTIONS - 1 ? 'Finish Quiz' : 'Next Question'}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
