import { Router } from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import { adminSigninSchema } from '../../../common/validation/admin.signin.zod.js';
import { signInSchema, signUpSchema } from '../../../common/validation/user.zod.js';
import { refreshTokenHandler, signInHandler, signupHandler } from '../auth.handlers.js';
import { handleAdminRefreshToken } from '../controllers/admin.refresh.token.handler.js';
import { handleAdminSignin } from '../controllers/admin.signin.handler.js';

const router = Router();

router.post('/signup', ValidZod(signUpSchema, 'body'), signupHandler);
router.post('/signin', ValidZod(signInSchema, 'body'), signInHandler);
router.post('/admin-signin', ValidZod(adminSigninSchema, 'body'), handleAdminSignin);
router.post('/refresh-token', refreshTokenHandler);
router.post('/admin-refresh-token', handleAdminRefreshToken);

export default router;
