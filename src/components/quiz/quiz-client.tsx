'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { PokemonListResult, PokemonType, PokemonSpecies } from '@/types/pokemon';
import { capitalize, getEnglishFlavorText } from '@/lib/pokemon-utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Trophy, Loader2, BrainCircuit, Swords, Shuffle, Image as ImageIcon, Star, Shield, Gem, BookOpen, Volume2 } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import type { Howl } from 'howler';

// prettier-ignore
const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
  "dragon", "dark", "steel", "fairy"
];

const GEN_LIMITS = {
    easy: 251,   // Gen 1-2
    medium: 493, // Gen 1-4
    hard: 1025,  // All available
};

type QuizMode = 'identify-pokemon' | 'type-matchup' | 'mixed';
type Difficulty = 'easy' | 'medium' | 'hard';
type GameState = 'loading' | 'selecting-difficulty' | 'selecting-mode' | 'generating' | 'playing' | 'finished';

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
const XP_FOR_CORRECT = 15;
const XP_FOR_STREAK_BONUS = 5;
const LOCAL_STORAGE_KEY = 'quizDexUserData';

const ACHIEVEMENTS = {
  firstCatch: { name: 'First Catch', description: 'Get your first answer right.' },
  noMissStreak10: { name: 'No-Miss Streak', description: 'Get 10 answers right in a row.' },
  dexAdept: { name: 'Dex Adept', description: 'Answer 25 questions correctly.' },
};
type AchievementId = keyof typeof ACHIEVEMENTS;

interface UserData {
    level: number;
    xp: number;
    totalCorrectAnswers: number;
    achievements: Record<AchievementId, boolean>;
}

const defaultUserData: UserData = {
    level: 1,
    xp: 0,
    totalCorrectAnswers: 0,
    achievements: {
        firstCatch: false,
        noMissStreak10: false,
        dexAdept: false,
    },
};

