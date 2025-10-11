export interface IVerificationToken {
  id: string;
  userId: string;
  token: string;
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export class VerificationToken implements IVerificationToken {
  public readonly id: string;
  public readonly userId: string;
  public readonly token: string;
  public readonly type: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
  public readonly expiresAt: Date;
  public readonly isUsed: boolean;
  public readonly createdAt: Date;

  constructor(data: IVerificationToken) {
    this.id = data.id;
    this.userId = data.userId;
    this.token = data.token;
    this.type = data.type;
    this.expiresAt = data.expiresAt;
    this.isUsed = data.isUsed;
    this.createdAt = data.createdAt;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isValid(): boolean {
    return !this.isUsed && !this.isExpired();
  }

  public canBeUsed(): boolean {
    return this.isValid();
  }
}
