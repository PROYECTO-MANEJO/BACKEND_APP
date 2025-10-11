/**
 * Inscription Entity - Domain Layer
 *
 * Representa una inscripción (a evento o curso) con todas sus reglas de negocio
 * y validaciones correspondientes.
 */

export type InscriptionType = "EVENT" | "COURSE";
export type PaymentStatus =
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "CANCELADO";
export type PaymentMethod = "TARJETA_CREDITO" | "TRANFERENCIA" | "DEPOSITO";

export interface InscriptionData {
  // Campos comunes
  id?: string;
  userId: string;
  targetId: string; // ID del evento o curso
  inscriptionType: InscriptionType;
  inscriptionDate?: Date;

  // Campos de pago
  amount?: number | null;
  paymentMethod?: PaymentMethod | null;
  paymentOrderLink?: string | null;
  paymentStatus?: PaymentStatus;
  approvedBy?: string | null;
  approvalDate?: Date | null;

  // Documentos
  paymentProofPdf?: Buffer | null;
  proofFilename?: string | null;
  proofSize?: number | null;
  proofUploadDate?: Date | null;
  motivationLetter?: string | null;

  // Metadatos
  createdAt?: Date;
  updatedAt?: Date;

  // Relaciones opcionales
  user?: any;
  event?: any;
  course?: any;
}

export class Inscription {
  private _id?: string;
  private _userId: string;
  private _targetId: string;
  private _inscriptionType: InscriptionType;
  private _inscriptionDate: Date;

  // Payment related
  private _amount?: number | null;
  private _paymentMethod?: PaymentMethod | null;
  private _paymentOrderLink?: string | null;
  private _paymentStatus: PaymentStatus;
  private _approvedBy?: string | null;
  private _approvalDate?: Date | null;

  // Documents
  private _paymentProofPdf?: Buffer | null;
  private _proofFilename?: string | null;
  private _proofSize?: number | null;
  private _proofUploadDate?: Date | null;
  private _motivationLetter?: string | null;

  // Metadata
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(data: InscriptionData) {
    this.validateInscriptionData(data);

    this._id = data.id;
    this._userId = data.userId;
    this._targetId = data.targetId;
    this._inscriptionType = data.inscriptionType;
    this._inscriptionDate = data.inscriptionDate || new Date();

    this._amount = data.amount;
    this._paymentMethod = data.paymentMethod;
    this._paymentOrderLink = data.paymentOrderLink;
    this._paymentStatus = data.paymentStatus || "PENDIENTE";
    this._approvedBy = data.approvedBy;
    this._approvalDate = data.approvalDate;

    this._paymentProofPdf = data.paymentProofPdf;
    this._proofFilename = data.proofFilename;
    this._proofSize = data.proofSize;
    this._proofUploadDate = data.proofUploadDate;
    this._motivationLetter = data.motivationLetter;

    this._createdAt = data.createdAt || new Date();
    this._updatedAt = data.updatedAt || new Date();
  }

  // ✅ VALIDACIONES DE NEGOCIO
  private validateInscriptionData(data: InscriptionData): void {
    // Validar campos obligatorios
    if (!data.userId?.trim()) {
      throw new Error("El ID del usuario es obligatorio");
    }

    if (!data.targetId?.trim()) {
      throw new Error("El ID del evento/curso es obligatorio");
    }

    if (!data.inscriptionType) {
      throw new Error("El tipo de inscripción es obligatorio");
    }

    // Validar tipo de inscripción
    const validTypes: InscriptionType[] = ["EVENT", "COURSE"];
    if (!validTypes.includes(data.inscriptionType)) {
      throw new Error("Tipo de inscripción debe ser EVENT o COURSE");
    }

    // Validaciones de pago si aplican
    if (data.amount !== undefined && data.amount !== null) {
      this.validatePaymentData(data);
    }

    // Validaciones de documentos
    this.validateDocuments(data);
  }

