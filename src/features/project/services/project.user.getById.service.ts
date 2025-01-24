import { AppError } from '../../../common/errors/app.error.js';
import Logger from '../../../common/utils/logger.js';
import { fetchedProjectSchema } from '../../../common/validation/project.zod.js';
import { FetchedProjectType } from '../../../common/validation/project.zod.js';
import { Project } from '../../../models/projects.model.js';
import { Tag } from '../../../models/tag.model.js';
import { User } from '../../../models/user.model.js';

export const getUserProjectsByFriendlyId = async (
  friendlyId: string,
): Promise<{
  user: { friendlyId: string; username: string; profilePicture: string };
  projects: FetchedProjectType[];
}> => {
  try {
    console.log(`Fetching projects for friendlyId ${friendlyId}`);
    // Find user by friendlyId
    const user = await User.findOne({ friendlyId }).lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }
    console.log(`User found: ${user._id}`);

    // Find projects based on the found user's _id
    const projects = await Project.find({ userId: user._id }).lean().select('-__v -userId');

    if (!projects || projects.length === 0) {
      return {
        user: { friendlyId: user.friendlyId, username: user.username, profilePicture: user.profilePicture },
        projects: [],
      };
    }

    // Transform projects and fetch associated tags
    const transformedProjects = await Promise.all(
      projects.map(async (project) => {
        const tags = await Tag.find({ _id: { $in: project.tags } }).select('name');

        const transformedProject = {
          id: project._id.toString(),
          title: project.title,
          description: project.description,
          url: project.url,
          thumbnail: project.thumbnail,
          media: project.media.map((image) => ({
            url: image.url,
          })),
          tags: tags.map((tag) => ({ id: tag.id.toString(), name: tag.name })),
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };

        return fetchedProjectSchema.parse(transformedProject);
      }),
    );

    return {
      user: { friendlyId: user.friendlyId, username: user.username, profilePicture: user.profilePicture },
      projects: transformedProjects,
    };
  } catch (error) {
    Logger.error(`Error fetching projects for friendlyId ${friendlyId}:`, error);
    throw new AppError('Failed to fetch user projects', 500);
  }
};
