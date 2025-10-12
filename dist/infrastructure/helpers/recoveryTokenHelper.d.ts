export interface RecoveryToken {
    token: string;
    hashedToken: string;
    expiry: Date;
}
export declare const generateRecoveryToken: () => Promise<RecoveryToken>;
//# sourceMappingURL=recoveryTokenHelper.d.ts.map