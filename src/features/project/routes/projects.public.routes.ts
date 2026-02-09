import express from 'express';

import { handleGetAllProjects, handleGetProjectById, handleGetUserPublicProjects } from '../project.handler.js';

const router = express.Router();

router.get('/projects', handleGetAllProjects);
// More specific routes must come before generic ones
router.get('/projects/user/:friendlyId', handleGetUserPublicProjects);
router.get('/projects/:projectId', handleGetProjectById);

export default router;
