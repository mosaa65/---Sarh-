'use server';
/**
 * @fileOverview A Genkit flow for generating a comprehensive draft lease agreement.
 *
 * - generateAIPoweredLease - A function that handles the lease agreement generation process.
 * - AIPoweredLeaseGenerationInput - The input type for the generateAIPoweredLease function.
 * - AIPoweredLeaseGenerationOutput - The return type for the generateAIPoweredLease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredLeaseGenerationInputSchema = z.object({
  propertyAddress: z.string().describe('The full address of the property.'),
  propertyType: z
    .string()
    .describe('The type of property (e.g., apartment, commercial unit, house).'),
  landlordName: z.string().describe('The full name of the landlord.'),
  tenantName: z.string().describe('The full name of the tenant.'),
  tenantContact: z
    .string()
    .describe('The tenant\u0027s contact information (email or phone number).'),
  rentalAmount: z.number().describe('The monthly rental amount.'),
  currency: z.string().describe('The currency for the rental amount (e.g., USD, SAR).'),
  paymentFrequency: z
    .string()
    .describe('The frequency of rent payments (e.g., monthly, quarterly, annually).'),
  leaseStartDate: z.string().describe('The start date of the lease in YYYY-MM-DD format.'),
  leaseEndDate: z.string().describe('The end date of the lease in YYYY-MM-DD format.'),
  securityDepositAmount: z.number().describe('The amount of the security deposit.'),
  securityDepositCurrency: z
    .string()
    .describe('The currency for the security deposit amount (e.g., USD, SAR).'),
  petPolicy: z
    .string()
    .describe(
      'Details regarding the pet policy (e.g., \"No pets allowed\", \"Small pets allowed with deposit\").'
    ),
  maintenanceResponsibilities: z
    .string()
    .describe(
      'Details on who is responsible for maintenance (e.g., \"Landlord handles major repairs, tenant handles minor upkeep\").'
    ),
  additionalTerms: z
    .string()
    .optional()
    .describe('Any additional specific terms or clauses to include in the lease.'),
});
export type AIPoweredLeaseGenerationInput = z.infer<
  typeof AIPoweredLeaseGenerationInputSchema
>;

const AIPoweredLeaseGenerationOutputSchema = z.object({
  leaseAgreementText: z.string().describe('The generated comprehensive lease agreement text.'),
});
export type AIPoweredLeaseGenerationOutput = z.infer<
  typeof AIPoweredLeaseGenerationOutputSchema
>;

export async function generateAIPoweredLease(
  input: AIPoweredLeaseGenerationInput
): Promise<AIPoweredLeaseGenerationOutput> {
  return aiPoweredLeaseGenerationFlow(input);
}

const leaseGenerationPrompt = ai.definePrompt({
  name: 'leaseGenerationPrompt',
  input: {schema: AIPoweredLeaseGenerationInputSchema},
  output: {schema: AIPoweredLeaseGenerationOutputSchema},
  prompt: `You are an AI assistant specialized in drafting legal documents, specifically comprehensive lease agreements.
Your task is to generate a detailed and legally sound lease agreement based on the provided property details, tenant information, and desired terms.
Ensure the agreement is clear, covers all essential aspects of a rental contract, and incorporates all the specified details.

Property Details:
- Address: {{{propertyAddress}}}
- Type: {{{propertyType}}}

Landlord Information:
- Name: {{{landlordName}}}

Tenant Information:
- Name: {{{tenantName}}}
- Contact: {{{tenantContact}}}

Lease Terms:
- Rental Amount: {{{rentalAmount}}} {{{currency}}} per {{{paymentFrequency}}}
- Lease Start Date: {{{leaseStartDate}}}
- Lease End Date: {{{leaseEndDate}}}
- Security Deposit: {{{securityDepositAmount}}} {{{securityDepositCurrency}}}
- Pet Policy: {{{petPolicy}}}
- Maintenance Responsibilities: {{{maintenanceResponsibilities}}}

{{#if additionalTerms}}
Additional Terms:
{{{additionalTerms}}}
{{/if}}

Generate the full lease agreement text now, ensuring it is comprehensive and professional.`,
});

const aiPoweredLeaseGenerationFlow = ai.defineFlow(
  {
    name: 'aiPoweredLeaseGenerationFlow',
    inputSchema: AIPoweredLeaseGenerationInputSchema,
    outputSchema: AIPoweredLeaseGenerationOutputSchema,
  },
  async input => {
    const {output} = await leaseGenerationPrompt(input);
    return output!;
  }
);
