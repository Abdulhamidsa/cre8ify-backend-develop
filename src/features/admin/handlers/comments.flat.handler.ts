import { RequestHandler } from 'express';

import { createResponse } from '../../../common/utils/response.handler.js';
import { adminGetUserCommentsFlat } from '../admin.service.js';

/**
 * Handler for getting flattened user comments
 * Used by the frontend to display all comments from a user in a flat list
 */
export const handleAdminGetUserCommentsFlat: RequestHandler = async (req, res, next) => {
  try {
    const { friendlyId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string) || '';
    const adminMongoRef = res.locals.mongoRef;

    // Get flattened comments
    const result = await adminGetUserCommentsFlat(friendlyId, page, limit, search, adminMongoRef);

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    next(error);
  }
};
