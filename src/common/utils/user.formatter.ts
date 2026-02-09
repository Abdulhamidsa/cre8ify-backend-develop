/**
 * Utility functions for MongoDB user document formatting
 */

/**
 * Formats a user document for client response by removing sensitive fields
 * @param user - The user document from MongoDB
 * @returns A sanitized user object safe for client consumption
 */
export const formatUserForClient = (user: any) => {
  if (!user) return null;

  // Create a plain object if it's a Mongoose document
  const userObj = user.toObject ? user.toObject() : { ...user };

  // Remove sensitive fields
  const { __v, _id, password, passwordHash, deletedAt, ...safeUserData } = userObj;

  return {
    ...safeUserData,
    id: _id ? _id.toString() : undefined,
  };
};
