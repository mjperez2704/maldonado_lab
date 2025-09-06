/**
 * @fileOverview Schemas and types for patient report flows.
 */
import { z } from 'zod';

export const SendEmailReportInputSchema = z.object({
  patientName: z.string().describe("The name of the patient."),
  results: z.array(z.object({
    studyName: z.string(),
    parameterName: z.string(),
    result: z.string(),
    reference: z.string(),
  })).describe("The list of test results for the patient."),
});
export type SendEmailReportInput = z.infer<typeof SendEmailReportInputSchema>;

export const SendEmailReportOutputSchema = z.object({
  subject: z.string().describe("The generated email subject."),
  body: z.string().describe("The generated email body."),
});
export type SendEmailReportOutput = z.infer<typeof SendEmailReportOutputSchema>;