  private validatePaymentData(data: InscriptionData): void {
    // Si hay monto, debe ser positivo
    if (data.amount! <= 0) {
      throw new Error("El monto del pago debe ser mayor a 0");
    }

    if (data.amount! > 10000000) {
      throw new Error("El monto del pago no puede superar $10,000,000");
    }

    // Validar método de pago si se proporciona
    if (data.paymentMethod) {
      const validMethods: PaymentMethod[] = [
        "TARJETA_CREDITO",
        "TRANFERENCIA",
        "DEPOSITO",
      ];
      if (!validMethods.includes(data.paymentMethod)) {
        throw new Error(
          `Método de pago debe ser uno de: ${validMethods.join(", ")}`
        );
      }
    }

    // Validar estado de pago si se proporciona
    if (data.paymentStatus) {
      const validStatuses: PaymentStatus[] = [
        "PENDIENTE",
        "APROBADO",
        "RECHAZADO",
        "CANCELADO",
      ];
      if (!validStatuses.includes(data.paymentStatus)) {
        throw new Error(
          `Estado de pago debe ser uno de: ${validStatuses.join(", ")}`
        );
      }
    }
  }

  private validateDocuments(data: InscriptionData): void {
    // Validar PDF de comprobante si se proporciona
    if (data.paymentProofPdf) {
      if (!data.proofFilename) {
        throw new Error("El nombre del archivo del comprobante es obligatorio");
      }

      if (!data.proofSize || data.proofSize <= 0) {
        throw new Error("El tamaño del archivo debe ser mayor a 0");
      }

      if (data.proofSize > 10 * 1024 * 1024) {
        // 10MB
        throw new Error("El archivo PDF no puede superar los 10MB");
      }
    }

    // Validar carta de motivación si se proporciona
    if (data.motivationLetter) {
      if (data.motivationLetter.length > 500) {
        throw new Error(
          "La carta de motivación no puede superar los 500 caracteres"
        );
      }

      if (data.motivationLetter.trim().length < 10) {
        throw new Error(
          "La carta de motivación debe tener al menos 10 caracteres"
        );
      }
    }
  }

  // ✅ MÉTODOS DE NEGOCIO
  public isFree(): boolean {
    return this._amount === null || this._amount === 0;
  }

  public isPaid(): boolean {
    return !this.isFree();
  }

  public isPending(): boolean {
    return this._paymentStatus === "PENDIENTE";
  }

  public isApproved(): boolean {
    return this._paymentStatus === "APROBADO";
  }

  public isRejected(): boolean {
    return this._paymentStatus === "RECHAZADO";
  }

  public isCancelled(): boolean {
    return this._paymentStatus === "CANCELADO";
  }

  public canBeCancelled(): boolean {
    return (
      this._paymentStatus === "PENDIENTE" || this._paymentStatus === "APROBADO"
    );
  }

  public canBeApproved(): boolean {
    return (
      this._paymentStatus === "PENDIENTE" &&
      this.isPaid() &&
      this.hasPaymentProof()
    );
  }

  public canBeRejected(): boolean {
    return this._paymentStatus === "PENDIENTE";
  }

  public hasPaymentProof(): boolean {
    return !!this._paymentProofPdf && !!this._proofFilename;
  }

  public hasMotivationLetter(): boolean {
    return !!this._motivationLetter && this._motivationLetter.trim().length > 0;
  }

  public isForEvent(): boolean {
    return this._inscriptionType === "EVENT";
  }

  public isForCourse(): boolean {
    return this._inscriptionType === "COURSE";
  }

  public approve(approverUserId: string): void {
    if (!this.canBeApproved()) {
      throw new Error(
        "La inscripción no puede ser aprobada en su estado actual"
      );
    }

    if (!approverUserId?.trim()) {
      throw new Error("El ID del usuario que aprueba es obligatorio");
    }

    this._paymentStatus = "APROBADO";
    this._approvedBy = approverUserId;
    this._approvalDate = new Date();
    this._updatedAt = new Date();
  }

  public reject(): void {
    if (!this.canBeRejected()) {
      throw new Error(
        "La inscripción no puede ser rechazada en su estado actual"
      );
    }

    this._paymentStatus = "RECHAZADO";
    this._updatedAt = new Date();
  }

