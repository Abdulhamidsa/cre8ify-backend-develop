import { nanoid } from 'nanoid';

/**
 * Generate a friendlyId using the username and a unique suffix.
 * @param username - The username of the user
 * @returns string - A unique friendlyId
 */
export const generateFriendlyId = (username: string): string => {
  const uniqueSuffix = nanoid(8); // Generates a short, unique ID
  return `${username}-${uniqueSuffix}`;
};
