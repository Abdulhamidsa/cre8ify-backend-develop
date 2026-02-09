import { AppError } from '../../../common/errors/app.error.js';
import { Project } from '../../../common/models/projects.model.js';
import { Tag } from '../../../common/models/tag.model.js';
import { User } from '../../../common/models/user.model.js';
import Logger from '../../../common/utils/logger.js';
import { fetchedProjectSchema, FetchedProjectType } from '../../../common/validation/project.zod.js';

export const getProjectByIdService = async (projectId: string): Promise<FetchedProjectType> => {
  try {
    const project = await Project.findById(projectId).lean().select('-__v');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Get user info
    const user = await User.findById(project.userId).lean().select('username friendlyId profilePicture');
    if (!user) {
      throw new AppError('Project owner not found', 404);
    }

    // Get tags
    const tags: { _id: string; name: string }[] = await Tag.find({ _id: { $in: project.tags } }).select('name');

    const transformedProject = {
      id: project._id.toString(),
      title: project.title,
      description: project.description,
      url: project.url,
      thumbnail: project.thumbnail,
      media: project.media.map((image) => ({
        url: image.url,
      })),
      tags: tags.map((tag) => ({ id: tag._id.toString(), name: tag.name })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    return fetchedProjectSchema.parse(transformedProject);
  } catch (error) {
    Logger.error(`Error fetching project ${projectId}:`, error);
    throw error;
  }
};
