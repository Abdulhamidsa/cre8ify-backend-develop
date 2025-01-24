import { AppError } from '../../../common/errors/app.error.js';
import Logger from '../../../common/utils/logger.js';
import { fetchedProjectSchema } from '../../../common/validation/project.zod.js';
import { FetchedProjectType } from '../../../common/validation/project.zod.js';
import { Project } from '../../../models/projects.model.js';
import { Tag } from '../../../models/tag.model.js';
import { User } from '../../../models/user.model.js';

export const getUserProjectsService = async (mongoRef: string): Promise<FetchedProjectType[]> => {
  try {
    const user = await User.findOne({ mongoRef }).lean();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const projects = await Project.find({ userId: user._id }).lean().select('-__v -userId');

    if (!projects || projects.length === 0) {
      return [];
    }
    const transformedProjects = await Promise.all(
      projects.map(async (project) => {
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
      }),
    );
    return transformedProjects;
  } catch (error) {
    Logger.error(`Error fetching projects for mongoRef ${mongoRef}:`, error);
    throw error;
  }
};
