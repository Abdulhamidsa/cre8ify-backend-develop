import { NextFunction, Request, Response } from 'express';

import { getSQLClient } from '../config/sql.client.js';
import { AppError } from '../errors/app.error.js';
import { getErrorMessage } from '../utils/error.utils.js';
import Logger from '../utils/logger.js';
import { createResponse } from '../utils/response.handler.js';
import { SQL_QUERIES } from '../utils/sql.constants.js';

/**
 * Middleware to verify super admin access
 * This middleware should be used after authentication middleware
 */
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const mongoRef = res.locals.mongoRef;

    // Verify user is authenticated
    if (!mongoRef) {
      throw new AppError('Authentication required', 401);
    }

    const sqlClient = await getSQLClient();

    try {
      // Check if user has super_admin role
      const adminCheck = await sqlClient.query(SQL_QUERIES.checkSuperAdmin, [mongoRef, 'super_admin']);

      if (adminCheck.rows.length === 0) {
        Logger.warn(`Unauthorized super admin access attempt by user: ${mongoRef}`, {
          mongoRef,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
        });
        throw new AppError('Super admin access required. This incident has been logged.', 403);
      }

      // Log successful admin access
      Logger.info(`Super admin access granted to user: ${mongoRef}`, {
        mongoRef,
        action: 'admin_access_granted',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });

      next();
    } finally {
      sqlClient.release();
    }
  } catch (error) {
    const message = getErrorMessage(error);
    Logger.error(`Error in super admin middleware: ${message}`, {
      mongoRef: res.locals.mongoRef,
      error: message,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(error instanceof AppError ? error.status : 500).json(createResponse(false, undefined, message));
  }
};

/**
 * Logs admin actions for audit trail
 */
export const logAdminAction = (action: string, targetId?: string, additionalInfo?: Record<string, unknown>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const mongoRef = res.locals.mongoRef;

    Logger.info(`Admin Action: ${action}`, {
      adminUser: mongoRef,
      action,
      targetId: targetId || req.params.id || req.params.userId || req.params.projectId || req.params.postId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      requestBody: req.method !== 'GET' ? req.body : undefined,
      additionalInfo,
    });

    next();
  };
};
