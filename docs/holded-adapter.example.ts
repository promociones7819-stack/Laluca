// Ejemplo de contrato para la integración futura con Holded.
// IMPORTANTE: la API key real debe vivir en un backend/Worker, nunca en el navegador.

export interface HoldedService {
  listProjects(): Promise<unknown[]>;
  listTasks(projectId?: string): Promise<unknown[]>;
  listProjectTimes(projectId: string): Promise<unknown[]>;
  createProjectTime(projectId: string, input: {
    duration: number;
    costHour: number;
    userId?: string;
    taskId?: string;
    desc?: string;
  }): Promise<unknown>;
}

// La capa de adaptación deberá transformar la respuesta de Holded al modelo del panel:
// presupuesto -> horas presupuestadas
// registros de tiempo -> horas realizadas
// bloques del panel -> horas reservadas
