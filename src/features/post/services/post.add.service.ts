import { AppError } from '../../../common/errors/app.error.js';
import Logger from '../../../common/utils/logger.js';
import { saveImageToCloudinary } from '../../../common/utils/saveImageToCloudinary.js';
import { AddPostInput } from '../../../common/validation/post.zod.js';
import { Post, PostDocument } from '../../../models/post.model.js';
import { User } from '../../../models/user.model.js';

export const addPostService = async (mongoRef: string, postData: AddPostInput): Promise<PostDocument> => {
  try {
    Logger.info(`Fetching user with mongoRef: ${mongoRef}`);
    const user = await User.findOne({ mongoRef }).lean();
    if (!user) throw new AppError('User not found', 404);

    Logger.info('User found. Uploading image...');
    let uploadedImageUrl = null;
    if (postData.image) {
      uploadedImageUrl = await saveImageToCloudinary(postData.image, 'posts/images', [
        { quality: 90, width: 800, crop: 'limit' },
      ]);
      Logger.info(`Image uploaded successfully: ${uploadedImageUrl}`);
    }

    Logger.info('Creating new post...');
    const newPost = await Post.create({
      userId: user._id,
      content: postData.content,
      image: uploadedImageUrl,
    });

    Logger.info('Post created successfully.');
    return newPost.toObject();
  } catch (error: unknown) {
    Logger.error(
      `Error adding post for user ${mongoRef}: ${error instanceof AppError ? error.message : 'Unexpected error'}`,
    );
    throw error;
  }
};
