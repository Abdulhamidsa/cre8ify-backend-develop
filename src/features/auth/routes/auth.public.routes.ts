import { Router } from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import { signInSchema, signUpSchema } from '../../../common/validation/user.zod.js';
import { refreshTokenHandler, signInHandler, signupHandler } from '../auth.handlers.js';

const router = Router();

router.post('/signup', ValidZod(signUpSchema, 'body'), signupHandler);
router.post('/signin', ValidZod(signInSchema, 'body'), signInHandler);
router.post('/refresh-token', refreshTokenHandler);

export default router;
