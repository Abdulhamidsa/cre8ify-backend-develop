import { RequestHandler } from 'express';

import { createResponse } from '../../common/utils/response.handler.js';
import { getAllUsersService } from './services/user.all.service.js';
import { deleteUserService } from './services/user.delete.service.js';
import { editUserProfileService } from './services/user.edit.service.js';
import { getPublicUserProfileService } from './services/user.get.by.id.service.js';
import { getUserMinimalInfoService } from './services/user.minimal.info.service.js';
import { getUserProfileService } from './services/user.profile.service.js';

export const handleGetAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const search = (req.query.search as string) || '';

    const usersData = await getAllUsersService(page, limit, search);

    res.status(200).json(createResponse(true, usersData));
  } catch (error) {
    next(error);
  }
};
// fetch user profile
export const handleFetchUserProfile: RequestHandler = async (_req, res, next) => {
  const mongoRef = res.locals.mongoRef;
  try {
    const user = await getUserProfileService(mongoRef);
    res.status(200).json(createResponse(true, user));
  } catch (error) {
    next(error);
  }
};

// fetch user minimal profile

export const handleFetchUserMinimalInfo: RequestHandler = async (_req, res, next) => {
  const mongoRef = res.locals.mongoRef;
  try {
    const user = await getUserMinimalInfoService(mongoRef);
    res.status(200).json(createResponse(true, user));
  } catch (error) {
    next(error);
  }
};
// edit user profile

export const handleEditUserProfile: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const mongoRef = res.locals.mongoRef;
    const profileData = req.body;

    if (!mongoRef) {
      res.status(401).json(createResponse(false, 'User is not authenticated'));
      return;
    }

    const updatedProfile = await editUserProfileService(mongoRef, profileData);
    res.status(200).json(createResponse(true, updatedProfile));
  } catch (error) {
    next(error);
  }
};

// delete user profile

export const handleDeleteUser: RequestHandler = async (_req, res, next): Promise<void> => {
  try {
    const mongoRef = res.locals.mongoRef;

    if (!mongoRef) {
      res.status(401).json(createResponse(false, 'User is not authenticated'));
      return;
    }

    await deleteUserService(mongoRef);
    res.status(200).json(createResponse(true, 'User account deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const handleFetchPublicUserProfile: RequestHandler = async (req, res, next) => {
  const { friendlyId } = req.params;
  try {
    const user = await getPublicUserProfileService(friendlyId);
    res.status(200).json(createResponse(true, user));
  } catch (error) {
    next(error);
  }
};
