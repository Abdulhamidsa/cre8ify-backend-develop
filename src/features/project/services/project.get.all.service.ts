import Logger from '../../../common/utils/logger.js';
import { fetchProjectWithUser } from '../../../common/validation/project.zod.js';
import { Project } from '../../../models/projects.model.js';
import { Tag } from '../../../models/tag.model.js';
import { User } from '../../../models/user.model.js';

export const getAllProjectsService = async (page: number, limit: number, search: string) => {
  try {
    const skip = (page - 1) * limit;

    const searchFilter = search ? { title: { $regex: search, $options: 'i' } } : {};

    const projects = await Project.find(searchFilter).skip(skip).limit(limit).lean().select('-__v');

    if (!projects || projects.length === 0) {
      return {
        projects: [],
        pagination: {
          page,
          limit,
          total: 0,
        },
      };
    }

    const transformedProjects = await Promise.all(
      projects.map(async (project) => {
        const tags = await Tag.find({ _id: { $in: project.tags } }).select('name');
        const user = project.userId
          ? await User.findById(project.userId)
              .select('username profilePicture profession friendlyId completedProfile')
              .lean()
          : null;

        return fetchProjectWithUser.parse({
          id: project._id.toString(),
          title: project.title,
          description: project.description,
          url: project.url,
          thumbnail: project.thumbnail,
          media: project.media.map((image) => ({ url: image.url })),
          tags: tags.map((tag) => ({ id: tag.id.toString(), name: tag.name })),
          user: user
            ? {
                username: user.username,
                profilePicture: user.profilePicture || null,
                profession: user.profession && user.profession.trim() !== '' ? user.profession : 'Not specified', // Ensure default value
                friendlyId: user.friendlyId,
                completedProfile: user.completedProfile,
              }
            : null,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        });
      }),
    );

    return {
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total: await Project.countDocuments(searchFilter),
      },
    };
  } catch (error) {
    Logger.error(`Error fetching projects for page ${page} and limit ${limit}:`, error);
    throw error;
  }
};
