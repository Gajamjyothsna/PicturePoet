'use server';

import { generatePoem } from '@/ai/flows/generate-poem';
import { generateTitle } from '@/ai/flows/generate-title';
import { z } from 'zod';

const PoemAndTitleInputSchema = z.object({
  photoDataUri: z.string().refine(s => s.startsWith('data:image/'), {
    message: 'Input must be a valid image data URI.'
  }),
  prompt: z.string().optional(),
});

export async function generatePoemAndTitle(input: z.infer<typeof PoemAndTitleInputSchema>) {
  try {
    const validatedInput = PoemAndTitleInputSchema.parse(input);

    const poemData = await generatePoem({ photoDataUri: validatedInput.photoDataUri, prompt: validatedInput.prompt });
    if (!poemData.poem) {
      throw new Error('Poem generation failed.');
    }

    const titleData = await generateTitle({ poem: poemData.poem });
    if (!titleData.title) {
      throw new Error('Title generation failed.');
    }

    return { success: true, poem: poemData.poem, title: titleData.title };
  } catch (error) {
    console.error('Error in generatePoemAndTitle:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during generation.';
    return { success: false, error: message };
  }
}
