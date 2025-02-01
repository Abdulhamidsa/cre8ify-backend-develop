import express from 'express';

import { handleGetAllProjects, handleGetUserPublicProjects } from '../project.handler.js';

const router = express.Router();

router.get('/projects', handleGetAllProjects);
router.get('/projects/user/:friendlyId', handleGetUserPublicProjects);

export default router;
