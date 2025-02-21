import { RequestHandler } from 'express';

import { createResponse } from '../../common/utils/response.handler.js';
// import { FetchedProjectQueryType } from '../../common/validation/project.zod.js';
import { addProjectService } from './services/project.add.service.js';
import { deleteProjectService } from './services/project.delete.service.js';
import { editProjectService } from './services/project.edit.service.js';
import { getAllProjectsService } from './services/project.get.all.service.js';
import { getUserProjectsService } from './services/project.get.project.service.js';
import { getAllUserProjectsService } from './services/project.toggle.ai.service.js';
import { getUserProjectsByFriendlyId } from './services/project.user.getById.service.js';

export const handleAddProject: RequestHandler = async (req, res, next) => {
  const mongoRef = res.locals.mongoRef;
  const validatedData = req.body;

  try {
    const project = await addProjectService(mongoRef, validatedData);
    res.status(201).json(createResponse(true, project));
  } catch (error) {
    next(error);
  }
};

// fetch user projects

export const handleGetUserProjects: RequestHandler = async (_req, res, next) => {
  try {
    const userId = res.locals.mongoRef;
    const projects = await getUserProjectsService(userId);
    res.status(200).json(createResponse(true, projects));
  } catch (error) {
    next(error);
  }
};

// fetch public user projects
export const handleGetUserPublicProjects: RequestHandler = async (req, res, next) => {
  try {
    const { friendlyId } = req.params;
    const projects = await getUserProjectsByFriendlyId(friendlyId);
    res.status(200).json(createResponse(true, projects));
  } catch (error) {
    next(error);
  }
};
// edit user project
export const handleEditProject: RequestHandler = async (req, res, next) => {
  try {
    const mongoRef = res.locals.mongoRef;
    const projectId = req.params.id;
    const projectData = req.body;
    const updatedProject = await editProjectService(mongoRef, projectId, projectData);
    res.status(200).json(createResponse(true, updatedProject));
  } catch (error) {
    next(error);
  }
};
// delete user project
export const handleDeleteProject: RequestHandler = async (req, res, next) => {
  try {
    const mongoRef = res.locals.mongoRef;
    const projectId = req.params.id;

    await deleteProjectService(mongoRef, projectId);
    res.status(200).json(createResponse(true, 'Project deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const handleGetAllProjects: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const search = (req.query.search as string) || '';

    const projects = await getAllProjectsService(page, limit, search);
    res.status(200).json(createResponse(true, projects));
  } catch (error) {
    next(error);
  }
};

// toggle feedback ai
export const handleGetAllUserProjects: RequestHandler = async (_req, res, next) => {
  const mongoRef = res.locals.mongoRef;
  try {
    const projects = await getAllUserProjectsService(mongoRef);
    res.status(200).json(createResponse(true, projects));
  } catch (error) {
    next(error);
  }
};
