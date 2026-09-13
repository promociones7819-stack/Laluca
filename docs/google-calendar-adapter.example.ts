// Ejemplo de contrato para la integración futura con Google Calendar.
// OAuth y refresh tokens deben gestionarse en servidor.

export interface GoogleCalendarService {
  createBlockEvent(blockId: string): Promise<{ googleEventId: string }>;
  updateBlockEvent(blockId: string, googleEventId: string): Promise<void>;
  deleteBlockEvent(googleEventId: string): Promise<void>;
}

// Cada bloque del planning podrá mantener un googleEventId para sincronización bidireccional.
