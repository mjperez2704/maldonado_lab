/**
 * Un tipo genérico para estandarizar las respuestas de las Server Actions.
 * Ayuda a manejar de forma consistente los casos de éxito y error desde el cliente.
 */
export type ServerActionResponse<T = null> = {
  success: boolean;
  data: T | null;
  error: {
    message: string;
    details?: any;
  } | null;
};