const calculateXpForNextLevel = (level: number) => Math.floor(100 * Math.pow(level, 1.5));

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
    const { toast } = useToast();

    // Quiz state
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [userAnswerId, setUserAnswerId] = useState<number | string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameState, setGameState] = useState<GameState>('loading');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [streak, setStreak] = useState(0);
    const [lastXpGain, setLastXpGain] = useState<number | null>(null);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Player Progression State
    const [userData, setUserData] = useState<UserData>(defaultUserData);
    const [xpForNextLevel, setXpForNextLevel] = useState(calculateXpForNextLevel(1));

    // Audio State
    const [ttsAudio, setTtsAudio] = useState<HTMLAudioElement | null>(null);
    const soundsRef = useRef<{
        select: Howl | null;
        correct: Howl | null;
        incorrect: Howl | null;
        music: Howl | null;
    }>({ select: null, correct: null, incorrect: null, music: null });

    // Initialize sounds client-side
    useEffect(() => {
        import('howler').then(({ Howl }) => {
            if (!soundsRef.current.select) { // Prevent re-init on hot reloads
                soundsRef.current.select = new Howl({ src: ['/audio/quiz-select.mp3'], volume: 0.5 });
                soundsRef.current.correct = new Howl({ src: ['/audio/quiz-correct.mp3'], volume: 0.7 });
                soundsRef.current.incorrect = new Howl({ src: ['/audio/quiz-incorrect.mp3'], volume: 0.7 });
                soundsRef.current.music = new Howl({
                    src: ['/audio/quiz-music.mp3'],
                    volume: 0.2,
                    loop: true,
                    autoplay: false,
                });
            }
        });

        return () => {
            Object.values(soundsRef.current).forEach(sound => sound?.unload());
            soundsRef.current = { select: null, correct: null, incorrect: null, music: null };
        };
    }, []);

    // Load data from localStorage on component mount
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Merge saved data with defaults to prevent errors from old data structures
                const initialUserData = { ...defaultUserData, ...parsedData };
                setUserData(initialUserData);
                setXpForNextLevel(calculateXpForNextLevel(initialUserData.level));
            }
        } catch (error) {
            console.error("Failed to load user data from localStorage", error);
        }
    }, []);
    
    // Save data to localStorage whenever user data changes
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error("Failed to save user data to localStorage", error);
        }
    }, [userData]);
    
    // Check for level-up whenever XP changes
    useEffect(() => {
        if (userData.xp >= xpForNextLevel) {
            const newLevel = userData.level + 1;
            const remainingXp = userData.xp - xpForNextLevel;
            
            setUserData(prev => ({...prev, level: newLevel, xp: remainingXp }));
            setXpForNextLevel(calculateXpForNextLevel(newLevel));
            
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
        }
    }, [userData.xp, userData.level, xpForNextLevel]);

    const generateQuestions = useCallback(async (mode: QuizMode) => {
        setGameState('generating');
        
        const limit = GEN_LIMITS[difficulty];
        const availablePokemon = allPokemon.slice(0, limit);

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

            if (questionType === 'identify-pokemon' && availablePokemon.length >= 4) {
                 questionPromises.push(Promise.resolve(generateIdentifyPokemonQuestion(availablePokemon)));
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
    }, [allPokemon, difficulty]);
    
    useEffect(() => {
        if (allPokemon.length > 0 && gameState === 'loading') {
            setGameState('selecting-difficulty');
        }
    }, [allPokemon, gameState]);

    const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
        soundsRef.current.select?.play();
        // Start music on the first user interaction if it's not already playing.
        if (soundsRef.current.music && !soundsRef.current.music.playing()) {
            soundsRef.current.music.play();
        }
        setDifficulty(selectedDifficulty);
        setGameState('selecting-mode');
    };

    const handleModeSelect = (mode: QuizMode) => {
        soundsRef.current.select?.play();
        generateQuestions(mode);
    }
    
    const handleAnswer = (answerId: number | string) => {
        if (showFeedback || isTransitioning) return;
        
        soundsRef.current.select?.play();
        setUserAnswerId(answerId);
        setShowFeedback(true);

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = answerId === currentQuestion.correctAnswerId;

        if (isCorrect) {
            soundsRef.current.correct?.play();

            if (currentQuestion.type === 'identify-pokemon') {
                const correctOption = currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswerId);
                if (correctOption) {
                    (async () => {
                        try {
                            const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${correctOption.id}`);
                            if (!speciesRes.ok) throw new Error('Failed to fetch species data for TTS');
                            
                            const speciesData: PokemonSpecies = await speciesRes.json();
                            const flavorText = getEnglishFlavorText(speciesData.flavor_text_entries);
                            const textToSpeak = `${correctOption.label}. ${flavorText}`;

                            const ttsResult = await textToSpeech(textToSpeak);
                            if (ttsResult.media) {
                                setTtsAudio(new Audio(ttsResult.media));
                            }
                        } catch (e) {
                            console.error("Failed to generate Pokémon description TTS", e);
                        }
                    })();
                }
            }

            const newStreak = streak + 1;
            const xpGain = XP_FOR_CORRECT + (newStreak >= 2 ? (newStreak * XP_FOR_STREAK_BONUS) : 0);
            const newTotalCorrect = userData.totalCorrectAnswers + 1;
            let newAchievements = { ...userData.achievements };

            const unlockAchievement = (id: AchievementId) => {
                if (!newAchievements[id]) {
                    newAchievements[id] = true;
                    toast({
                        title: '🏆 Achievement Unlocked!',
                        description: ACHIEVEMENTS[id].name,
                        className: 'border-2 border-accent text-accent-foreground',
                    });
                }
            }

            // Check for achievements
            if (newTotalCorrect === 1) unlockAchievement('firstCatch');
            if (newStreak >= 10) unlockAchievement('noMissStreak10');
            if (newTotalCorrect >= 25) unlockAchievement('dexAdept');
            
            setScore(prev => prev + 1);
            setStreak(newStreak);
            setLastXpGain(xpGain);
            setUserData(prev => ({
                ...prev,
                xp: prev.xp + xpGain,
                totalCorrectAnswers: newTotalCorrect,
                achievements: newAchievements,
            }));
        } else {
            soundsRef.current.incorrect?.play();
            setStreak(0);
            setLastXpGain(0);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 820);
        }
    };

    const handleNextQuestion = () => {
        if (isTransitioning) return;
        soundsRef.current.select?.play();
        setIsTransitioning(true); // Triggers fade-out
    };
    
    const advanceQuestionState = () => {
        setShowFeedback(false);
        setUserAnswerId(null);
        setLastXpGain(null);
        setTtsAudio(null);
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setGameState('finished');
            soundsRef.current.music?.stop();
        }
        setIsTransitioning(false);
    };
    
    const restartQuiz = () => {
        soundsRef.current.select?.play();
        soundsRef.current.music?.stop();
        setScore(0);
        setCurrentQuestionIndex(0);
        setUserAnswerId(null);
        setShowFeedback(false);
        setQuestions([]);
        setStreak(0);
        setLastXpGain(null);
        setGameState('selecting-difficulty');
    };

    if (gameState === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="font-headline text-lg">Loading Pokémon Data...</p>
            </div>
        );
    }

    if (gameState === 'selecting-difficulty') {
        return (
            <Card className="w-full max-w-2xl p-6 sm:p-8 text-center border-2 border-foreground bg-card">
                <BrainCircuit className="w-16 h-16 mx-auto text-accent" />
                <h2 className="text-2xl sm:text-3xl font-headline mt-4">Select Difficulty</h2>
                <p className="text-muted-foreground mt-2 mb-8">Choose your challenge level to begin.</p>
                <div className="grid grid-cols-1 gap-4">
                    <Button onClick={() => handleDifficultySelect('easy')} variant="outline" className="h-auto p-3 sm:p-4 border-2 !border-foreground justify-start text-left">
                        <Star className="mr-2 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                        <div className="flex-shrink min-w-0">
                            <p className="font-bold text-sm sm:text-base">Easy</p>
                            <p className="font-normal text-xs text-muted-foreground">Generations I & II</p>
                        </div>
                    </Button>
                    <Button onClick={() => handleDifficultySelect('medium')} variant="outline" className="h-auto p-3 sm:p-4 border-2 !border-foreground justify-start text-left">
                        <Shield className="mr-2 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
                        <div className="flex-shrink min-w-0">
                            <p className="font-bold text-sm sm:text-base">Medium</p>
                            <p className="font-normal text-xs text-muted-foreground">Generations I - IV</p>
                        </div>
                    </Button>
                    <Button onClick={() => handleDifficultySelect('hard')} variant="outline" className="h-auto p-3 sm:p-4 border-2 !border-foreground justify-start text-left">
                        <Gem className="mr-2 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0" />
                        <div className="flex-shrink min-w-0">
                            <p className="font-bold text-sm sm:text-base">Hard</p>
                            <p className="font-normal text-xs text-muted-foreground">All Generations</p>
                        </div>
                    </Button>
                </div>
            </Card>
        )
    }

    if (gameState === 'selecting-mode') {
        return (
            <>
                <Card className="w-full max-w-2xl p-6 sm:p-8 text-center border-2 border-foreground bg-card">
                    <BrainCircuit className="w-16 h-16 mx-auto text-accent" />
                    <h2 className="text-2xl sm:text-3xl font-headline mt-4">Choose Your Challenge!</h2>
                    <p className="text-muted-foreground mt-2 mb-8">Select a category to begin the quiz.</p>
                    <div className="grid grid-cols-1 gap-4">
                        <Button onClick={() => handleModeSelect('identify-pokemon')} variant="outline" className="h-auto p-3 sm:p-4 border-2 !border-foreground justify-start text-left">
                            <ImageIcon className="mr-2 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                            <div className="flex-shrink min-w-0">
                                <p className="font-bold text-sm sm:text-base">Sprite Mode</p>
                                <p className="font-normal text-xs text-muted-foreground">Guess the Pokémon from its picture.</p>
                            </div>
                        </Button>
                        <Button onClick={() => handleModeSelect('type-matchup')} variant="outline" className="h-auto p-3 sm:p-4 border-2 !border-foreground justify-start text-left">
                            <Swords className="mr-2 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                            <div className="flex-shrink min-w-0">
                                <p className="font-bold text-sm sm:text-base">Battle Mode</p>
                                <p className="font-normal text-xs text-muted-foreground">Test your knowledge of type matchups.</p>
                            </div>
                        </Button>
                        <Button onClick={() => handleModeSelect('mixed')} variant="outline" className="h-auto p-3 sm:p-4 border-2 !border-foreground justify-start text-left">
                            <Shuffle className="mr-2 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                            <div className="flex-shrink min-w-0">
                                <p className="font-bold text-sm sm:text-base">Mystery Mode</p>
                                <p className="font-normal text-xs text-muted-foreground">A random mix of all question types.</p>
                            </div>
                        </Button>
                    </div>
                </Card>
                <Card className="w-full max-w-2xl mt-8 border-2 border-foreground bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-headline">
                            <Trophy className="w-5 h-5 text-accent" />
                            Achievements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(ACHIEVEMENTS).map(([id, ach]) => (
                            <div key={id} className={cn(
                                "p-3 border-2 border-foreground/30 text-center transition-all rounded-none",
                                userData.achievements[id as AchievementId] && "border-accent bg-accent/10"
                            )}>
                                <Trophy className={cn("w-8 h-8 mx-auto", userData.achievements[id as AchievementId] ? "text-accent" : "text-muted-foreground")} />
                                <p className="font-bold text-sm mt-2">{ach.name}</p>
                                <p className="text-xs text-muted-foreground">{ach.description}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </>
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
                <Trophy className="w-16 h-16 mx-auto text-accent" />
                <h2 className="text-2xl sm:text-3xl font-headline mt-4">Quiz Complete!</h2>
                <p className="text-muted-foreground mt-2">Final Score</p>
                <p className="text-4xl sm:text-5xl font-bold font-headline my-4 text-primary">{score} / {NUM_QUESTIONS}</p>
                <div className="mb-8 text-lg">
                    <p>Level: <span className="font-bold text-accent">{userData.level}</span></p>
                    <p className="text-sm text-muted-foreground">{userData.xp} / {xpForNextLevel} XP</p>
                </div>
                <Button onClick={restartQuiz} size="lg">
                    Play Again
                </Button>
            </Card>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
        <div className="w-full max-w-2xl relative">
            {showLevelUp && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                    <p className="font-headline text-2xl text-yellow-400 drop-shadow-[2px_2px_0_hsl(var(--foreground))]">LEVEL UP!</p>
                </div>
            )}
            <div className="mb-4 space-y-2">
                <div className="flex justify-between items-baseline font-code text-xs">
                    <p>Level: <span className="font-bold text-accent">{userData.level}</span></p>
                    <p>XP: <span className="font-bold">{userData.xp} / {xpForNextLevel}</span></p>
                </div>
                <Progress value={(userData.xp / xpForNextLevel) * 100} className="h-2" />
            </div>

            <div className="mb-4 space-y-2">
                <div className="flex justify-between items-baseline font-code text-xs">
                    <p>Score: <span className="font-bold text-accent">{score}</span></p>
                    <p>Question: <span className="font-bold">{currentQuestionIndex + 1} / {NUM_QUESTIONS}</span></p>
                </div>
            </div>

            <Card
                onAnimationEnd={() => {
                    if (isTransitioning) {
                        advanceQuestionState();
                    }
                }}
                className={cn(
                    "border-2 border-foreground bg-card p-4 sm:p-8",
                    isShaking && 'animate-shake',
                    isTransitioning ? 'animate-fade-out' : 'animate-fade-in'
                )}
            >
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
                                <span className="truncate">{option.label}</span>
                                {showFeedback && isCorrect && <CheckCircle />}
                                {showFeedback && isSelected && !isCorrect && <XCircle />}
                            </Button>
                        );
                    })}
                </div>
                
                {showFeedback && (
                    <div className="mt-6 text-center">
                        {lastXpGain !== null && lastXpGain > 0 ? (
                            <p className="mb-2 font-bold text-chart-4">
                                Correct! +{lastXpGain} XP
                                {streak > 1 && <span className="text-yellow-500"> ({streak}x Streak!)</span>}
                            </p>
                        ) : (
                            <p className="mb-2 font-bold text-destructive">Incorrect!</p>
                        )}
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                            <Button onClick={handleNextQuestion} size="lg" className="w-full sm:w-auto" disabled={isTransitioning}>
                                {isTransitioning ? 'Loading...' : (currentQuestionIndex === NUM_QUESTIONS - 1 ? 'Finish Quiz' : 'Next Question')}
                            </Button>
                            
                            {currentQuestion.type === 'identify-pokemon' && showFeedback && (
                                <div className="flex w-full sm:w-auto gap-2">
                                    <Link href={`/pokemon/${currentQuestion.correctAnswerId}`} className="flex-grow">
                                        <Button variant="secondary" size="lg" className="w-full border-2 !border-foreground">
                                            <BookOpen className="mr-2" />
                                            Learn<span className="hidden sm:inline">&nbsp;More</span>
                                        </Button>
                                    </Link>
                                    {ttsAudio && (
                                        <Button 
                                            variant="secondary" 
                                            size="icon" 
                                            className="h-11 w-11 border-2 !border-foreground" 
                                            onClick={() => ttsAudio?.play()}
                                            aria-label="Play description"
                                        >
                                            <Volume2 />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
