import { RequestHandler } from 'express';

import { AppError } from '../../common/errors/app.error.js';
import { chatWithAI } from '../../common/utils/open.ai.config.js';
import { getUserProfileService } from '../user/services/user.profile.service.js';
import { getUserProjectsService } from './services/project.get.project.service.js';

export const handleAIChat: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = res.locals.mongoRef;
    const { message, step, selectedProject } = req.body;

    if (!userId) {
      next(new AppError('Unauthorized: User not found', 401));
      return;
    }

    // Fetch user's projects and profile
    const projects = await getUserProjectsService(userId);
    const userProfile = await getUserProfileService(userId);
    const profession = userProfile.profession?.trim() || 'general user';

    // Step 1: List Projects
    if (!step || step === 'list-projects') {
      const isMeaningfulText = (text: string): boolean => {
        const words = text.trim().split(/\s+/);
        return words.length > 1 && words.some((word) => word.length > 3);
      };

      const genericTitles = ['my project', 'untitled project', 'new project', 'default project'];

      const projectAnalysis = projects.map((project) => {
        const hasGenericTitle = genericTitles.includes(project.title.toLowerCase());
        const hasUnclearTitle = !isMeaningfulText(project.title) || hasGenericTitle;
        const hasUnclearDescription = !isMeaningfulText(project.description);

        const isUnclear = hasUnclearTitle || hasUnclearDescription;

        return {
          title: project.title,
          status: isUnclear ? 'Needs improvement' : 'Good',
          suggestion: isUnclear
            ? 'Consider renaming the title and adding a clear description to make the project more understandable.'
            : 'Looks well-defined!',
        };
      });

      res.json({
        success: true,
        step: 'select-project',
        message: 'Here are your projects. Some may need better descriptions.',
        projects: projectAnalysis,
      });
      return;
    }

    // Step 2: Project Selected
    if (step === 'select-project') {
      const selected = projects.find((p) => p.title.toLowerCase() === selectedProject?.toLowerCase());

      if (!selected) {
        res.json({
          success: false,
          message: "I couldn't find that project. Please choose one from the list.",
        });
        return;
      }

      const isUnclear = selected.title.length < 5 || selected.description.length < 10;
      const options = isUnclear
        ? ['1. Rewrite my project title & description', '2. Suggest improvements']
        : [
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

    // Step 3: Handle User's Action
    if (step === 'choose-action' || step === 'finished') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: any;

      if (message.trim().toLowerCase() === 'refresh') {
        if (!req.body.lastMode) {
          res.json({ success: false, message: 'Missing lastMode for refresh.' });
          return;
        }
        response = await chatWithAI(
          [{ title: selectedProject, description: '' }],
          profession,
          'refresh',
          req.body.lastMode,
        );
      } else if (message.includes('rewrite')) {
        response = await chatWithAI([{ title: selectedProject, description: '' }], profession, 'rewrite');
      } else if (message.includes('improve')) {
        response = await chatWithAI([{ title: selectedProject, description: '' }], profession, 'improve');
      } else if (message.includes('similar')) {
        response = await chatWithAI([{ title: selectedProject, description: '' }], profession, 'similar');
      } else if (message.includes('weaknesses')) {
        response = await chatWithAI([{ title: selectedProject, description: '' }], profession, 'weaknesses');
      } else if (message.includes('expansion')) {
        response = await chatWithAI([{ title: selectedProject, description: '' }], profession, 'expansion');
      } else if (message.includes('monetize')) {
        response = await chatWithAI([{ title: selectedProject, description: '' }], profession, 'monetize');
      } else if (message.includes('audience')) {
        response = await chatWithAI([{ title: selectedProject, description: '' }], profession, 'audience');
      } else {
        res.json({ success: false, message: "I didn't understand that. Choose one of the available options." });
        return;
      }

      // Merge all results into a single data array
      const dataArray: { title: string; description: string }[] = [];
      if (response.improvements && response.improvements.length > 0) {
        dataArray.push(...response.improvements);
      }
      if (response.monetizationStrategies && response.monetizationStrategies.length > 0) {
        dataArray.push(...response.monetizationStrategies);
      }
      if (response.similarProjects && response.similarProjects.length > 0) {
        dataArray.push(...response.similarProjects);
      }
      if (response.audienceAnalysis && response.audienceAnalysis.length > 0) {
        dataArray.push(...response.audienceAnalysis);
      }

      res.json({
        success: true,
        step: 'finished',
        project: selectedProject,
        data: dataArray,
      });
      return;
    }

    res.json({ success: false, message: 'Invalid step. Restart the conversation.' });
    return;
  } catch (error) {
    next(error);
  }
};
