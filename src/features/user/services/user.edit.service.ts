import { AppError } from '../../../common/errors/app.error.js';
import { User } from '../../../common/models/user.model.js';
import { generateFriendlyId } from '../../../common/utils/generate.id.js';
import { isProfileComplete } from '../../../common/utils/helper.js';
import Logger from '../../../common/utils/logger.js';
import { saveImageToCloudinary } from '../../../common/utils/saveImageToCloudinary.js';
import { EditUserInput } from '../../../common/validation/user.zod.js';

export const editUserProfileService = async (mongoRef: string, profileData: EditUserInput): Promise<EditUserInput> => {
  try {
    // Fetch the current user data
    const currentUser = await User.findOne({ mongoRef }).lean();

    if (!currentUser) {
      throw new AppError('User not found', 404);
    }

    // Check if the new username is already in use by another user
    if (profileData.username && profileData.username !== currentUser.username) {
      const existingUser = await User.findOne({ username: profileData.username }).lean();
      if (existingUser) {
        throw new AppError('Username is already in use', 400);
      }
      profileData = { ...profileData, friendlyId: generateFriendlyId(profileData.username) };
      Logger.info(`Generated new friendlyId: ${profileData.friendlyId}`);
    }

    let profilePictureUrl = currentUser.profilePicture || '';
    let coverImageUrl = currentUser.coverImage || '';
    if (profileData.profilePicture && profileData.profilePicture !== currentUser.profilePicture) {
      profilePictureUrl = await saveImageToCloudinary(
        profileData.profilePicture,
        'users/profile_pictures',
        [{ quality: 'auto', width: 400, height: 400, crop: 'fill' }],
        'webp',
      );
      profileData = { ...profileData, profilePicture: profilePictureUrl };
    }
    if (profileData.coverImage && profileData.coverImage !== currentUser.coverImage) {
      coverImageUrl = await saveImageToCloudinary(
        profileData.coverImage,
        'users/cover_images',
        [{ quality: 'auto', width: 1200, height: 300, crop: 'fill' }],
        'webp',
      );
      profileData = { ...profileData, coverImage: coverImageUrl };
    }

    const updatedProfileData = { ...currentUser, ...profileData };
    const completedProfile = isProfileComplete(updatedProfileData);
    const updatedUser = await User.findOneAndUpdate(
      { mongoRef },
      { $set: { ...profileData, completedProfile } },
      { new: true, lean: true, runValidators: true },
    ).select('-password -active -updatedAt -deletedAt -mongoRef -_id');
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    return updatedUser;
  } catch (error) {
    Logger.error(`Error updating user profile for ${mongoRef}:`, error);
    throw error;
  }
};
