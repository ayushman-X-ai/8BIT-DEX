'use server';
/**
 * @fileOverview A flow to convert text to speech using a robotic-style voice.
 * This flow can handle long text inputs by splitting them into chunks.
 *
 * - textToSpeech - A function that handles the TTS conversion.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

// The TTS API has a limit on input characters. We set a limit here to be safe.
const MAX_CHUNK_SIZE = 4500;

const TextToSpeechOutputSchema = z.object({
  media: z.string().describe("The generated audio as a base64-encoded WAV data URI."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(text: string): Promise<TextToSpeechOutput> {
  // Prevent flow from running with an empty string, which may cause errors.
  if (!text || text.trim() === '') {
    return { media: '' };
  }
  return textToSpeechFlow(text);
}

/**
 * Splits a long string of text into smaller chunks without cutting words in the middle.
 * @param text The text to split.
 * @param maxSize The maximum size of each chunk.
 * @returns An array of text chunks.
 */
function chunkText(text: string, maxSize: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    if (text.length - i <= maxSize) {
      chunks.push(text.substring(i));
      break;
    }

    let chunkEnd = i + maxSize;
    const lastSpace = text.lastIndexOf(' ', chunkEnd);
    
    // If a space is found in the current chunk range, split there to avoid cutting words.
    if (lastSpace > i) {
      chunkEnd = lastSpace;
    }
    
    chunks.push(text.substring(i, chunkEnd));
    i = chunkEnd + 1;
  }
  return chunks;
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string(),
    outputSchema: TextToSpeechOutputSchema,
  },
  async (query) => {
    const textChunks = chunkText(query, MAX_CHUNK_SIZE);
    const audioBuffers: Buffer[] = [];

    for (const chunk of textChunks) {
        if (chunk.trim() === '') continue;

        const result = await ai.generate({
            model: 'googleai/gemini-2.5-flash-preview-tts',
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Algenib' },
                    },
                },
            },
            prompt: chunk,
        });

        const media = result.media;
        const candidate = result.candidates?.[0];

        if (!media) {
            // A chunk might fail (e.g., due to safety filters). We log a warning
            // but continue processing other chunks to provide a partial result.
            console.warn(`TTS generation failed for chunk. Reason: ${candidate?.finishReason || 'Unknown'}. Skipping chunk.`);
            continue;
        }

        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );
        audioBuffers.push(audioBuffer);
    }

    if (audioBuffers.length === 0) {
      throw new Error('TTS failed. No audio could be generated for the provided text.');
    }

    const combinedPcmData = Buffer.concat(audioBuffers);
    const wavBase64 = await toWav(combinedPcmData);

    return {
      media: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
