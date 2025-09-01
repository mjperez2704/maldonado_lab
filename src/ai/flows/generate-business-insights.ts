'use server';

/**
 * @fileOverview AI-powered tool to provide relevant insights and suggestions about business performance.
 *
 * - generateBusinessInsights - A function that generates business insights and suggestions.
 * - GenerateBusinessInsightsInput - The input type for the generateBusinessInsights function.
 * - GenerateBusinessInsightsOutput - The return type for the generateBusinessInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBusinessInsightsInputSchema = z.object({
  revenue: z.number().describe('Total revenue for the day.'),
  expenses: z.number().describe('Total expenses for the day.'),
  appointments: z
    .number()
    .describe('Number of appointments scheduled for the day.'),
  keyMetrics: z
    .string()
    .describe('Description of key metrics and business goals.'),
});
export type GenerateBusinessInsightsInput = z.infer<
  typeof GenerateBusinessInsightsInputSchema
>;

const GenerateBusinessInsightsOutputSchema = z.object({
  insights: z.string().describe('AI-generated insights about business performance.'),
  suggestions: z
    .string()
    .describe('AI-generated suggestions on what the user should focus on.'),
});
export type GenerateBusinessInsightsOutput = z.infer<
  typeof GenerateBusinessInsightsOutputSchema
>;

export async function generateBusinessInsights(
  input: GenerateBusinessInsightsInput
): Promise<GenerateBusinessInsightsOutput> {
  return generateBusinessInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBusinessInsightsPrompt',
  input: {schema: GenerateBusinessInsightsInputSchema},
  output: {schema: GenerateBusinessInsightsOutputSchema},
  prompt: `You are an AI-powered business advisor. Analyze the following business data for the day and provide relevant insights and suggestions.

Revenue: {{revenue}}
Expenses: {{expenses}}
Appointments: {{appointments}}
Key Metrics and Business Goals: {{keyMetrics}}

Insights:
Suggestions: `,
});

const generateBusinessInsightsFlow = ai.defineFlow(
  {
    name: 'generateBusinessInsightsFlow',
    inputSchema: GenerateBusinessInsightsInputSchema,
    outputSchema: GenerateBusinessInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
