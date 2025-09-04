'use server';

/**
 * @fileOverview Generates a title for a poem based on the poem's content.
 *
 * - generateTitle - A function that generates a title for a poem.
 * - GenerateTitleInput - The input type for the generateTitle function.
 * - GenerateTitleOutput - The return type for the generateTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTitleInputSchema = z.object({
  poem: z.string().describe('The poem to generate a title for.'),
});
export type GenerateTitleInput = z.infer<typeof GenerateTitleInputSchema>;

const GenerateTitleOutputSchema = z.object({
  title: z.string().describe('The generated title for the poem.'),
});
export type GenerateTitleOutput = z.infer<typeof GenerateTitleOutputSchema>;

export async function generateTitle(input: GenerateTitleInput): Promise<GenerateTitleOutput> {
  return generateTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTitlePrompt',
  input: {schema: GenerateTitleInputSchema},
  output: {schema: GenerateTitleOutputSchema},
  prompt: `You are a creative title generator. Given a poem, you will generate a title that reflects the theme and content of the poem.

Poem: {{{poem}}}

Title:`,
});

const generateTitleFlow = ai.defineFlow(
  {
    name: 'generateTitleFlow',
    inputSchema: GenerateTitleInputSchema,
    outputSchema: GenerateTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
