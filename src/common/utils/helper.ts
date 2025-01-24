import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { UserType } from '../types/types.js';

export const generateFriendlyId = (firstName: string): string => {
  const shortId = uuidv4().split('-')[0]; // Use the first part of the UUID
  return `${firstName.toLowerCase().replace(/\s/g, '-')}-${shortId}`;
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const isProfileComplete = (user: UserType): boolean => {
  const requiredFields = ['username', 'age', 'bio', 'countryOrigin', 'profession', 'profilePicture'];

  return requiredFields.every((field) => Boolean(user[field as keyof UserType]));
};
