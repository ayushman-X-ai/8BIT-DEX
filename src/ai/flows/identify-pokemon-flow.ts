'use server';
/**
 * @fileOverview An AI flow to identify a Pokémon from an image using the Gemini API.
 * This flow dynamically selects the API key based on the device type (mobile vs. desktop).
 *
 * - identifyPokemon - A function that handles the Pokémon identification process.
 * - IdentifyPokemonInput - The input type for the identifyPokemon function.
 * - IdentifyPokemonOutput - The return type for the identifyPokemon function.
 */

import { z } from 'genkit';
import { ai as defaultAi } from '@/ai/genkit';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Separate AI instance for the mobile scanner, using a dedicated API key.
const mobileScannerAi = genkit({
  plugins: [googleAI({ apiKey: process.env.SCANNER_API_KEY })],
  model: 'googleai/gemini-2.0-flash', // A model suitable for vision tasks
});

const IdentifyPokemonInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing a Pokémon, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  isMobile: z.boolean().describe('A flag indicating if the request is from a mobile device.')
});
export type IdentifyPokemonInput = z.infer<typeof IdentifyPokemonInputSchema>;

const IdentifyPokemonOutputSchema = z.object({
  pokemonName: z.string().describe('The name of the Pokémon identified in the image in lowercase, or an empty string if no Pokémon is found or it cannot be identified.'),
});
export type IdentifyPokemonOutput = z.infer<typeof IdentifyPokemonOutputSchema>;

export async function identifyPokemon(input: IdentifyPokemonInput): Promise<IdentifyPokemonOutput> {
  return identifyPokemonFlow(input);
}

const defaultPrompt = defaultAi.definePrompt({
  name: 'identifyPokemonPrompt',
  input: {schema: IdentifyPokemonInputSchema},
  output: {schema: IdentifyPokemonOutputSchema},
  prompt: `You are a Pokémon expert. Your task is to identify the Pokémon in the provided image.

Respond with only the common English name of the Pokémon in lowercase.

If the image does not contain a Pokémon, or if you cannot confidently identify it, respond with an empty string.

Photo: {{media url=photoDataUri}}`,
});

const mobilePrompt = mobileScannerAi.definePrompt({
    name: 'identifyPokemonMobilePrompt',
    input: {schema: IdentifyPokemonInputSchema},
    output: {schema: IdentifyPokemonOutputSchema},
    prompt: `You are a Pokémon expert. Your task is to identify the Pokémon in the provided image.

Respond with only the common English name of the Pokémon in lowercase.

If the image does not contain a Pokémon, or if you cannot confidently identify it, respond with an empty string.

Photo: {{media url=photoDataUri}}`,
});

const identifyPokemonFlow = defaultAi.defineFlow(
  {
    name: 'identifyPokemonFlow',
    inputSchema: IdentifyPokemonInputSchema,
    outputSchema: IdentifyPokemonOutputSchema,
  },
  async (input) => {
    // Choose the prompt based on the device type
    const promptToUse = input.isMobile ? mobilePrompt : defaultPrompt;
    
    const result = await promptToUse(input);
    
    // The exclamation mark tells TypeScript that we are sure output will not be null.
    return result.output!;
  }
);
