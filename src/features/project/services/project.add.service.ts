import { AppError } from '../../../common/errors/app.error.js';
import Logger from '../../../common/utils/logger.js';
import { saveImageToCloudinary } from '../../../common/utils/saveImageToCloudinary.js';
import { AddProjectInput } from '../../../common/validation/project.zod.js';
import { Project } from '../../../models/projects.model.js';
import { Tag } from '../../../models/tag.model.js';
import { User } from '../../../models/user.model.js';

export const addProjectService = async (mongoRef: string, projectData: AddProjectInput): Promise<AddProjectInput> => {
  try {
    const user = await User.findOne({ mongoRef }).lean();
    if (!user) throw new AppError('User not found', 404);
    if (projectData.media && projectData.media.length > 5) {
      console.log(projectData.media.length);
      console.log(projectData.media);

      throw new AppError('You can only upload a maximum of 5 images', 400);
    }
    if (projectData.thumbnail && typeof projectData.thumbnail !== 'string') {
      throw new AppError('Invalid thumbnail format', 400);
    }

    const mediaTransformations = [
      { width: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ];
    const thumbnailTransformations = [
      { width: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ];

    const uploadedMedia = await Promise.all(
      (projectData.media || []).map(async (image) => {
        if (!image.url.includes('res.cloudinary.com')) {
          return { url: await saveImageToCloudinary(image.url, 'projects/images', mediaTransformations) };
        }
        return { url: image.url };
      }),
    );
    const thumbnailUrl = projectData.thumbnail?.includes('res.cloudinary.com')
      ? projectData.thumbnail
      : projectData.thumbnail
        ? await saveImageToCloudinary(projectData.thumbnail, 'projects/thumbnails', thumbnailTransformations)
        : undefined;

    const tagIds = await Promise.all(
      (projectData.tags || []).map(async (tagName) => {
        const tag = await Tag.findOneAndUpdate({ name: tagName }, {}, { upsert: true, new: true }).lean();
        return { id: tag?._id?.toString(), name: tag?.name || '' };
      }),
    );

    const newProject = await Project.create({
      ...projectData,
      media: uploadedMedia,
      thumbnail: thumbnailUrl,
      tags: tagIds.map((tag) => tag.id),
      userId: user._id,
    });
    const transformedProject: AddProjectInput = {
      title: newProject.title,
      description: newProject.description,
      url: newProject.url,
      media: newProject.media.map((m) => ({ url: m.url })),
      thumbnail: newProject.thumbnail,
      tags: tagIds.map((tag) => tag.name),
      feedbackAllowed: newProject.feedbackAllowed || false,
      feedback: newProject.feedback
        ? newProject.feedback.map((fb) => ({
            userId: fb.userId.toString(),
            comment: fb.comment,
            createdAt: fb.createdAt,
          }))
        : [],
    };

    return transformedProject;
  } catch (error) {
    Logger.error(
      `Error adding project for user ${mongoRef}: ${error instanceof AppError ? error.message : 'Unexpected error'}`,
    );
    throw error;
  }
};
