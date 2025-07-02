'use server';
/**
 * @fileOverview An AI flow to identify a Pokémon from an image.
 *
 * - identifyPokemon - A function that handles the Pokémon identification process.
 * - IdentifyPokemonInput - The input type for the identifyPokemon function.
 * - IdentifyPokemonOutput - The return type for the identifyPokemon function.
 */

import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ai as defaultAi } from '@/ai/genkit';

const IdentifyPokemonInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing a Pokémon, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  isMobile: z.boolean().describe('Whether the request is from a mobile device.'),
});
export type IdentifyPokemonInput = z.infer<typeof IdentifyPokemonInputSchema>;

const IdentifyPokemonOutputSchema = z.object({
  pokemonName: z.string().describe('The name of the Pokémon identified in the image in lowercase, or an empty string if no Pokémon is found or it cannot be identified.'),
});
export type IdentifyPokemonOutput = z.infer<typeof IdentifyPokemonOutputSchema>;

export async function identifyPokemon(input: IdentifyPokemonInput): Promise<IdentifyPokemonOutput> {
  return identifyPokemonFlow(input);
}

const PROMPT_TEXT = `You are a Pokémon expert. Your task is to identify the Pokémon in the provided image.

Respond with only the common English name of the Pokémon in lowercase.

If the image does not contain a Pokémon, or if you cannot confidently identify it, respond with an empty string.

Photo: {{media url=photoDataUri}}`;

// Mobile-specific model instance using the dedicated scanner key.
// We use gemini-2.0-flash as it is suitable for vision tasks.
const mobileScannerModel = googleAI({ apiKey: process.env.SCANNER_API_KEY }).model('gemini-2.0-flash');

// Prompt for mobile devices, using the scanner-specific model
const mobilePrompt = defaultAi.definePrompt({
  name: 'identifyPokemonPromptMobile',
  model: mobileScannerModel,
  input: {schema: IdentifyPokemonInputSchema},
  output: {schema: IdentifyPokemonOutputSchema},
  prompt: PROMPT_TEXT,
});

// Prompt for non-mobile devices, using the default AI model
const desktopPrompt = defaultAi.definePrompt({
  name: 'identifyPokemonPromptDesktop',
  input: {schema: IdentifyPokemonInputSchema},
  output: {schema: IdentifyPokemonOutputSchema},
  prompt: PROMPT_TEXT,
});

// A single flow that routes to the correct prompt based on the device type
const identifyPokemonFlow = defaultAi.defineFlow(
  {
    name: 'identifyPokemonFlow',
    inputSchema: IdentifyPokemonInputSchema,
    outputSchema: IdentifyPokemonOutputSchema,
  },
  async (input) => {
    let result;
    if (input.isMobile) {
      result = await mobilePrompt(input);
    } else {
      result = await desktopPrompt(input);
    }
    // The exclamation mark tells TypeScript that we are sure output will not be null.
    return result.output!;
  }
);
