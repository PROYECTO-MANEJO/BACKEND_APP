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
    cedulaFileUrl?: string;
    matriculaFileUrl?: string;
    documentsVerified?: boolean;
    verificationDate?: Date;
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
    createAccount(accountData: AccountData): Promise<AccountData>;
    findByEmail(email: string): Promise<AuthenticationData | null>;
    findByCedula(cedula: string): Promise<AuthenticationData | null>;
    findByVerificationToken(token: string): Promise<AuthenticationData | null>;
    findByResetToken(token: string): Promise<AuthenticationData | null>;
    findCompleteByEmail(email: string): Promise<CompleteAuthData | null>;
    findCompleteById(userId: string): Promise<CompleteAuthData | null>;
    updatePassword(userId: string, hashedPassword: string): Promise<void>;
    verifyAccount(accountId: string): Promise<void>;
    setResetToken(userId: string, token: string, expiry: Date): Promise<void>;
    setVerificationToken(accountId: string, token: string, expiry: Date): Promise<void>;
    isEmailTaken(email: string): Promise<boolean>;
    isCedulaTaken(cedula: string): Promise<boolean>;
    updateRole(accountId: string, role: string): Promise<AccountData>;
    findByRole(role: string): Promise<AuthenticationData[]>;
    getUserStats(): Promise<{
        total: number;
        verified: number;
        byRole: Record<string, number>;
    }>;
    deleteAccount(accountId: string): Promise<void>;
}
//# sourceMappingURL=IAuthenticationRepository.d.ts.map