/**
 * NotificationService - External Service Interface
 *
 * Interfaz para el servicio de notificaciones del sistema.
 */
export type NotificationType = "CHANGE_REQUEST_CREATED" | "CHANGE_REQUEST_UPDATED" | "CHANGE_REQUEST_ASSIGNED" | "CHANGE_REQUEST_COMPLETED" | "CERTIFICATE_GENERATED" | "CERTIFICATE_EXPIRING" | "REPORT_READY" | "SYSTEM_ALERT" | "USER_ACTION_REQUIRED";
export type NotificationChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export interface NotificationRecipient {
    userId: string;
    email?: string;
    phoneNumber?: string;
    preferredChannels: NotificationChannel[];
    timezone?: string;
}
export interface NotificationTemplate {
    id: string;
    type: NotificationType;
    title: string;
    bodyTemplate: string;
    htmlTemplate?: string;
    variables: string[];
}
export interface NotificationRequest {
    type: NotificationType;
    recipients: NotificationRecipient[];
    priority: NotificationPriority;
    title: string;
    message: string;
    htmlMessage?: string;
    data?: Record<string, any>;
    channels?: NotificationChannel[];
    scheduledFor?: Date;
    expiresAt?: Date;
    actionUrl?: string;
    actionText?: string;
}
export interface NotificationResult {
    notificationId: string;
    success: boolean;
    sentAt: Date;
    results: Array<{
        userId: string;
        channel: NotificationChannel;
        success: boolean;
        error?: string;
        deliveredAt?: Date;
    }>;
    totalSent: number;
    totalFailed: number;
}
export interface NotificationDeliveryStatus {
    notificationId: string;
    userId: string;
    channel: NotificationChannel;
    status: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    error?: string;
}
export interface NotificationPreferences {
    userId: string;
    channels: NotificationChannel[];
    types: {
        [key in NotificationType]?: {
            enabled: boolean;
            channels: NotificationChannel[];
            quietHours?: {
                start: string;
                end: string;
                timezone: string;
            };
        };
    };
    globalQuietHours?: {
        start: string;
        end: string;
        timezone: string;
    };
}
export interface NotificationService {
    /**
     * Envía una notificación
     */
    sendNotification(request: NotificationRequest): Promise<NotificationResult>;
    /**
     * Envía una notificación usando una plantilla
     */
    sendTemplateNotification(templateId: string, recipients: NotificationRecipient[], variables: Record<string, any>, options?: {
        priority?: NotificationPriority;
        channels?: NotificationChannel[];
        scheduledFor?: Date;
    }): Promise<NotificationResult>;
    /**
     * Programa una notificación para envío futuro
     */
    scheduleNotification(request: NotificationRequest, scheduledFor: Date): Promise<{
        scheduleId: string;
        scheduledFor: Date;
    }>;
    /**
     * Cancela una notificación programada
     */
    cancelScheduledNotification(scheduleId: string): Promise<boolean>;
    /**
     * Obtiene el estado de entrega de una notificación
     */
    getDeliveryStatus(notificationId: string): Promise<NotificationDeliveryStatus[]>;
    /**
     * Marca una notificación como leída
     */
    markAsRead(notificationId: string, userId: string): Promise<boolean>;
    /**
     * Obtiene notificaciones de un usuario
     */
    getUserNotifications(userId: string, options?: {
        unreadOnly?: boolean;
        type?: NotificationType;
        limit?: number;
        offset?: number;
    }): Promise<Array<{
        id: string;
        type: NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        sentAt: Date;
        readAt?: Date;
        actionUrl?: string;
        actionText?: string;
        data?: Record<string, any>;
    }>>;
    /**
     * Cuenta notificaciones no leídas de un usuario
     */
    getUnreadCount(userId: string): Promise<number>;
    /**
     * Configura preferencias de notificación de un usuario
     */
    setUserPreferences(preferences: NotificationPreferences): Promise<boolean>;
    /**
     * Obtiene preferencias de notificación de un usuario
     */
    getUserPreferences(userId: string): Promise<NotificationPreferences>;
    /**
     * Registra una plantilla de notificación
     */
    registerTemplate(template: NotificationTemplate): Promise<boolean>;
    /**
     * Actualiza una plantilla de notificación
     */
    updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<boolean>;
    /**
     * Obtiene todas las plantillas disponibles
     */
    getTemplates(): Promise<NotificationTemplate[]>;
    /**
     * Valida una plantilla con variables
     */
    validateTemplate(templateId: string, variables: Record<string, any>): Promise<{
        isValid: boolean;
        missingVariables: string[];
        renderedTitle: string;
        renderedBody: string;
    }>;
    /**
     * Envía notificación de solicitud de cambio creada
     */
    notifyChangeRequestCreated(changeRequestId: string, title: string, requestedBy: string, assignedTo?: string): Promise<NotificationResult>;
    /**
     * Envía notificación de actualización de solicitud de cambio
     */
    notifyChangeRequestUpdated(changeRequestId: string, title: string, status: string, updatedBy: string, assignedTo: string): Promise<NotificationResult>;
    /**
     * Envía notificación de certificado generado
     */
    notifyCertificateGenerated(certificateId: string, recipientId: string, eventOrCourseName: string, downloadUrl: string): Promise<NotificationResult>;
    /**
     * Envía notificación de reporte listo
     */
    notifyReportReady(reportId: string, userId: string, reportType: string, downloadUrl: string): Promise<NotificationResult>;
    /**
     * Envía alerta del sistema
     */
    sendSystemAlert(message: string, priority: NotificationPriority, adminUserIds: string[]): Promise<NotificationResult>;
    /**
     * Verifica la conectividad de todos los canales
     */
    checkChannelHealth(): Promise<{
        [key in NotificationChannel]: {
            healthy: boolean;
            lastCheck: Date;
            error?: string;
        };
    }>;
    /**
     * Obtiene estadísticas de notificaciones
     */
    getNotificationStats(startDate?: Date, endDate?: Date): Promise<{
        totalSent: number;
        totalDelivered: number;
        totalRead: number;
        totalFailed: number;
        byType: {
            [type: string]: number;
        };
        byChannel: {
            [channel: string]: number;
        };
    }>;
}
//# sourceMappingURL=NotificationService.d.ts.map