import { AppError } from '../../../common/errors/app.error.js';
import Logger from '../../../common/utils/logger.js';
import { Project } from '../../../models/projects.model.js';
import { User } from '../../../models/user.model.js';

// Service to get all projects for the logged in user and transform them
export const getAllUserProjectsService = async (
  mongoRef: string,
): Promise<
  Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    media: { url: string }[];
    thumbnail?: string;
    tags: string[]; // converted to string, if needed
    feedbackAllowed: boolean;
    feedback: {
      userId: string;
      comment: string;
      createdAt: Date;
    }[];
  }>
> => {
  try {
    const user = await User.findOne({ mongoRef }).lean();
    if (!user) throw new AppError('User not found', 404);

    const projects = await Project.find({ userId: user._id }).lean();
    const transformedProjects = projects.map((project) => {
      return {
        // Cast _id to mongoose.Types.ObjectId then to string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (project._id as any).toString(),
        title: project.title,
        description: project.description,
        url: project.url,
        media: project.media.map((m: { url: string }) => ({ url: m.url })),
        thumbnail: project.thumbnail,
        // If tags are stored as ObjectIds, convert them to strings.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tags: (project.tags || []).map((tag: any) => tag.toString()),
        feedbackAllowed: project.feedbackAllowed || false,
        feedback: project.feedback
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            project.feedback.map((fb: any) => ({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              userId: (fb.userId as any).toString(),
              comment: fb.comment,
              createdAt: fb.createdAt,
            }))
          : [],
      };
    });

    return transformedProjects;
  } catch (error) {
    Logger.error(
      `Error fetching projects for user ${mongoRef}: ${error instanceof AppError ? error.message : 'Unexpected error'}`,
    );
    throw error;
  }
};
