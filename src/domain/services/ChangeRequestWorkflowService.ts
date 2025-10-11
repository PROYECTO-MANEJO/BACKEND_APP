import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { Developer } from "@domain/entities/Developer";

export interface StatusTransitionRule {
  from: string;
  to: string;
  requiredRole: string[];
  conditions?: (request: ChangeRequest) => boolean;
}

export class ChangeRequestWorkflowService {
  private readonly statusTransitionRules: StatusTransitionRule[] = [
    // Usuario puede enviar borrador
    {
      from: "BORRADOR",
      to: "PENDIENTE",
      requiredRole: ["USER", "ADMINISTRADOR", "MASTER"],
    },

    // Administrador/Master puede aprobar/rechazar
    {
      from: "PENDIENTE",
      to: "EN_REVISION",
      requiredRole: ["ADMINISTRADOR", "MASTER"],
    },
    {
      from: "PENDIENTE",
      to: "RECHAZADA",
      requiredRole: ["ADMINISTRADOR", "MASTER"],
    },

    // En revisión puede ir a aprobada, rechazada o esperando información
    {
      from: "EN_REVISION",
      to: "APROBADA",
      requiredRole: ["ADMINISTRADOR", "MASTER"],
      conditions: (request) => !!request.id // Debe tener ID válido
    },
    {
      from: "EN_REVISION",
      to: "RECHAZADA",
      requiredRole: ["ADMINISTRADOR", "MASTER"],
    },
    {
      from: "EN_REVISION",
      to: "ESPERANDO_INFORMACION",
      requiredRole: ["ADMINISTRADOR", "MASTER"],
    },

    // Esperando información puede volver a revisión
    {
      from: "ESPERANDO_INFORMACION",
      to: "EN_REVISION",
      requiredRole: ["USER", "ADMINISTRADOR", "MASTER"],
    },

    // Aprobada puede ir a desarrollo o cancelarse
    {
      from: "APROBADA",
      to: "EN_DESARROLLO",
      requiredRole: ["DESARROLLADOR", "ADMINISTRADOR", "MASTER"],
    },
    {
      from: "APROBADA",
      to: "CANCELADA",
      requiredRole: ["ADMINISTRADOR", "MASTER"],
    },

    // En desarrollo puede ir a testing, pausa o cancelarse
    {
      from: "EN_DESARROLLO",
      to: "EN_TESTING",
      requiredRole: ["DESARROLLADOR", "ADMINISTRADOR", "MASTER"],
    },
    {
      from: "EN_DESARROLLO",
      to: "EN_PAUSA",
      requiredRole: ["DESARROLLADOR", "ADMINISTRADOR", "MASTER"],
    },
    {
      from: "EN_DESARROLLO",
      to: "CANCELADA",
      requiredRole: ["ADMINISTRADOR", "MASTER"],
    },

    // En testing puede completarse o volver a desarrollo
    {
      from: "EN_TESTING",
      to: "COMPLETADA",
      requiredRole: ["DESARROLLADOR", "ADMINISTRADOR", "MASTER"],
    },
    {
      from: "EN_TESTING",
      to: "EN_DESARROLLO",
      requiredRole: ["DESARROLLADOR", "ADMINISTRADOR", "MASTER"],
    },

    // En pausa puede volver a desarrollo o cancelarse
    {
      from: "EN_PAUSA",
      to: "EN_DESARROLLO",
      requiredRole: ["DESARROLLADOR", "ADMINISTRADOR", "MASTER"],
    },
    {
      from: "EN_PAUSA",
      to: "CANCELADA",
      requiredRole: ["ADMINISTRADOR", "MASTER"],
    },

    // Completada puede cerrarse
    {
      from: "COMPLETADA",
      to: "CERRADA",
      requiredRole: ["ADMINISTRADOR", "MASTER"],
    },

    // Rechazada puede reenviarse
    {
      from: "RECHAZADA",
      to: "PENDIENTE",
      requiredRole: ["USER", "ADMINISTRADOR", "MASTER"],
    },
  ];

  /**
   * Validar si una transición de estado es permitida
   */
  public validateStatusTransition(
    currentStatus: string,
    newStatus: string,
    userRole: string,
    request?: ChangeRequest
  ): { isValid: boolean; reason?: string } {
    const rule = this.statusTransitionRules.find(
      (rule) => rule.from === currentStatus && rule.to === newStatus
    );

    if (!rule) {
      return {
        isValid: false,
        reason: `Transición no permitida de ${currentStatus} a ${newStatus}`,
      };
    }

    if (!rule.requiredRole.includes(userRole)) {
      return {
        isValid: false,
        reason: `Rol ${userRole} no autorizado para esta transición`,
      };
    }

    if (rule.conditions && request && !rule.conditions(request)) {
      return {
        isValid: false,
        reason: "No se cumplen las condiciones necesarias para la transición",
      };
    }

    return { isValid: true };
  }

