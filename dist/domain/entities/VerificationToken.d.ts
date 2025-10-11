export interface IVerificationToken {
    id: string;
    userId: string;
    token: string;
    type: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}
export declare class VerificationToken implements IVerificationToken {
    readonly id: string;
    readonly userId: string;
    readonly token: string;
    readonly type: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
    readonly expiresAt: Date;
    readonly isUsed: boolean;
    readonly createdAt: Date;
    constructor(data: IVerificationToken);
    isExpired(): boolean;
    isValid(): boolean;
    canBeUsed(): boolean;
}
//# sourceMappingURL=VerificationToken.d.ts.map