/**
 * Inscription Management Service - Domain Layer
 *
 * Servicio de dominio que maneja la lógica de negocio compleja
 * para la gestión de inscripciones a eventos y cursos.
 */

import {
  Inscription,
  InscriptionData,
  InscriptionType,
  PaymentMethod,
} from "../entities/Inscription";

export interface IInscriptionRepository {
  // CRUD básico
  create(inscription: Inscription): Promise<Inscription>;
  findById(id: string): Promise<Inscription | null>;
  findAll(): Promise<Inscription[]>;
  update(id: string, inscription: Inscription): Promise<Inscription>;
  delete(id: string): Promise<void>;

  // Consultas especializadas
  findByUser(userId: string): Promise<Inscription[]>;
  findByTarget(targetId: string, type: InscriptionType): Promise<Inscription[]>;
  findByUserAndTarget(
    userId: string,
    targetId: string,
    type: InscriptionType
  ): Promise<Inscription | null>;
  findByPaymentStatus(status: string): Promise<Inscription[]>;
  findPendingApprovals(): Promise<Inscription[]>;

  // Consultas de capacidad
  countActiveByTarget(targetId: string, type: InscriptionType): Promise<number>;

  // Filtros avanzados
  findWithFilters(filters: {
    userId?: string;
    targetId?: string;
    type?: InscriptionType;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Inscription[]>;
}

export interface IEventRepository {
  findById(id: string): Promise<any | null>;
  hasAvailableCapacity(eventId: string): Promise<boolean>;
}

export interface ICourseRepository {
  findById(id: string): Promise<any | null>;
  hasAvailableCapacity(courseId: string): Promise<boolean>;
}

export interface IUserRepository {
  findById(id: string): Promise<any | null>;
  exists(id: string): Promise<boolean>;
}

export class InscriptionManagementService {
  constructor(
    private inscriptionRepository: IInscriptionRepository,
    private eventRepository: IEventRepository,
    private courseRepository: ICourseRepository,
    private userRepository: IUserRepository
  ) {}

  /**
   * ✅ INSCRIBIR USUARIO A EVENTO
   */
  async enrollInEvent(data: {
    userId: string;
    eventId: string;
    paymentMethod?: PaymentMethod;
    motivationLetter?: string;
    paymentProofBuffer?: Buffer;
    paymentProofFilename?: string;
  }): Promise<Inscription> {
    // 1. Validar que el usuario existe y tiene documentos verificados
    await this.validateUserEligibility(data.userId);

    // 2. Validar que el evento existe
    const event = await this.eventRepository.findById(data.eventId);
    if (!event) {
      throw new Error("Evento no encontrado");
    }

    // 3. Verificar si ya está inscrito
    const existingInscription =
      await this.inscriptionRepository.findByUserAndTarget(
        data.userId,
        data.eventId,
        "EVENT"
      );

    if (existingInscription) {
      throw new Error("Ya estás inscrito en este evento");
    }

    // 4. Verificar capacidad disponible
    const hasCapacity = await this.eventRepository.hasAvailableCapacity(
      data.eventId
    );
    if (!hasCapacity) {
      throw new Error("El evento ha alcanzado su capacidad máxima");
    }

    // 5. Validar carta de motivación si es requerida
    if (event.requiere_carta_motivacion && !data.motivationLetter) {
      throw new Error("Este evento requiere una carta de motivación");
    }

    // 6. Preparar datos de inscripción
    const inscriptionData: InscriptionData = {
      userId: data.userId,
      targetId: data.eventId,
      inscriptionType: "EVENT",
      motivationLetter: data.motivationLetter,
    };

    if (event.es_gratuito) {
      // Evento gratuito - aprobación automática
      if (data.paymentMethod || data.paymentProofBuffer) {
        throw new Error(
          "Este evento es gratuito, no debe incluir información de pago"
        );
      }
      inscriptionData.paymentStatus = "APROBADO";
      inscriptionData.approvalDate = new Date();
    } else {
      // Evento pagado
      if (!data.paymentMethod) {
        throw new Error(
          "Para eventos pagados, el método de pago es obligatorio"
        );
      }

      if (!data.paymentProofBuffer || !data.paymentProofFilename) {
        throw new Error(
          "Para eventos pagados, el comprobante de pago es obligatorio"
        );
      }

      inscriptionData.amount = parseFloat(event.precio?.toString() || "0");
      inscriptionData.paymentMethod = data.paymentMethod;
      inscriptionData.paymentProofPdf = data.paymentProofBuffer;
      inscriptionData.proofFilename = data.paymentProofFilename;
      inscriptionData.proofSize = data.paymentProofBuffer.length;
      inscriptionData.proofUploadDate = new Date();
      inscriptionData.paymentStatus = "PENDIENTE";
    }

    // 7. Crear la inscripción
    const inscription = new Inscription(inscriptionData);
    return await this.inscriptionRepository.create(inscription);
  }

  /**
   * ✅ INSCRIBIR USUARIO A CURSO
   */
  async enrollInCourse(data: {
    userId: string;
    courseId: string;
    paymentMethod?: PaymentMethod;
    motivationLetter?: string;
    paymentProofBuffer?: Buffer;
    paymentProofFilename?: string;
  }): Promise<Inscription> {
    // 1. Validar que el usuario existe y tiene documentos verificados
    await this.validateUserEligibility(data.userId);

    // 2. Validar que el curso existe
    const course = await this.courseRepository.findById(data.courseId);
    if (!course) {
      throw new Error("Curso no encontrado");
    }

    // 3. Verificar si ya está inscrito
    const existingInscription =
      await this.inscriptionRepository.findByUserAndTarget(
        data.userId,
        data.courseId,
        "COURSE"
      );

    if (existingInscription) {
      throw new Error("Ya estás inscrito en este curso");
    }

    // 4. Verificar capacidad disponible
    const hasCapacity = await this.courseRepository.hasAvailableCapacity(
      data.courseId
    );
    if (!hasCapacity) {
      throw new Error("El curso ha alcanzado su capacidad máxima");
    }

    // 5. Validar carta de motivación si es requerida
    if (course.requiere_carta_motivacion && !data.motivationLetter) {
      throw new Error("Este curso requiere una carta de motivación");
    }

    // 6. Preparar datos de inscripción
    const inscriptionData: InscriptionData = {
      userId: data.userId,
      targetId: data.courseId,
      inscriptionType: "COURSE",
      motivationLetter: data.motivationLetter,
    };

    if (course.es_gratuito) {
      // Curso gratuito - aprobación automática
      if (data.paymentMethod || data.paymentProofBuffer) {
        throw new Error(
          "Este curso es gratuito, no debe incluir información de pago"
        );
      }
      inscriptionData.paymentStatus = "APROBADO";
      inscriptionData.approvalDate = new Date();
    } else {
      // Curso pagado
      if (!data.paymentMethod) {
        throw new Error(
          "Para cursos pagados, el método de pago es obligatorio"
        );
      }

      if (!data.paymentProofBuffer || !data.paymentProofFilename) {
        throw new Error(
          "Para cursos pagados, el comprobante de pago es obligatorio"
        );
      }

      inscriptionData.amount = parseFloat(course.precio?.toString() || "0");
      inscriptionData.paymentMethod = data.paymentMethod;
      inscriptionData.paymentProofPdf = data.paymentProofBuffer;
      inscriptionData.proofFilename = data.paymentProofFilename;
      inscriptionData.proofSize = data.paymentProofBuffer.length;
      inscriptionData.proofUploadDate = new Date();
      inscriptionData.paymentStatus = "PENDIENTE";
    }

    // 7. Crear la inscripción
    const inscription = new Inscription(inscriptionData);
    return await this.inscriptionRepository.create(inscription);
  }

  /**
   * ✅ APROBAR INSCRIPCIÓN
   */
  async approveInscription(
    inscriptionId: string,
    approverUserId: string
  ): Promise<Inscription> {
    // 1. Obtener inscripción
    const inscription = await this.inscriptionRepository.findById(
      inscriptionId
    );
    if (!inscription) {
      throw new Error("Inscripción no encontrada");
    }

    // 2. Validar que el aprobador existe
    const approverExists = await this.userRepository.exists(approverUserId);
    if (!approverExists) {
      throw new Error("Usuario aprobador no encontrado");
    }

    // 3. Verificar capacidad disponible antes de aprobar
    let hasCapacity: boolean;
    if (inscription.isForEvent()) {
      hasCapacity = await this.eventRepository.hasAvailableCapacity(
        inscription.targetId
      );
    } else {
      hasCapacity = await this.courseRepository.hasAvailableCapacity(
        inscription.targetId
      );
    }

    if (!hasCapacity) {
      throw new Error(
        "No hay capacidad disponible para aprobar esta inscripción"
      );
    }

    // 4. Aprobar inscripción
    inscription.approve(approverUserId);

    // 5. Guardar cambios
    return await this.inscriptionRepository.update(inscriptionId, inscription);
  }

  /**
   * ✅ RECHAZAR INSCRIPCIÓN
   */
  async rejectInscription(inscriptionId: string): Promise<Inscription> {
    // 1. Obtener inscripción
    const inscription = await this.inscriptionRepository.findById(
      inscriptionId
    );
    if (!inscription) {
      throw new Error("Inscripción no encontrada");
    }

    // 2. Rechazar inscripción
    inscription.reject();

    // 3. Guardar cambios
    return await this.inscriptionRepository.update(inscriptionId, inscription);
  }

  /**
   * ✅ CANCELAR INSCRIPCIÓN
   */
  async cancelInscription(
    inscriptionId: string,
    userId: string
  ): Promise<Inscription> {
    // 1. Obtener inscripción
    const inscription = await this.inscriptionRepository.findById(
      inscriptionId
    );
    if (!inscription) {
      throw new Error("Inscripción no encontrada");
    }

    // 2. Verificar que el usuario es el dueño de la inscripción
    if (inscription.userId !== userId) {
      throw new Error("Solo puedes cancelar tus propias inscripciones");
    }

    // 3. Cancelar inscripción
    inscription.cancel();

    // 4. Guardar cambios
    return await this.inscriptionRepository.update(inscriptionId, inscription);
  }

  /**
   * ✅ ACTUALIZAR COMPROBANTE DE PAGO
   */
  async updatePaymentProof(
    inscriptionId: string,
    userId: string,
    pdfBuffer: Buffer,
    filename: string
  ): Promise<Inscription> {
    // 1. Obtener inscripción
    const inscription = await this.inscriptionRepository.findById(
      inscriptionId
    );
    if (!inscription) {
      throw new Error("Inscripción no encontrada");
    }

    // 2. Verificar que el usuario es el dueño
    if (inscription.userId !== userId) {
      throw new Error("Solo puedes actualizar tus propias inscripciones");
    }

    // 3. Verificar que la inscripción permite actualizar el comprobante
    if (!inscription.isPending()) {
      throw new Error(
        "Solo se puede actualizar el comprobante de inscripciones pendientes"
      );
    }

    // 4. Actualizar comprobante
    inscription.updatePaymentProof(pdfBuffer, filename);

    // 5. Guardar cambios
    return await this.inscriptionRepository.update(inscriptionId, inscription);
  }

  /**
   * ✅ OBTENER INSCRIPCIONES DEL USUARIO
   */
  async getUserInscriptions(
    userId: string,
    filters?: {
      type?: InscriptionType;
      status?: string;
    }
  ): Promise<Inscription[]> {
    // 1. Validar que el usuario existe
    const userExists = await this.userRepository.exists(userId);
    if (!userExists) {
      throw new Error("Usuario no encontrado");
    }

    // 2. Obtener inscripciones
    let inscriptions = await this.inscriptionRepository.findByUser(userId);

    // 3. Aplicar filtros si se especifican
    if (filters?.type) {
      inscriptions = inscriptions.filter(
        (ins) => ins.inscriptionType === filters.type
      );
    }

    if (filters?.status) {
      inscriptions = inscriptions.filter(
        (ins) => ins.paymentStatus === filters.status
      );
    }

    return inscriptions;
  }

  /**
   * ✅ OBTENER INSCRIPCIONES PENDIENTES DE APROBACIÓN
   */
  async getPendingInscriptions(): Promise<Inscription[]> {
    return await this.inscriptionRepository.findPendingApprovals();
  }

  /**
   * ✅ OBTENER ESTADÍSTICAS DE INSCRIPCIONES
   */
  async getInscriptionStatistics(
    targetId: string,
    type: InscriptionType
  ): Promise<{
    totalInscriptions: number;
    approvedInscriptions: number;
    pendingInscriptions: number;
    rejectedInscriptions: number;
    cancelledInscriptions: number;
  }> {
    const inscriptions = await this.inscriptionRepository.findByTarget(
      targetId,
      type
    );

    return {
      totalInscriptions: inscriptions.length,
      approvedInscriptions: inscriptions.filter((ins) => ins.isApproved())
        .length,
      pendingInscriptions: inscriptions.filter((ins) => ins.isPending()).length,
      rejectedInscriptions: inscriptions.filter((ins) => ins.isRejected())
        .length,
      cancelledInscriptions: inscriptions.filter((ins) => ins.isCancelled())
        .length,
    };
  }

  /**
   * ✅ VERIFICAR ELEGIBILIDAD PARA INSCRIPCIÓN
   */
  async checkEnrollmentEligibility(
    userId: string,
    targetId: string,
    type: InscriptionType
  ): Promise<{ eligible: boolean; reason?: string }> {
    try {
      // 1. Validar usuario
      await this.validateUserEligibility(userId);

      // 2. Verificar si ya está inscrito
      const existingInscription =
        await this.inscriptionRepository.findByUserAndTarget(
          userId,
          targetId,
          type
        );

      if (existingInscription) {
        return { eligible: false, reason: "Ya estás inscrito" };
      }

      // 3. Verificar capacidad disponible
      let hasCapacity: boolean;
      if (type === "EVENT") {
        hasCapacity = await this.eventRepository.hasAvailableCapacity(targetId);
      } else {
        hasCapacity = await this.courseRepository.hasAvailableCapacity(
          targetId
        );
      }

      if (!hasCapacity) {
        return { eligible: false, reason: "Capacidad máxima alcanzada" };
      }

      return { eligible: true };
    } catch (error) {
      return {
        eligible: false,
        reason: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * ✅ VALIDACIONES AUXILIARES
   */
  private async validateUserEligibility(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar documentos verificados
    if (!user.documentos_verificados) {
      throw new Error(
        "Debes tener tus documentos verificados por un administrador antes de poder inscribirte"
      );
    }

    // Verificar documentos subidos
    const isEstudiante = user.cuentas?.[0]?.rol_cue === "ESTUDIANTE";
    const tieneDocumentosCompletos = isEstudiante
      ? !!user.enl_ced_pdf && !!user.enl_mat_pdf
      : !!user.enl_ced_pdf;

    if (!tieneDocumentosCompletos) {
      throw new Error(
        "Debes subir todos los documentos requeridos antes de poder inscribirte"
      );
    }
  }

  /**
   * ✅ VALIDAR ARCHIVO PDF
   */
  public static validatePdfFile(buffer: Buffer, filename: string): void {
    if (!buffer || buffer.length === 0) {
      throw new Error("El archivo PDF es obligatorio");
    }

    if (!filename?.trim()) {
      throw new Error("El nombre del archivo es obligatorio");
    }

    if (buffer.length > 10 * 1024 * 1024) {
      // 10MB
      throw new Error("El archivo PDF no puede superar los 10MB");
    }

    // Validación básica del tipo de archivo por extensión
    if (!filename.toLowerCase().endsWith(".pdf")) {
      throw new Error("El archivo debe ser un PDF válido");
    }
  }
}
