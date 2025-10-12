import { ChangeRequest } from "@domain/entities/ChangeRequest";
import { Developer } from "@domain/entities/Developer";
export interface StatusTransitionRule {
    from: string;
    to: string;
    requiredRole: string[];
    conditions?: (request: ChangeRequest) => boolean;
}
export declare class ChangeRequestWorkflowService {
    private readonly statusTransitionRules;
    /**
     * Validar si una transición de estado es permitida
     */
    validateStatusTransition(currentStatus: string, newStatus: string, userRole: string, request?: ChangeRequest): {
        isValid: boolean;
        reason?: string;
    };
    /**
     * Obtener los estados válidos desde un estado actual
     */
    getValidNextStates(currentStatus: string, userRole: string): string[];
    /**
     * Calcular la prioridad efectiva de una solicitud
     */
    calculateEffectivePriority(request: ChangeRequest): number;
    /**
     * Recomendar desarrollador para una solicitud
     */
    recommendDeveloper(request: ChangeRequest, availableDevelopers: Developer[]): Developer | null;
    /**
     * Validar si los planes técnicos están completos
     */
    validateTechnicalPlans(request: ChangeRequest): {
        isValid: boolean;
        missingPlans: string[];
    };
    /**
     * Calcular tiempo estimado de resolución
     */
    estimateResolutionTime(request: ChangeRequest): {
        estimatedDays: number;
        confidence: "LOW" | "MEDIUM" | "HIGH";
    };
    /**
     * Verificar si una solicitud puede ser auto-aprobada
     */
    canAutoApprove(request: ChangeRequest): boolean;
}
//# sourceMappingURL=ChangeRequestWorkflowService.d.ts.map