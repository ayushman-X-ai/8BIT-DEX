'use server';
/**
 * @fileOverview An AI flow to identify a Pokémon from an image using the Gemini API.
 * This file contains two separate flows for desktop and mobile to handle
 * different API keys securely.
 *
 * - identifyPokemon - A router function that calls the appropriate flow based on device type.
 * - IdentifyPokemonInput - The input type for the identification flows.
 * - IdentifyPokemonOutput - The return type for the identification flows.
 */

import { z } from 'genkit';
import { ai as defaultAi } from '@/ai/genkit';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This is the primary AI instance, using the default GOOGLE_API_KEY.
// It's used for all non-mobile requests.
const desktopScannerAi = defaultAi;

// A separate AI instance for the mobile scanner, configured with a dedicated,
// more permissive API key to isolate its usage.
const mobileScannerAi = genkit({
  plugins: [googleAI({ apiKey: process.env.SCANNER_API_KEY })],
  model: 'googleai/gemini-2.0-flash',
});

const IdentifyPokemonInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing a Pokémon, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  isMobile: z.boolean().describe('A flag indicating if the request is from a mobile device.')
});
export type IdentifyPokemonInput = z.infer<typeof IdentifyPokemonInputSchema>;

// The input for the internal flows doesn't need the `isMobile` flag.
const InternalIdentifyPokemonInputSchema = IdentifyPokemonInputSchema.omit({ isMobile: true });
type InternalIdentifyPokemonInput = z.infer<typeof InternalIdentifyPokemonInputSchema>;

const IdentifyPokemonOutputSchema = z.object({
  pokemonName: z.string().describe('The name of the Pokémon identified in the image in lowercase, or an empty string if no Pokémon is found or it cannot be identified.'),
});
export type IdentifyPokemonOutput = z.infer<typeof IdentifyPokemonOutputSchema>;

/**
 * Main exported function. It acts as a router, invoking the correct
 * flow based on whether the request is from a mobile device.
 */
export async function identifyPokemon(input: IdentifyPokemonInput): Promise<IdentifyPokemonOutput> {
  const { isMobile, ...rest } = input;
  if (isMobile) {
    return identifyPokemonMobileFlow(rest);
  }
  return identifyPokemonDesktopFlow(rest);
}

// Define a reusable prompt configuration.
const promptConfig = {
    input: { schema: InternalIdentifyPokemonInputSchema },
    output: { schema: IdentifyPokemonOutputSchema },
    prompt: `You are a Pokémon expert. Your task is to identify the Pokémon in the provided image.

Respond with only the common English name of the Pokémon in lowercase.

If the image does not contain a Pokémon, or if you cannot confidently identify it, respond with an empty string.

Photo: {{media url=photoDataUri}}`,
};

// Define a prompt for desktop using the default AI instance.
const desktopPrompt = desktopScannerAi.definePrompt({
    name: 'identifyPokemonDesktopPrompt',
    ...promptConfig,
});

// Define a prompt for mobile using the dedicated scanner AI instance.
const mobilePrompt = mobileScannerAi.definePrompt({
    name: 'identifyPokemonMobilePrompt',
    ...promptConfig,
});

// Define the flow for desktop devices.
const identifyPokemonDesktopFlow = desktopScannerAi.defineFlow(
  {
    name: 'identifyPokemonDesktopFlow',
    inputSchema: InternalIdentifyPokemonInputSchema,
    outputSchema: IdentifyPokemonOutputSchema,
  },
  async (input) => {
    const result = await desktopPrompt(input);
    return result.output!;
  }
);

// Define the flow for mobile devices.
const identifyPokemonMobileFlow = mobileScannerAi.defineFlow(
  {
    name: 'identifyPokemonMobileFlow',
    inputSchema: InternalIdentifyPokemonInputSchema,
    outputSchema: IdentifyPokemonOutputSchema,
  },
  async (input) => {
    const result = await mobilePrompt(input);
    return result.output!;
  }
);