  public cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error(
        "La inscripción no puede ser cancelada en su estado actual"
      );
    }

    this._paymentStatus = "CANCELADO";
    this._updatedAt = new Date();
  }

  public updatePaymentProof(pdfBuffer: Buffer, filename: string): void {
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("El archivo PDF es obligatorio");
    }

    if (!filename?.trim()) {
      throw new Error("El nombre del archivo es obligatorio");
    }

    if (pdfBuffer.length > 10 * 1024 * 1024) {
      // 10MB
      throw new Error("El archivo PDF no puede superar los 10MB");
    }

    this._paymentProofPdf = pdfBuffer;
    this._proofFilename = filename;
    this._proofSize = pdfBuffer.length;
    this._proofUploadDate = new Date();
    this._updatedAt = new Date();
  }

  public updateMotivationLetter(letter: string): void {
    if (!letter?.trim()) {
      throw new Error("La carta de motivación no puede estar vacía");
    }

    if (letter.length > 500) {
      throw new Error(
        "La carta de motivación no puede superar los 500 caracteres"
      );
    }

    if (letter.trim().length < 10) {
      throw new Error(
        "La carta de motivación debe tener al menos 10 caracteres"
      );
    }

    this._motivationLetter = letter.trim();
    this._updatedAt = new Date();
  }

  public setPaymentMethod(method: PaymentMethod): void {
    const validMethods: PaymentMethod[] = [
      "TARJETA_CREDITO",
      "TRANFERENCIA",
      "DEPOSITO",
    ];
    if (!validMethods.includes(method)) {
      throw new Error(
        `Método de pago debe ser uno de: ${validMethods.join(", ")}`
      );
    }

    this._paymentMethod = method;
    this._updatedAt = new Date();
  }

  // ✅ GETTERS
  get id(): string | undefined {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get targetId(): string {
    return this._targetId;
  }
  get inscriptionType(): InscriptionType {
    return this._inscriptionType;
  }
  get inscriptionDate(): Date {
    return this._inscriptionDate;
  }
  get amount(): number | null {
    return this._amount || null;
  }
  get paymentMethod(): PaymentMethod | null {
    return this._paymentMethod || null;
  }
  get paymentOrderLink(): string | null {
    return this._paymentOrderLink || null;
  }
  get paymentStatus(): PaymentStatus {
    return this._paymentStatus;
  }
  get approvedBy(): string | null {
    return this._approvedBy || null;
  }
  get approvalDate(): Date | null {
    return this._approvalDate || null;
  }
  get paymentProofPdf(): Buffer | null {
    return this._paymentProofPdf || null;
  }
  get proofFilename(): string | null {
    return this._proofFilename || null;
  }
  get proofSize(): number | null {
    return this._proofSize || null;
  }
  get proofUploadDate(): Date | null {
    return this._proofUploadDate || null;
  }
  get motivationLetter(): string | null {
    return this._motivationLetter || null;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ✅ MÉTODO PARA SERIALIZACIÓN
  public toPlainObject(): InscriptionData {
    return {
      id: this._id,
      userId: this._userId,
      targetId: this._targetId,
      inscriptionType: this._inscriptionType,
      inscriptionDate: this._inscriptionDate,
      amount: this._amount,
      paymentMethod: this._paymentMethod,
      paymentOrderLink: this._paymentOrderLink,
      paymentStatus: this._paymentStatus,
      approvedBy: this._approvedBy,
      approvalDate: this._approvalDate,
      paymentProofPdf: this._paymentProofPdf,
      proofFilename: this._proofFilename,
      proofSize: this._proofSize,
      proofUploadDate: this._proofUploadDate,
      motivationLetter: this._motivationLetter,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // ✅ MÉTODO PARA SERIALIZACIÓN PÚBLICA (sin datos sensibles)
  public toPublicObject(): Omit<InscriptionData, "paymentProofPdf"> {
    const data = this.toPlainObject();
    const { paymentProofPdf, ...publicData } = data;
    return publicData;
  }
}
