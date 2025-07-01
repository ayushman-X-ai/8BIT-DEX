'use server';

/**
 * @fileOverview AI-powered Pokémon strategy explainer.
 *
 * - explainPokemonStrategy - A function that generates a strategic summary of a Pokémon.
 * - ExplainPokemonStrategyInput - The input type for the explainPokemonStrategy function.
 * - ExplainPokemonStrategyOutput - The return type for the explainPokemonStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainPokemonStrategyInputSchema = z.object({
  pokemonName: z.string().describe('The name of the Pokémon.'),
  pokemonType: z.string().describe('The type of the Pokémon.'),
  attackTypes: z.string().describe('The attack types of the Pokémon.'),
  advantages: z.string().describe('The advantages of the Pokémon.'),
});
export type ExplainPokemonStrategyInput = z.infer<typeof ExplainPokemonStrategyInputSchema>;

const ExplainPokemonStrategyOutputSchema = z.object({
  summary: z.string().describe('A short summary of the Pokémon and its strategic battle utility.'),
});
export type ExplainPokemonStrategyOutput = z.infer<typeof ExplainPokemonStrategyOutputSchema>;

export async function explainPokemonStrategy(input: ExplainPokemonStrategyInput): Promise<ExplainPokemonStrategyOutput> {
  return explainPokemonStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainPokemonStrategyPrompt',
  input: {schema: ExplainPokemonStrategyInputSchema},
  output: {schema: ExplainPokemonStrategyOutputSchema},
  prompt: `You are a Pokémon battle strategist. Provide a short summary of the following Pokémon and explain why it would be strategically useful for a battle, including considerations of its attack types and advantages.\n\nPokémon Name: {{{pokemonName}}}\nPokémon Type: {{{pokemonType}}}\nAttack Types: {{{attackTypes}}}\nAdvantages: {{{advantages}}}`,
});

const explainPokemonStrategyFlow = ai.defineFlow(
  {
    name: 'explainPokemonStrategyFlow',
    inputSchema: ExplainPokemonStrategyInputSchema,
    outputSchema: ExplainPokemonStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
