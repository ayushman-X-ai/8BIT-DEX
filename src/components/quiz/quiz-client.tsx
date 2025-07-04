'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { PokemonListResult } from '@/types/pokemon';
import { capitalize } from '@/lib/pokemon-utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Award } from 'lucide-react';

interface QuizQuestion {
    questionText: string;
    pokemonSpriteUrl: string;
    options: {
        name: string;
        id: number;
    }[];
    correctAnswerId: number;
}

const NUM_QUESTIONS = 10;

// Utility to get the ID from a Pokémon URL
const getIdFromUrl = (url: string) => {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 2]);
};

export default function QuizClient({ allPokemon }: { allPokemon: PokemonListResult[] }) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [userAnswerId, setUserAnswerId] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

    const generateQuestions = useCallback(() => {
        const shuffledPokemon = [...allPokemon].sort(() => 0.5 - Math.random());
        const newQuestions: QuizQuestion[] = [];

        for (let i = 0; i < NUM_QUESTIONS; i++) {
            if (shuffledPokemon.length < 4) break;

            const correctPokemon = shuffledPokemon[i];
            const correctPokemonId = getIdFromUrl(correctPokemon.url);

            let options = [{ name: capitalize(correctPokemon.name), id: correctPokemonId }];
            
            const otherPokemon = allPokemon.filter(p => getIdFromUrl(p.url) !== correctPokemonId);
            const shuffledOptions = otherPokemon.sort(() => 0.5 - Math.random()).slice(0, 3);

            shuffledOptions.forEach(p => {
                options.push({ name: capitalize(p.name), id: getIdFromUrl(p.url) });
            });

            options = options.sort(() => 0.5 - Math.random());
            
            newQuestions.push({
                questionText: "Who's that Pokémon?",
                pokemonSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${correctPokemonId}.png`,
                options: options,
                correctAnswerId: correctPokemonId,
            });
        }
        setQuestions(newQuestions);
    }, [allPokemon]);
    
    useEffect(() => {
        generateQuestions();
    }, [generateQuestions]);
    
    const handleAnswer = (answerId: number) => {
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
        generateQuestions();
        setGameState('playing');
    };

    if (questions.length === 0) {
        return <p className="text-muted-foreground">Generating quiz...</p>;
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
                                <span>{option.name}</span>
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
