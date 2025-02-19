import { RequestHandler } from 'express';

import { AppError } from '../../common/errors/app.error.js';
import { chatWithAI } from '../../common/utils/open.ai.config.js';
import { getUserProfileService } from '../user/services/user.profile.service.js';
import { getUserProjectsService } from './services/project.get.project.service.js';

type ChatStep = 'list-projects' | 'select-project' | 'choose-action' | 'finished';

type ChatMode = 'ideas' | 'improve' | 'similar' | 'weaknesses' | 'expansion' | 'monetize' | 'audience' | 'rewrite';

interface Project {
  title: string;
  description: string;
}

interface AIChatRequestBody {
  message: string;
  step?: ChatStep;
  selectedProject?: string;
  lastMode?: ChatMode;
}

interface AIResponse {
  success: boolean;
  message?: string;
  data?: Project[];
}

/**
 * Express route handler for AI-based project discussions.
 */
export const handleAIChat: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId: string | undefined = res.locals.mongoRef;
    const { message, step, selectedProject, lastMode }: AIChatRequestBody = req.body;

    if (!userId) {
      next(new AppError('Unauthorized: User not found', 401));
      return;
    }

    // Fetch user's projects and profile
    const projects = await getUserProjectsService(userId);
    const userProfile = await getUserProfileService(userId);
    const profession: string = userProfile.profession?.trim() || 'general user';

    // **Step 1: List Projects**
    if (!step || step === 'list-projects') {
      const projectAnalysis = projects.map((project) => ({
        title: project.title,
        description: project.description,
      }));

      res.json({
        success: true,
        step: 'select-project',
        message: 'Here are your projects. Some may need better descriptions.',
        projects: projectAnalysis,
      });
      return;
    }

    // **Step 2: Project Selection**
    if (step === 'select-project') {
      const selected = projects.find((p) => p.title.toLowerCase() === selectedProject?.toLowerCase());

      if (!selected) {
        res.json({
          success: false,
          message: "I couldn't find that project. Please choose one from the list.",
        });
        return;
      }

      const options: string[] = [
        '1. Suggest improvements',
        '2. Find similar projects',
        '3. How can I expand this project?',
        '4. How can I monetize this?',
        '5. Who is my target audience?',
      ];

      res.json({
        success: true,
        step: 'choose-action',
        message: `You selected **${selected.title}**. What would you like to do?`,
        options,
      });
      return;
    }

    // **Step 3: Handle User's Action**
    let aiResponse: AIResponse;

    if (step === 'choose-action' || step === 'finished') {
      if (message.trim().toLowerCase() === 'refresh') {
        if (!lastMode) {
          res.status(400).json({ success: false, message: 'Missing lastMode for refresh.' });
          return;
        }
        aiResponse = await chatWithAI(
          [{ title: selectedProject ?? '', description: '' }],
          profession,
          'refresh',
          lastMode,
        );
      } else {
        const actionMap: Record<string, ChatMode> = {
          rewrite: 'rewrite',
          improve: 'improve',
          similar: 'similar',
          weaknesses: 'weaknesses',
          expansion: 'expansion',
          monetize: 'monetize',
          audience: 'audience',
        };

        const action = Object.keys(actionMap).find((key) => message.toLowerCase().includes(key));
        if (!action) {
          res.json({ success: false, message: "I didn't understand that. Choose one of the available options." });
          return;
        }

        aiResponse = await chatWithAI(
          [{ title: selectedProject ?? '', description: '' }],
          profession,
          actionMap[action],
        );
      }

      // **Merge all possible results into a single data array**
      const dataArray: Project[] = aiResponse.data ?? [];

      res.json({
        success: true,
        step: 'finished',
        project: selectedProject,
        data: dataArray,
      });
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid step. Restart the conversation.' });
  } catch (error) {
    next(error);
  }
};
