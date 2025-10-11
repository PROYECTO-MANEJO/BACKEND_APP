"use strict";
/**
 * Inscription Entity - Domain Layer
 *
 * Representa una inscripción (a evento o curso) con todas sus reglas de negocio
 * y validaciones correspondientes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inscription = void 0;
class Inscription {
    constructor(data) {
        this.validateInscriptionData(data);
        this._id = data.id;
        this._userId = data.userId;
        this._targetId = data.targetId;
        this._inscriptionType = data.inscriptionType;
        this._inscriptionDate = data.inscriptionDate || new Date();
        this._amount = data.amount;
        this._paymentMethod = data.paymentMethod;
        this._paymentOrderLink = data.paymentOrderLink;
        this._paymentStatus = data.paymentStatus || 'PENDIENTE';
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
    validateInscriptionData(data) {
        // Validar campos obligatorios
        if (!data.userId?.trim()) {
            throw new Error('El ID del usuario es obligatorio');
        }
        if (!data.targetId?.trim()) {
            throw new Error('El ID del evento/curso es obligatorio');
        }
        if (!data.inscriptionType) {
            throw new Error('El tipo de inscripción es obligatorio');
        }
        // Validar tipo de inscripción
        const validTypes = ['EVENT', 'COURSE'];
        if (!validTypes.includes(data.inscriptionType)) {
            throw new Error('Tipo de inscripción debe ser EVENT o COURSE');
        }
        // Validaciones de pago si aplican
        if (data.amount !== undefined && data.amount !== null) {
            this.validatePaymentData(data);
        }
        // Validaciones de documentos
        this.validateDocuments(data);
    }
    validatePaymentData(data) {
        // Si hay monto, debe ser positivo
        if (data.amount <= 0) {
            throw new Error('El monto del pago debe ser mayor a 0');
        }
        if (data.amount > 10000000) {
            throw new Error('El monto del pago no puede superar $10,000,000');
        }
        // Validar método de pago si se proporciona
        if (data.paymentMethod) {
            const validMethods = ['TARJETA_CREDITO', 'TRANFERENCIA', 'DEPOSITO'];
            if (!validMethods.includes(data.paymentMethod)) {
                throw new Error(`Método de pago debe ser uno de: ${validMethods.join(', ')}`);
            }
        }
        // Validar estado de pago si se proporciona
        if (data.paymentStatus) {
            const validStatuses = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO'];
            if (!validStatuses.includes(data.paymentStatus)) {
                throw new Error(`Estado de pago debe ser uno de: ${validStatuses.join(', ')}`);
            }
        }
    }
    validateDocuments(data) {
        // Validar PDF de comprobante si se proporciona
        if (data.paymentProofPdf) {
            if (!data.proofFilename) {
                throw new Error('El nombre del archivo del comprobante es obligatorio');
            }
            if (!data.proofSize || data.proofSize <= 0) {
                throw new Error('El tamaño del archivo debe ser mayor a 0');
            }
            if (data.proofSize > 10 * 1024 * 1024) { // 10MB
                throw new Error('El archivo PDF no puede superar los 10MB');
            }
        }
        // Validar carta de motivación si se proporciona
        if (data.motivationLetter) {
            if (data.motivationLetter.length > 500) {
                throw new Error('La carta de motivación no puede superar los 500 caracteres');
            }
            if (data.motivationLetter.trim().length < 10) {
                throw new Error('La carta de motivación debe tener al menos 10 caracteres');
            }
        }
    }
    // ✅ MÉTODOS DE NEGOCIO
    isFree() {
        return this._amount === null || this._amount === 0;
    }
    isPaid() {
        return !this.isFree();
    }
    isPending() {
        return this._paymentStatus === 'PENDIENTE';
    }
    isApproved() {
        return this._paymentStatus === 'APROBADO';
    }
    isRejected() {
        return this._paymentStatus === 'RECHAZADO';
    }
    isCancelled() {
        return this._paymentStatus === 'CANCELADO';
    }
    canBeCancelled() {
        return this._paymentStatus === 'PENDIENTE' || this._paymentStatus === 'APROBADO';
    }
    canBeApproved() {
        return this._paymentStatus === 'PENDIENTE' && this.isPaid() && this.hasPaymentProof();
    }
    canBeRejected() {
        return this._paymentStatus === 'PENDIENTE';
    }
    hasPaymentProof() {
        return !!this._paymentProofPdf && !!this._proofFilename;
    }
    hasMotivationLetter() {
        return !!this._motivationLetter && this._motivationLetter.trim().length > 0;
    }
    isForEvent() {
        return this._inscriptionType === 'EVENT';
    }
    isForCourse() {
        return this._inscriptionType === 'COURSE';
    }
    approve(approverUserId) {
        if (!this.canBeApproved()) {
            throw new Error('La inscripción no puede ser aprobada en su estado actual');
        }
        if (!approverUserId?.trim()) {
            throw new Error('El ID del usuario que aprueba es obligatorio');
        }
        this._paymentStatus = 'APROBADO';
        this._approvedBy = approverUserId;
        this._approvalDate = new Date();
        this._updatedAt = new Date();
    }
    reject() {
        if (!this.canBeRejected()) {
            throw new Error('La inscripción no puede ser rechazada en su estado actual');
        }
        this._paymentStatus = 'RECHAZADO';
        this._updatedAt = new Date();
    }
    cancel() {
        if (!this.canBeCancelled()) {
            throw new Error('La inscripción no puede ser cancelada en su estado actual');
        }
        this._paymentStatus = 'CANCELADO';
        this._updatedAt = new Date();
    }
    updatePaymentProof(pdfBuffer, filename) {
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('El archivo PDF es obligatorio');
        }
        if (!filename?.trim()) {
            throw new Error('El nombre del archivo es obligatorio');
        }
        if (pdfBuffer.length > 10 * 1024 * 1024) { // 10MB
            throw new Error('El archivo PDF no puede superar los 10MB');
        }
        this._paymentProofPdf = pdfBuffer;
        this._proofFilename = filename;
        this._proofSize = pdfBuffer.length;
        this._proofUploadDate = new Date();
        this._updatedAt = new Date();
    }
    updateMotivationLetter(letter) {
        if (!letter?.trim()) {
            throw new Error('La carta de motivación no puede estar vacía');
        }
        if (letter.length > 500) {
            throw new Error('La carta de motivación no puede superar los 500 caracteres');
        }
        if (letter.trim().length < 10) {
            throw new Error('La carta de motivación debe tener al menos 10 caracteres');
        }
        this._motivationLetter = letter.trim();
        this._updatedAt = new Date();
    }
    setPaymentMethod(method) {
        const validMethods = ['TARJETA_CREDITO', 'TRANFERENCIA', 'DEPOSITO'];
        if (!validMethods.includes(method)) {
            throw new Error(`Método de pago debe ser uno de: ${validMethods.join(', ')}`);
        }
        this._paymentMethod = method;
        this._updatedAt = new Date();
    }
    // ✅ GETTERS
    get id() { return this._id; }
    get userId() { return this._userId; }
    get targetId() { return this._targetId; }
    get inscriptionType() { return this._inscriptionType; }
    get inscriptionDate() { return this._inscriptionDate; }
    get amount() { return this._amount || null; }
    get paymentMethod() { return this._paymentMethod || null; }
    get paymentOrderLink() { return this._paymentOrderLink || null; }
    get paymentStatus() { return this._paymentStatus; }
    get approvedBy() { return this._approvedBy || null; }
    get approvalDate() { return this._approvalDate || null; }
    get paymentProofPdf() { return this._paymentProofPdf || null; }
    get proofFilename() { return this._proofFilename || null; }
    get proofSize() { return this._proofSize || null; }
    get proofUploadDate() { return this._proofUploadDate || null; }
    get motivationLetter() { return this._motivationLetter || null; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    // ✅ MÉTODO PARA SERIALIZACIÓN
    toPlainObject() {
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
            updatedAt: this._updatedAt
        };
    }
    // ✅ MÉTODO PARA SERIALIZACIÓN PÚBLICA (sin datos sensibles)
    toPublicObject() {
        const data = this.toPlainObject();
        const { paymentProofPdf, ...publicData } = data;
        return publicData;
    }
}
exports.Inscription = Inscription;
//# sourceMappingURL=Inscription.js.map