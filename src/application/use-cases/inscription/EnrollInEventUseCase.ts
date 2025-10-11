/**
 * EnrollInEventUseCase - Application Layer
 *
 * Caso de uso para inscribir un usuario en un evento.
 */

import {
  InscriptionData,
  PaymentMethod,
} from "../../../domain/entities/Inscription";
import { InscriptionManagementService } from "../../../domain/services/InscriptionManagementService";

export interface EnrollInEventRequest {
  userId: string;
  eventId: string;
  paymentMethod?: PaymentMethod;
  motivationLetter?: string;
  paymentProofBuffer?: Buffer;
  paymentProofFilename?: string;
}

export interface EnrollInEventResponse {
  success: boolean;
  inscription?: InscriptionData;
  message?: string;
  error?: string;
}

export class EnrollInEventUseCase {
  constructor(
    private inscriptionManagementService: InscriptionManagementService
  ) {}

  async execute(request: EnrollInEventRequest): Promise<EnrollInEventResponse> {
    try {
      // Validaciones básicas de entrada
      if (!request.userId?.trim()) {
        return { success: false, error: "El ID del usuario es obligatorio" };
      }

      if (!request.eventId?.trim()) {
        return { success: false, error: "El ID del evento es obligatorio" };
      }

      // Validar archivo PDF si se proporciona
      if (request.paymentProofBuffer && request.paymentProofFilename) {
        try {
          InscriptionManagementService.validatePdfFile(
            request.paymentProofBuffer,
            request.paymentProofFilename
          );
        } catch (validationError) {
          return {
            success: false,
            error:
              validationError instanceof Error
                ? validationError.message
                : "Error en validación de archivo",
          };
        }
      }

      // Ejecutar inscripción
      const inscription = await this.inscriptionManagementService.enrollInEvent(
        {
          userId: request.userId,
          eventId: request.eventId,
          paymentMethod: request.paymentMethod,
          motivationLetter: request.motivationLetter,
          paymentProofBuffer: request.paymentProofBuffer,
          paymentProofFilename: request.paymentProofFilename,
        }
      );

      // Determinar mensaje de respuesta
      const message = inscription.isFree()
        ? "Inscripción gratuita realizada con éxito"
        : "Inscripción enviada. Pendiente de aprobación de pago";

      return {
        success: true,
        inscription: inscription.toPublicObject(),
        message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al inscribir en evento",
      };
    }
  }
}
