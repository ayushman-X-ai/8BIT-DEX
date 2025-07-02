'use server';
/**
 * @fileOverview An AI flow to identify a Pokémon from an image using the Gemini API.
 * This flow is intended for desktop use.
 *
 * - identifyPokemon - A function that handles the pokemon identification process.
 * - IdentifyPokemonInput - The input type for the identification flow.
 * - IdentifyPokemonOutput - The return type for the identification flow.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const IdentifyPokemonInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing a Pokémon, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type IdentifyPokemonInput = z.infer<typeof IdentifyPokemonInputSchema>;

const IdentifyPokemonOutputSchema = z.object({
  pokemonName: z.string().describe('The name of the Pokémon identified in the image in lowercase, or an empty string if no Pokémon is found or it cannot be identified.'),
});
export type IdentifyPokemonOutput = z.infer<typeof IdentifyPokemonOutputSchema>;

/**
 * Main exported function for desktop identification.
 */
export async function identifyPokemon(input: IdentifyPokemonInput): Promise<IdentifyPokemonOutput> {
  return identifyPokemonFlow(input);
}

const identifyPokemonPrompt = ai.definePrompt({
    name: 'identifyPokemonPrompt',
    input: { schema: IdentifyPokemonInputSchema },
    output: { schema: IdentifyPokemonOutputSchema },
    prompt: `You are a Pokémon expert. Your task is to identify the Pokémon in the provided image.

Respond with only the common English name of the Pokémon in lowercase.

If the image does not contain a Pokémon, or if you cannot confidently identify it, respond with an empty string.

Photo: {{media url=photoDataUri}}`,
});

const identifyPokemonFlow = ai.defineFlow(
  {
    name: 'identifyPokemonFlow',
    inputSchema: IdentifyPokemonInputSchema,
    outputSchema: IdentifyPokemonOutputSchema,
  },
  async (input) => {
    const result = await identifyPokemonPrompt(input);
    return result.output!;
  }
);
