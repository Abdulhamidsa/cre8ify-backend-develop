import { Router } from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import {
  addProjectSchema,
  editProjectValidationSchema,
  projectIdValidationSchema,
} from '../../../common/validation/project.zod.js';
import {
  handleAddProject,
  handleDeleteProject,
  handleEditProject,
  handleGetUserProjects,
  handleGetUserPublicProjects,
} from '../project.handler.js';

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
router.get('/projects/user/:friendlyId', handleGetUserPublicProjects);
router.delete('/project/:id', ValidZod(projectIdValidationSchema, 'params'), handleDeleteProject);

export default router;
