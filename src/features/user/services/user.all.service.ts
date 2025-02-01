import { User } from '../../../models/user.model.js';

export const getAllUsersService = async (page: number, limit: number) => {
  try {
    // Calculate the pagination offset
    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const users = await User.find({}).skip(skip).limit(limit).lean().select('-__v');

    // Fetch total count for pagination
    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit);

    // Return users with pagination metadata, even if empty
    return {
      users: users.map((user) => ({
        id: user._id.toString(),
        username: user.username,
        friendlyId: user.friendlyId,
        completedProfile: user.completedProfile,
        profession: user.profession || null,
        profilePicture: user.profilePicture || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    throw error;
  }
};
