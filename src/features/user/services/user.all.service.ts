import { User } from '../../../models/user.model.js';

export const getAllUsersService = async (page: number, limit: number, searchTerm?: string) => {
  try {
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (searchTerm && searchTerm.trim() !== '') {
      filter.username = { $regex: searchTerm, $options: 'i' };
    }

    const users = await User.find(filter).skip(skip).limit(limit).lean().select('-__v');

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

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
