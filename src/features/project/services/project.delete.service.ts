import { AppError } from '../../../common/errors/app.error.js';
import Logger from '../../../common/utils/logger.js';
import { Project } from '../../../models/projects.model.js';
import { User } from '../../../models/user.model.js';

export const deleteProjectService = async (mongoRef: string, projectId: string) => {
  try {
    // Check if the user exists based on mongoRef
    const user = await User.findOne({ mongoRef: mongoRef }).lean();
    console.log(user);
    if (!user) {
      throw new AppError('User not found', 404); // Specific error for user not found
    }

    // Check if the project exists and belongs to the user
    const project = await Project.findOneAndDelete({ _id: projectId, userId: user._id });
    if (!project) {
      throw new AppError('Project not found or not accessible', 404); // Specific error for project not found
    }

    // Log the deletion success
    Logger.info(`Project with ID ${projectId} successfully deleted by user ${user._id}`);

    return { message: 'Project deleted successfully' };
  } catch (error) {
    Logger.error(`Error deleting project with ID ${projectId}:`, error);

    throw error;
  }
};
