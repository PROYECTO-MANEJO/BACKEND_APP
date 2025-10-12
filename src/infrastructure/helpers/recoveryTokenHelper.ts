import crypto from 'crypto';
import bcrypt from 'bcrypt';

export interface RecoveryToken {
  token: string;
  hashedToken: string;
  expiry: Date;
}

export const generateRecoveryToken = async (): Promise<RecoveryToken> => {
  const token = crypto.randomBytes(20).toString('hex');
  const hashedToken = await bcrypt.hash(token, 10);
  const expiry = new Date(Date.now() + 3600000); // 1 hora
  
  return { token, hashedToken, expiry };
};
