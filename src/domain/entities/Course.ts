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
  dur_cur: number; // Duración en horas
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
  // Relaciones
  categoria?: any;
  organizador?: any;
  inscripciones?: any[];
  carreras?: number[];
}

export class Course {
  private _id?: string;
  private _nom_cur: string;
  private _des_cur: string;
  private _dur_cur: number;
  private _fec_ini_cur: Date;
  private _fec_fin_cur: Date;
  private _id_cat_cur: number;
  private _ced_org_cur: string;
  private _capacidad_max_cur: number;
  private _tipo_audiencia_cur: string;
  private _requiere_verificacion_docs: boolean;
  private _es_gratuito: boolean;
  private _precio?: number | null;
  private _porcentaje_asistencia_aprobacion: number;
  private _nota_minima_aprobacion: number;
  private _estado_cur: string;
  private _fecha_creacion?: Date;
  private _fecha_actualizacion?: Date;

  constructor(data: CourseData) {
    this.validateCourseData(data);

    this._id = data.id;
    this._nom_cur = data.nom_cur;
    this._des_cur = data.des_cur;
    this._dur_cur = data.dur_cur;
    this._fec_ini_cur = data.fec_ini_cur;
    this._fec_fin_cur = data.fec_fin_cur;
    this._id_cat_cur = data.id_cat_cur;
    this._ced_org_cur = data.ced_org_cur;
    this._capacidad_max_cur = data.capacidad_max_cur;
    this._tipo_audiencia_cur = data.tipo_audiencia_cur;
    this._requiere_verificacion_docs = data.requiere_verificacion_docs || false;
    this._es_gratuito = data.es_gratuito;
    this._precio = data.precio || null;
    this._porcentaje_asistencia_aprobacion =
      data.porcentaje_asistencia_aprobacion;
    this._nota_minima_aprobacion = data.nota_minima_aprobacion;
    this._estado_cur = data.estado_cur || "ACTIVO";
    this._fecha_creacion = data.fecha_creacion || new Date();
    this._fecha_actualizacion = data.fecha_actualizacion || new Date();
  }

  // ✅ VALIDACIONES DE NEGOCIO
  private validateCourseData(data: CourseData): void {
    // Validar campos obligatorios
    if (!data.nom_cur?.trim()) {
      throw new Error("El nombre del curso es obligatorio");
    }

    if (!data.des_cur?.trim()) {
      throw new Error("La descripción del curso es obligatoria");
    }

    if (!data.dur_cur || data.dur_cur <= 0) {
      throw new Error("La duración debe ser mayor a 0 horas");
    }

    if (!data.fec_ini_cur) {
      throw new Error("La fecha de inicio es obligatoria");
    }

    if (!data.fec_fin_cur) {
      throw new Error("La fecha de fin es obligatoria");
    }

    if (!data.id_cat_cur || data.id_cat_cur <= 0) {
      throw new Error("La categoría del curso es obligatoria");
    }

    if (!data.ced_org_cur?.trim()) {
      throw new Error("La cédula del organizador es obligatoria");
    }

    if (!data.capacidad_max_cur || data.capacidad_max_cur <= 0) {
      throw new Error("La capacidad máxima debe ser mayor a 0");
    }

    // Validar fechas
    this.validateDates(data.fec_ini_cur, data.fec_fin_cur);

    // Validar duración
    this.validateDuration(data.dur_cur);

    // Validar capacidad
    this.validateCapacity(data.capacidad_max_cur);

    // Validar porcentajes y notas
    this.validateApprovalCriteria(
      data.porcentaje_asistencia_aprobacion,
      data.nota_minima_aprobacion
    );

    // Validar precio si no es gratuito
    this.validatePrice(data.es_gratuito, data.precio);

    // Validar tipo de audiencia
    this.validateAudienceType(data.tipo_audiencia_cur);
  }

  private validateDates(fechaInicio: Date, fechaFin: Date): void {
    const now = new Date();

    if (fechaInicio < now) {
      throw new Error("La fecha de inicio no puede ser en el pasado");
    }

    if (fechaFin <= fechaInicio) {
      throw new Error(
        "La fecha de fin debe ser posterior a la fecha de inicio"
      );
    }

    // Validar que no sea más de 2 años en el futuro
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);

