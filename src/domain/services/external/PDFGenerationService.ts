/**
 * PDFGenerationService - External Service Interface
 *
 * Interfaz para el servicio de generación de PDFs con firmas digitales.
 */

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
}

export interface DigitalSignature {
  signerName: string;
  signerEmail: string;
  reason: string;
  location: string;
  contactInfo?: string;
  certificatePath?: string;
  privateKeyPath?: string;
}

export interface PDFGenerationOptions {
  template: string;
  data: Record<string, any>;
  metadata?: PDFMetadata;
  digitalSignature?: DigitalSignature;
  watermark?: {
    text: string;
    opacity: number;
    rotation: number;
    fontSize: number;
  };
  security?: {
    userPassword?: string;
    ownerPassword?: string;
    permissions: {
      printing: boolean;
      modifying: boolean;
      copying: boolean;
      annotating: boolean;
      fillingForms: boolean;
    };
  };
}

export interface PDFGenerationResult {
  success: boolean;
  filePath?: string;
  fileBuffer?: Buffer;
  fileSize: number;
  metadata: PDFMetadata;
  verificationCode?: string;
  digitalSignatureInfo?: {
    signed: boolean;
    signerName?: string;
    signedAt?: Date;
    valid?: boolean;
  };
  error?: string;
}

export interface PDFVerificationResult {
  isValid: boolean;
  signatureValid: boolean;
  documentIntact: boolean;
  signerInfo?: {
    name: string;
    email: string;
    signedAt: Date;
    certificateValid: boolean;
  };
  metadata: PDFMetadata;
  error?: string;
}

export interface PDFGenerationService {
  /**
   * Genera un PDF basado en una plantilla y datos
   */
  generatePDF(options: PDFGenerationOptions): Promise<PDFGenerationResult>;

  /**
   * Genera un certificado PDF con firma digital
   */
  generateCertificatePDF(
    templateName: string,
    certificateData: {
      recipientName: string;
      eventOrCourseName: string;
      organizationName: string;
      issuedDate: Date;
      verificationCode: string;
      recipientId: string;
      eventOrCourseId: string;
      additionalInfo?: Record<string, any>;
    },
    digitalSignature: DigitalSignature
  ): Promise<PDFGenerationResult>;

  /**
   * Verifica la integridad y firma digital de un PDF
   */
  verifyPDF(filePath: string): Promise<PDFVerificationResult>;

  /**
   * Extrae metadata de un PDF
   */
  extractMetadata(filePath: string): Promise<PDFMetadata>;

  /**
   * Convierte HTML a PDF
   */
  htmlToPDF(
    htmlContent: string,
    options?: {
      format?: "A4" | "Letter" | "Legal";
      orientation?: "portrait" | "landscape";
      margin?: {
        top: string;
        right: string;
        bottom: string;
        left: string;
      };
    }
  ): Promise<PDFGenerationResult>;

  /**
   * Combina múltiples PDFs en uno solo
   */
  mergePDFs(filePaths: string[]): Promise<PDFGenerationResult>;

  /**
   * Añade marca de agua a un PDF existente
   */
  addWatermark(
    filePath: string,
    watermark: {
      text: string;
      opacity: number;
      rotation: number;
      fontSize: number;
    }
  ): Promise<PDFGenerationResult>;

  /**
   * Protege un PDF con contraseña
   */
  protectPDF(
    filePath: string,
    userPassword?: string,
    ownerPassword?: string,
    permissions?: {
      printing: boolean;
      modifying: boolean;
      copying: boolean;
      annotating: boolean;
      fillingForms: boolean;
    }
  ): Promise<PDFGenerationResult>;

  /**
   * Obtiene información sobre plantillas disponibles
   */
  getAvailableTemplates(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      requiredFields: string[];
      previewUrl?: string;
    }>
  >;

  /**
   * Valida que una plantilla sea compatible con los datos
   */
  validateTemplate(
    templateId: string,
    data: Record<string, any>
  ): Promise<{
    isValid: boolean;
    missingFields: string[];
    invalidFields: string[];
  }>;
}
