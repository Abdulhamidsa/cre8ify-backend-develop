import { Router } from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import { createResponse } from '../../../common/utils/response.handler.js';
import { updateCredentialsSchema } from '../../../common/validation/user.zod.js';
import { fetchCredentialsHandler, signoutHandler, updateCredentialsHandler } from '../auth.handlers.js';

const router = Router();

router.get('/refresh', (_req, res) => {
  res.status(200).json(
    createResponse(true, {
      message: 'Token refreshed successfully',
    }),
  );
});

router.get('/credentials', fetchCredentialsHandler);
router.put('/credentials', ValidZod(updateCredentialsSchema), updateCredentialsHandler);
router.post('/signout', signoutHandler);

export default router;