    if (fechaFin > maxDate) {
      throw new Error(
        "La fecha de fin no puede ser más de 2 años en el futuro"
      );
    }

    // Validar duración mínima del curso (al menos 1 día)
    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      throw new Error("El curso debe durar al menos 1 día");
    }

    // Validar duración máxima del curso (máximo 1 año)
    if (diffDays > 365) {
      throw new Error("El curso no puede durar más de 1 año");
    }
  }

  private validateDuration(duracion: number): void {
    if (duracion < 1) {
      throw new Error("La duración mínima del curso es de 1 hora");
    }

    if (duracion > 2000) {
      // Aproximadamente 1 año de 40 horas semanales
      throw new Error("La duración máxima del curso es de 2000 horas");
    }
  }

  private validateCapacity(capacidad: number): void {
    if (capacidad < 1) {
      throw new Error("La capacidad mínima es de 1 persona");
    }

    if (capacidad > 1000) {
      throw new Error("La capacidad máxima es de 1,000 personas");
    }
  }

  private validateApprovalCriteria(
    porcentajeAsistencia: number,
    notaMinima: number
  ): void {
    if (porcentajeAsistencia == null || isNaN(porcentajeAsistencia)) {
      throw new Error("El porcentaje de asistencia es obligatorio");
    }

    if (porcentajeAsistencia < 0 || porcentajeAsistencia > 100) {
      throw new Error("El porcentaje de asistencia debe estar entre 0 y 100");
    }

    if (notaMinima == null || isNaN(notaMinima)) {
      throw new Error("La nota mínima de aprobación es obligatoria");
    }

    if (notaMinima < 0 || notaMinima > 10) {
      throw new Error("La nota mínima debe estar entre 0 y 10");
    }
  }

  private validatePrice(esGratuito: boolean, precio?: number | null): void {
    if (!esGratuito) {
      if (!precio || precio <= 0) {
        throw new Error("El precio debe ser mayor a 0 para cursos pagos");
      }

      if (precio > 10000000) {
        // Precio máximo razonable
        throw new Error("El precio no puede superar $10,000,000");
      }
    }
  }

  private validateAudienceType(tipoAudiencia: string): void {
    const tiposValidos = [
      "CARRERA_ESPECIFICA",
      "TODAS_CARRERAS",
      "PUBLICO_GENERAL",
    ];

    if (!tiposValidos.includes(tipoAudiencia)) {
      throw new Error(
        `Tipo de audiencia debe ser uno de: ${tiposValidos.join(", ")}`
      );
    }
  }

  // ✅ MÉTODOS DE NEGOCIO
  public canBeUpdated(): boolean {
    const now = new Date();
    return this._fec_ini_cur > now && this._estado_cur === "ACTIVO";
  }

  public canBeDeleted(): boolean {
    return this.canBeUpdated(); // Mismas reglas que actualización
  }

  public canBeClosed(): boolean {
    const now = new Date();
    return this._fec_fin_cur <= now && this._estado_cur === "ACTIVO";
  }

  public isActive(): boolean {
    return this._estado_cur === "ACTIVO";
  }

  public isUpcoming(): boolean {
    const now = new Date();
    return this._fec_ini_cur > now && this._estado_cur === "ACTIVO";
  }

  public isInProgress(): boolean {
    const now = new Date();
    return (
      this._fec_ini_cur <= now &&
      this._fec_fin_cur >= now &&
      this._estado_cur === "ACTIVO"
    );
  }

  public isFinished(): boolean {
    return this._estado_cur === "CERRADO" || this._estado_cur === "FINALIZADO";
  }

  public requiresDocumentVerification(): boolean {
    return this._requiere_verificacion_docs;
  }

  public isForSpecificCareer(): boolean {
    return this._tipo_audiencia_cur === "CARRERA_ESPECIFICA";
  }

  public updateBasicInfo(data: Partial<CourseData>): void {
    if (!this.canBeUpdated()) {
      throw new Error("El curso no puede ser actualizado");
    }

    // Validar solo los campos que se están actualizando
    if (data.nom_cur !== undefined) {
      if (!data.nom_cur?.trim()) {
        throw new Error("El nombre del curso no puede estar vacío");
      }
      this._nom_cur = data.nom_cur;
    }

    if (data.des_cur !== undefined) {
      if (!data.des_cur?.trim()) {
        throw new Error("La descripción del curso no puede estar vacía");
      }
      this._des_cur = data.des_cur;
    }

    if (data.capacidad_max_cur !== undefined) {
      this.validateCapacity(data.capacidad_max_cur);
      this._capacidad_max_cur = data.capacidad_max_cur;
    }

    if (data.precio !== undefined && !this._es_gratuito) {
      this.validatePrice(false, data.precio);
      this._precio = data.precio;
    }

    if (data.dur_cur !== undefined) {
      this.validateDuration(data.dur_cur);
      this._dur_cur = data.dur_cur;
    }

    this._fecha_actualizacion = new Date();
  }

  public close(): void {
    if (!this.canBeClosed()) {
      throw new Error("El curso no puede ser cerrado en este momento");
    }

    this._estado_cur = "CERRADO";
    this._fecha_actualizacion = new Date();
  }

  public cancel(): void {
    if (!this.canBeUpdated()) {
      throw new Error("El curso no puede ser cancelado");
    }

    this._estado_cur = "CANCELADO";
    this._fecha_actualizacion = new Date();
  }

  // ✅ GETTERS
  get id(): string | undefined {
    return this._id;
  }
  get nom_cur(): string {
    return this._nom_cur;
  }
  get des_cur(): string {
    return this._des_cur;
  }
  get dur_cur(): number {
    return this._dur_cur;
  }
  get fec_ini_cur(): Date {
    return this._fec_ini_cur;
  }
  get fec_fin_cur(): Date {
    return this._fec_fin_cur;
  }
  get id_cat_cur(): number {
    return this._id_cat_cur;
  }
  get ced_org_cur(): string {
    return this._ced_org_cur;
  }
  get capacidad_max_cur(): number {
    return this._capacidad_max_cur;
  }
  get tipo_audiencia_cur(): string {
    return this._tipo_audiencia_cur;
  }
  get requiere_verificacion_docs(): boolean {
    return this._requiere_verificacion_docs;
  }
  get es_gratuito(): boolean {
    return this._es_gratuito;
  }
  get precio(): number | null {
    return this._precio || null;
  }
  get porcentaje_asistencia_aprobacion(): number {
    return this._porcentaje_asistencia_aprobacion;
  }
  get nota_minima_aprobacion(): number {
    return this._nota_minima_aprobacion;
  }
  get estado_cur(): string {
    return this._estado_cur;
  }
  get fecha_creacion(): Date | undefined {
    return this._fecha_creacion;
  }
  get fecha_actualizacion(): Date | undefined {
    return this._fecha_actualizacion;
  }

  // ✅ MÉTODO PARA SERIALIZACIÓN
  public toPlainObject(): CourseData {
    return {
      id: this._id,
      nom_cur: this._nom_cur,
      des_cur: this._des_cur,
      dur_cur: this._dur_cur,
      fec_ini_cur: this._fec_ini_cur,
      fec_fin_cur: this._fec_fin_cur,
      id_cat_cur: this._id_cat_cur,
      ced_org_cur: this._ced_org_cur,
      capacidad_max_cur: this._capacidad_max_cur,
      tipo_audiencia_cur: this._tipo_audiencia_cur,
      requiere_verificacion_docs: this._requiere_verificacion_docs,
      es_gratuito: this._es_gratuito,
      precio: this._precio,
      porcentaje_asistencia_aprobacion: this._porcentaje_asistencia_aprobacion,
      nota_minima_aprobacion: this._nota_minima_aprobacion,
      estado_cur: this._estado_cur,
      fecha_creacion: this._fecha_creacion,
      fecha_actualizacion: this._fecha_actualizacion,
    };
  }
}
