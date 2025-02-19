import { Router } from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import {
  addProjectSchema,
  editProjectValidationSchema,
  projectIdValidationSchema,
} from '../../../common/validation/project.zod.js';
import { handleAddProject, handleDeleteProject, handleEditProject, handleGetUserProjects } from '../project.handler.js';
import { handleAIChat } from '../project.handlers.ai.js';

const router = Router();

router.post('/project', ValidZod(addProjectSchema, 'body'), handleAddProject);
router.get('/projects/:projectId', handleGetUserProjects);
router.put(
  '/project/:id',
  ValidZod(projectIdValidationSchema, 'params'),
  ValidZod(editProjectValidationSchema, 'body'),
  handleEditProject,
);
// user projects by id
router.delete('/project/:id', ValidZod(projectIdValidationSchema, 'params'), handleDeleteProject);

// ai generate endpoint
router.post('/ai/generate', handleAIChat);

export default router;
