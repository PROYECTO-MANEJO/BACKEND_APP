export interface AccountData {
  id?: string;
  email: string;
  role: string;
  isVerified: boolean;
  userId: string;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
}

export interface UserData {
  id: string;
  cedula: string;
  firstName: string;
  lastName: string;
  firstName2?: string;
  lastName2?: string;
  birthDate?: Date;
  phone?: string;
  careerId?: string;
  password?: string;
  // Documentos
  cedulaFileUrl?: string;
  matriculaFileUrl?: string;
  documentsVerified?: boolean;
  verificationDate?: Date;
  // Tokens de recuperación
  resetToken?: string;
  resetTokenExpiry?: Date;
}

export interface CareerData {
  id: string;
  name: string;
}

export interface CompleteAuthData {
  user: UserData;
  account: AccountData;
  career?: CareerData;
}

export interface AuthenticationData {
  user: {
    id: string;
    cedula: string;
    firstName: string;
    lastName: string;
    password?: string;
  };
  account: AccountData;
}

export interface IAuthenticationRepository {
  // ===== CREACIÓN DE CUENTA =====
  createAccount(accountData: AccountData): Promise<AccountData>;

  // ===== BÚSQUEDAS DE AUTENTICACIÓN =====
  findByEmail(email: string): Promise<AuthenticationData | null>;
  findByCedula(cedula: string): Promise<AuthenticationData | null>;
  findByVerificationToken(token: string): Promise<AuthenticationData | null>;
  findByResetToken(token: string): Promise<AuthenticationData | null>;

  // ===== BÚSQUEDAS COMPLETAS PARA LOGIN =====
  findCompleteByEmail(email: string): Promise<CompleteAuthData | null>;
  findCompleteById(userId: string): Promise<CompleteAuthData | null>;

  // ===== ACTUALIZACIONES DE AUTENTICACIÓN =====
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  verifyAccount(accountId: string): Promise<void>;
  setResetToken(userId: string, token: string, expiry: Date): Promise<void>;
  setVerificationToken(accountId: string, token: string, expiry: Date): Promise<void>;

  // ===== VALIDACIONES =====
  isEmailTaken(email: string): Promise<boolean>;
  isCedulaTaken(cedula: string): Promise<boolean>;

  // ===== GESTIÓN DE ROLES =====
  updateRole(accountId: string, role: string): Promise<AccountData>;
  findByRole(role: string): Promise<AuthenticationData[]>;

  // ===== ESTADÍSTICAS =====
  getUserStats(): Promise<{
    total: number;
    verified: number;
    byRole: Record<string, number>;
  }>;

  // ===== ELIMINACIONES =====
  deleteAccount(accountId: string): Promise<void>;
}
