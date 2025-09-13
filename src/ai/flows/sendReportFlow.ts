
/**
 * @fileOverview A flow for sending patient reports via email.
 * This is a mock implementation and does not actually send emails.
 */
'use server';

import { getEmailSettings } from '@/services/settingsService';
import { SendEmailReportInput, SendEmailReportOutput } from '@/ai/schemas/reportSchema';


export async function sendEmailReport(input: SendEmailReportInput): Promise<SendEmailReportOutput> {
  const emailSettings = await getEmailSettings();
  const reportTemplate = emailSettings?.report || {
      subject: "Tus resultados de laboratorio están listos",
      body: `Estimado/a {patient_name},

Adjunto encontrarás tus resultados de laboratorio.

Gracias por confiar en nosotros.

Saludos cordiales,
MEGA LABORATORIO`
  };

  const subject = reportTemplate.subject.replace('{patient_name}', input.patientName);
  let body = reportTemplate.body.replace('{patient_name}', input.patientName);
  
  const resultsText = input.results.map(r => `- ${r.studyName}: ${r.result} (Ref: ${r.reference})`).join('\n');
  
  // This is a simplified replacement. A real implementation would be more robust.
  if (body.includes('Adjunto encontrarás tus resultados de laboratorio.')) {
    body = body.replace('Adjunto encontrarás tus resultados de laboratorio.', `Resultados:\n${resultsText}`);
  } else {
    body += `\n\nResultados:\n${resultsText}`;
  }

  // Simulate AI generation time
  await new Promise(res => setTimeout(res, 500));

  const output = { subject, body };

  if (!output) {
    throw new Error("Failed to generate email content.");
  }

  return output;
}
