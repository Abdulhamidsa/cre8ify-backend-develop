import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const hashPassword = async (password: string, saltRounds = 10): Promise<string> => {
  return bcrypt.hash(password, saltRounds);
};

export const generateMongoRef = (): string => {
  return crypto.randomBytes(16).toString('hex');
};
