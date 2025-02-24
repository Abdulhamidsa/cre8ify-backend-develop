import { Router } from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import { editUserSchema } from '../../../common/validation/user.zod.js';
import {
  handleDeleteUser,
  handleEditUserProfile,
  handleFetchUserMinimalInfo,
  handleFetchUserProfile,
} from '../user.handler.js';

const router = Router();

router.get('/profile/:friendlyId', handleFetchUserProfile);
router.put('/profile', ValidZod(editUserSchema, 'body'), handleEditUserProfile);
router.delete('/user', handleDeleteUser);
router.get('/logged-user', handleFetchUserMinimalInfo);

export default router;
