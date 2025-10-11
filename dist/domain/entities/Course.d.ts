/**
 * Course Entity - Domain Layer
 *
 * Representa un curso del sistema con todas sus reglas de negocio
 * y validaciones correspondientes.
 */
export interface CourseData {
    id?: string;
    nom_cur: string;
    des_cur: string;
    dur_cur: number;
    fec_ini_cur: Date;
    fec_fin_cur: Date;
    id_cat_cur: number;
    ced_org_cur: string;
    capacidad_max_cur: number;
    tipo_audiencia_cur: string;
    requiere_verificacion_docs?: boolean;
    es_gratuito: boolean;
    precio?: number | null;
    porcentaje_asistencia_aprobacion: number;
    nota_minima_aprobacion: number;
    estado_cur?: string;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
    categoria?: any;
    organizador?: any;
    inscripciones?: any[];
    carreras?: number[];
}
export declare class Course {
    private _id?;
    private _nom_cur;
    private _des_cur;
    private _dur_cur;
    private _fec_ini_cur;
    private _fec_fin_cur;
    private _id_cat_cur;
    private _ced_org_cur;
    private _capacidad_max_cur;
    private _tipo_audiencia_cur;
    private _requiere_verificacion_docs;
    private _es_gratuito;
    private _precio?;
    private _porcentaje_asistencia_aprobacion;
    private _nota_minima_aprobacion;
    private _estado_cur;
    private _fecha_creacion?;
    private _fecha_actualizacion?;
    constructor(data: CourseData);
    private validateCourseData;
    private validateDates;
    private validateDuration;
    private validateCapacity;
    private validateApprovalCriteria;
    private validatePrice;
    private validateAudienceType;
    canBeUpdated(): boolean;
    canBeDeleted(): boolean;
    canBeClosed(): boolean;
    isActive(): boolean;
    isUpcoming(): boolean;
    isInProgress(): boolean;
    isFinished(): boolean;
    requiresDocumentVerification(): boolean;
    isForSpecificCareer(): boolean;
    updateBasicInfo(data: Partial<CourseData>): void;
    close(): void;
    cancel(): void;
    get id(): string | undefined;
    get nom_cur(): string;
    get des_cur(): string;
    get dur_cur(): number;
    get fec_ini_cur(): Date;
    get fec_fin_cur(): Date;
    get id_cat_cur(): number;
    get ced_org_cur(): string;
    get capacidad_max_cur(): number;
    get tipo_audiencia_cur(): string;
    get requiere_verificacion_docs(): boolean;
    get es_gratuito(): boolean;
    get precio(): number | null;
    get porcentaje_asistencia_aprobacion(): number;
    get nota_minima_aprobacion(): number;
    get estado_cur(): string;
    get fecha_creacion(): Date | undefined;
    get fecha_actualizacion(): Date | undefined;
    toPlainObject(): CourseData;
}
//# sourceMappingURL=Course.d.ts.map