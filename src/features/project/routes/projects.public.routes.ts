import express from 'express';

import { handleGetAllProjects } from '../project.handler.js';

const router = express.Router();

router.get('/projects', handleGetAllProjects);

export default router;
