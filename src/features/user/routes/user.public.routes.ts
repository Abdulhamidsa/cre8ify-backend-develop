import express from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import { getAllUsersValidationSchema } from '../../../common/validation/user.zod.js';
import { handleFetchPublicUserProfile, handleGetAllUsers } from '../user.handler.js';

const router = express.Router();

router.get('/users', ValidZod(getAllUsersValidationSchema), handleGetAllUsers);
router.get('/user/:friendlyId', handleFetchPublicUserProfile);
router.get('/profile/:friendlyId', handleFetchPublicUserProfile);

export default router;
