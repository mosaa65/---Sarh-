'use server';
/**
 * @fileOverview An AI agent that summarizes monthly financial reports for property owners.
 *
 * - aiFinancialReportSummary - A function that handles the financial report summarization process.
 * - AIFinancialReportSummaryInput - The input type for the aiFinancialReportSummary function.
 * - AIFinancialReportSummaryOutput - The return type for the aiFinancialReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIFinancialReportSummaryInputSchema = z.object({
  financialReportText: z
    .string()
    .describe('The full text content of the monthly financial report.'),
  portfolioContext: z
    .string()
    .optional()
    .describe(
      'Optional additional context about the property portfolio to aid summarization.'
    ),
});
export type AIFinancialReportSummaryInput = z.infer<
  typeof AIFinancialReportSummaryInputSchema
>;

const AIFinancialReportSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise overall summary of the financial report.'),
  keyPerformanceIndicators: z
    .array(
      z.object({
        name: z.string().describe('The name of the KPI (e.g., "Total Revenue").'),
        value: z
          .string()
          .describe('The value of the KPI (e.g., "$15,000" or "95%").'),
        description: z
          .string()
          .optional()
          .describe('A brief explanation or context for the KPI.'),
      })
    )
    .describe('A list of key financial performance indicators.'),
  notableTrends: z
    .array(z.string())
    .describe('A list of significant financial trends observed.'),
  potentialIssues: z
    .array(z.string())
    .describe('A list of potential financial issues or areas of concern.'),
});
export type AIFinancialReportSummaryOutput = z.infer<
  typeof AIFinancialReportSummaryOutputSchema
>;

export async function aiFinancialReportSummary(
  input: AIFinancialReportSummaryInput
): Promise<AIFinancialReportSummaryOutput> {
  return aiFinancialReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiFinancialReportSummaryPrompt',
  input: {schema: AIFinancialReportSummaryInputSchema},
  output: {schema: AIFinancialReportSummaryOutputSchema},
  prompt: `You are an expert financial analyst specializing in property management.
Your task is to analyze the provided monthly financial report and generate a concise summary, highlight key performance indicators (KPIs), identify notable financial trends, and point out any potential issues.

Here is the financial report content:
{{{financialReportText}}}

{{#if portfolioContext}}
Additional context about the property portfolio:
{{{portfolioContext}}}
{{/if}}

Please extract the following:
1.  A general summary of the report.
2.  Key Performance Indicators (KPIs) with their names, values, and a short description.
3.  Any notable financial trends.
4.  Any potential financial issues or areas of concern.

Ensure the output is strictly in the specified JSON format.`,
});

const aiFinancialReportSummaryFlow = ai.defineFlow(
  {
    name: 'aiFinancialReportSummaryFlow',
    inputSchema: AIFinancialReportSummaryInputSchema,
    outputSchema: AIFinancialReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
