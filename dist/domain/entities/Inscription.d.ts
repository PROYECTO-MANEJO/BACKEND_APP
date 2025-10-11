/**
 * Inscription Entity - Domain Layer
 *
 * Representa una inscripción (a evento o curso) con todas sus reglas de negocio
 * y validaciones correspondientes.
 */
export type InscriptionType = "EVENT" | "COURSE";
export type PaymentStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "CANCELADO";
export type PaymentMethod = "TARJETA_CREDITO" | "TRANFERENCIA" | "DEPOSITO";
export interface InscriptionData {
    id?: string;
    userId: string;
    targetId: string;
    inscriptionType: InscriptionType;
    inscriptionDate?: Date;
    amount?: number | null;
    paymentMethod?: PaymentMethod | null;
    paymentOrderLink?: string | null;
    paymentStatus?: PaymentStatus;
    approvedBy?: string | null;
    approvalDate?: Date | null;
    paymentProofPdf?: Buffer | null;
    proofFilename?: string | null;
    proofSize?: number | null;
    proofUploadDate?: Date | null;
    motivationLetter?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    user?: any;
    event?: any;
    course?: any;
}
export declare class Inscription {
    private _id?;
    private _userId;
    private _targetId;
    private _inscriptionType;
    private _inscriptionDate;
    private _amount?;
    private _paymentMethod?;
    private _paymentOrderLink?;
    private _paymentStatus;
    private _approvedBy?;
    private _approvalDate?;
    private _paymentProofPdf?;
    private _proofFilename?;
    private _proofSize?;
    private _proofUploadDate?;
    private _motivationLetter?;
    private _createdAt;
    private _updatedAt;
    constructor(data: InscriptionData);
    private validateInscriptionData;
    private validatePaymentData;
    private validateDocuments;
    isFree(): boolean;
    isPaid(): boolean;
    isPending(): boolean;
    isApproved(): boolean;
    isRejected(): boolean;
    isCancelled(): boolean;
    canBeCancelled(): boolean;
    canBeApproved(): boolean;
    canBeRejected(): boolean;
    hasPaymentProof(): boolean;
    hasMotivationLetter(): boolean;
    isForEvent(): boolean;
    isForCourse(): boolean;
    approve(approverUserId: string): void;
    reject(): void;
    cancel(): void;
    updatePaymentProof(pdfBuffer: Buffer, filename: string): void;
    updateMotivationLetter(letter: string): void;
    setPaymentMethod(method: PaymentMethod): void;
    get id(): string | undefined;
    get userId(): string;
    get targetId(): string;
    get inscriptionType(): InscriptionType;
    get inscriptionDate(): Date;
    get amount(): number | null;
    get paymentMethod(): PaymentMethod | null;
    get paymentOrderLink(): string | null;
    get paymentStatus(): PaymentStatus;
    get approvedBy(): string | null;
    get approvalDate(): Date | null;
    get paymentProofPdf(): Buffer | null;
    get proofFilename(): string | null;
    get proofSize(): number | null;
    get proofUploadDate(): Date | null;
    get motivationLetter(): string | null;
    get createdAt(): Date;
    get updatedAt(): Date;
    toPlainObject(): InscriptionData;
    toPublicObject(): Omit<InscriptionData, "paymentProofPdf">;
}
//# sourceMappingURL=Inscription.d.ts.map