  /**
   * Obtener los estados válidos desde un estado actual
   */
  public getValidNextStates(currentStatus: string, userRole: string): string[] {
    return this.statusTransitionRules
      .filter(
        (rule) =>
          rule.from === currentStatus && rule.requiredRole.includes(userRole)
      )
      .map((rule) => rule.to);
  }

  /**
   * Calcular la prioridad efectiva de una solicitud
   */
  public calculateEffectivePriority(request: ChangeRequest): number {
    const priorityWeights = {
      BAJA: 1,
      MEDIA: 2,
      ALTA: 3,
      CRITICA: 4,
    };

    const urgencyWeights = {
      NORMAL: 1,
      URGENTE: 2,
      INMEDIATA: 3,
    };

    const summary = request.getSummary();

    const baseScore =
      (priorityWeights[summary.priority as keyof typeof priorityWeights] || 2) *
      (urgencyWeights[summary.urgency as keyof typeof urgencyWeights] || 1);

    // Penalizar solicitudes que llevan mucho tiempo
    const daysSinceCreated = request.getDaysFromRequest();

    const ageMultiplier = daysSinceCreated > 7 ? 1.5 : 1;

    return baseScore * ageMultiplier;
  }

  /**
   * Recomendar desarrollador para una solicitud
   */
  public recommendDeveloper(
    request: ChangeRequest,
    availableDevelopers: Developer[]
  ): Developer | null {
    if (availableDevelopers.length === 0) {
      return null;
    }

    // Filtrar desarrolladores disponibles
    const eligibleDevelopers = availableDevelopers.filter((dev) =>
      dev.canTakeNewRequest()
    );

    if (eligibleDevelopers.length === 0) {
      return null;
    }

    // Ordenar por carga de trabajo (menos carga primero)
    const sortedDevelopers = eligibleDevelopers.sort((a, b) => {
      const workloadDiff = a.getCurrentWorkload() - b.getCurrentWorkload();
      if (workloadDiff !== 0) return workloadDiff;

      // En caso de empate, preferir quien tenga GitHub configurado
      const aHasGithub = a.hasGithubIntegration() ? 1 : 0;
      const bHasGithub = b.hasGithubIntegration() ? 1 : 0;
      return bHasGithub - aHasGithub;
    });

    return sortedDevelopers[0] || null;
  }

  /**
   * Validar si los planes técnicos están completos
   */
  public validateTechnicalPlans(request: ChangeRequest): {
    isValid: boolean;
    missingPlans: string[];
  } {
    const summary = request.getSummary();
    const missingPlans: string[] = [];

    // Verificar que tiene descripción técnica detallada
    if (!request.description || request.description.trim().length < 50) {
      missingPlans.push('Descripción técnica detallada');
    }

    // Para cambios de alta prioridad o críticos, requiere más detalles
    if (summary.priority === "ALTA" || summary.priority === "CRITICA") {
      if (request.description.length < 200) {
        missingPlans.push('Descripción extendida para alta prioridad');
      }
    }

    return {
      isValid: missingPlans.length === 0,
      missingPlans,
    };
  }

  /**
   * Calcular tiempo estimado de resolución
   */
  public estimateResolutionTime(request: ChangeRequest): {
    estimatedDays: number;
    confidence: "LOW" | "MEDIUM" | "HIGH";
  } {
    const summary = request.getSummary();
    let baseDays = 5; // Default

    // Ajustar por tipo de cambio
    const typeMultipliers = {
      'FUNCIONALIDAD': 1.5,
      'CORRECCION': 0.8,
      'MEJORA': 1.2,
      'CONFIGURACION': 0.5,
      'SEGURIDAD': 1.3,
      'RENDIMIENTO': 1.4,
      'DOCUMENTACION': 0.6
    };

    baseDays *= typeMultipliers[summary.type as keyof typeof typeMultipliers] || 1;

    // Ajustar por prioridad
    const priorityMultipliers = {
      'BAJA': 1.2,
      'MEDIA': 1.0,
      'ALTA': 0.8,
      'CRITICA': 0.6
    };

    baseDays *= priorityMultipliers[summary.priority as keyof typeof priorityMultipliers] || 1;

    // Determinar confianza basada en la complejidad estimada
    let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    
    if (request.description.length > 1000 || summary.type === 'FUNCIONALIDAD') {
      confidence = 'LOW';
    } else if (summary.type === 'CORRECCION' || summary.type === 'CONFIGURACION') {
      confidence = 'HIGH';
    }

    return {
      estimatedDays: Math.ceil(baseDays),
      confidence,
    };
  }

  /**
   * Verificar si una solicitud puede ser auto-aprobada
   */
  public canAutoApprove(request: ChangeRequest): boolean {
    const summary = request.getSummary();
    
    return summary.type === 'CORRECCION' && 
           summary.priority === 'BAJA' &&
           summary.urgency === 'NORMAL' &&
           request.description.length < 200;
  }
}
