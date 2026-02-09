import mongoose from 'mongoose';

import { getSQLClient } from '../../common/config/sql.client.js';
import { AppError } from '../../common/errors/app.error.js';
import { Post } from '../../common/models/post.model.js';
import { Project } from '../../common/models/projects.model.js';
import { User } from '../../common/models/user.model.js';
import { getErrorMessage } from '../../common/utils/error.utils.js';
import Logger from '../../common/utils/logger.js';
import { SQL_QUERIES } from '../../common/utils/sql.constants.js';

/**
 * Admin service to get all users with pagination
 */
export const adminGetAllUsersService = async (
  page: number = 1,
  limit: number = 20,
  search: string = '',
  adminMongoRef: string,
) => {
  const sqlClient = await getSQLClient();

  try {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await sqlClient.query(SQL_QUERIES.getUserCount);
    const totalUsers = parseInt(countResult.rows[0].total);

    // Get users from MongoDB with search functionality
    const searchQuery = search
      ? {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { friendlyId: { $regex: search, $options: 'i' } },
            { bio: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(searchQuery)
      .select('mongoRef username friendlyId profilePicture bio active createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Get corresponding SQL data for each user
    const usersWithSqlData = await Promise.all(
      users.map(async (user: (typeof users)[0]) => {
        try {
          const sqlResult = await sqlClient.query(
            'SELECT email, role, active, deleted_at FROM users WHERE mongo_ref = $1',
            [user.mongoRef],
          );

          return {
            ...user,
            email: sqlResult.rows[0]?.email || 'N/A',
            role: sqlResult.rows[0]?.role || 'user',
            sqlActive: sqlResult.rows[0]?.active || false,
            deletedAt: sqlResult.rows[0]?.deleted_at || null,
          };
        } catch (error) {
          Logger.error(`Error fetching SQL data for user ${user.mongoRef}: ${getErrorMessage(error)}`);
          return {
            ...user,
            email: 'Error loading',
            role: 'user',
            sqlActive: false,
            deletedAt: null,
          };
        }
      }),
    );

    // Log admin action
    Logger.info('Admin accessed user list', {
      adminUser: adminMongoRef,
      action: 'view_all_users',
      page,
      limit,
      search,
      totalUsers,
      timestamp: new Date().toISOString(),
    });

    return {
      users: usersWithSqlData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        usersPerPage: limit,
      },
    };
  } finally {
    sqlClient.release();
  }
};

/**
 * Admin service to force delete/deactivate a user
 */
export const adminDeleteUserService = async (targetUserId: string, adminMongoRef: string): Promise<void> => {
  const sqlClient = await getSQLClient();

  try {
    await sqlClient.query('BEGIN');

    // Prevent admin from deleting themselves
    if (targetUserId === adminMongoRef) {
      throw new AppError('Cannot delete your own admin account', 400);
    }

    // Check if target user exists in MongoDB (optional - allow deletion even if not found)
    const mongoUser = await User.findOne({ mongoRef: targetUserId });

    // Check if target user is also a super admin
    const targetAdminCheck = await sqlClient.query(SQL_QUERIES.checkSuperAdmin, [targetUserId, 'super_admin']);
    if (targetAdminCheck.rows.length > 0) {
      throw new AppError('Cannot delete another super admin account', 403);
    }

    // Deactivate user in PostgreSQL (if exists - don't fail if not found)
    const sqlResult = await sqlClient.query(SQL_QUERIES.forceDeactivateUser, [targetUserId]);

    // Soft delete user in MongoDB (if exists)
    if (mongoUser) {
      await User.updateOne({ mongoRef: targetUserId }, { active: false, deletedAt: new Date() });
    }

    await sqlClient.query('COMMIT');

    // Log admin action
    Logger.warn('Admin deleted user account', {
      adminUser: adminMongoRef,
      action: 'delete_user',
      targetUser: targetUserId,
      targetUsername: mongoUser?.username || 'User not found in MongoDB',
      deletedFromSQL: sqlResult.rows.length > 0,
      deletedFromMongo: !!mongoUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await sqlClient.query('ROLLBACK');
    throw error;
  } finally {
    sqlClient.release();
  }
};

/**
 * Admin service to delete any project
 */
export const adminDeleteProjectService = async (projectId: string, adminMongoRef: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new AppError('Invalid project ID format', 400);
  }

  const project = await Project.findById(projectId).populate('userId', 'username friendlyId');
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Store project info for logging before deletion
  const projectInfo = {
    title: project.title,
    ownerId: project.userId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ownerUsername: (project.userId as any)?.username || 'Unknown',
  };

  await Project.findByIdAndDelete(projectId);

  // Log admin action
  Logger.warn('Admin deleted project', {
    adminUser: adminMongoRef,
    action: 'delete_project',
    projectId,
    projectTitle: projectInfo.title,
    projectOwner: projectInfo.ownerId,
    projectOwnerUsername: projectInfo.ownerUsername,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Admin service to delete any post
 */
export const adminDeletePostService = async (postId: string, adminMongoRef: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post ID format', 400);
  }

  const post = await Post.findById(postId).populate('userId', 'username friendlyId');
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Store post info for logging before deletion
  const postInfo = {
    content: post.content?.substring(0, 100) + (post.content && post.content.length > 100 ? '...' : ''),
    ownerId: post.userId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ownerUsername: (post.userId as any)?.username || 'Unknown',
  };

  await Post.findByIdAndDelete(postId);

  // Log admin action
  Logger.warn('Admin deleted post', {
    adminUser: adminMongoRef,
    action: 'delete_post',
    postId,
    postContent: postInfo.content,
    postOwner: postInfo.ownerId,
    postOwnerUsername: postInfo.ownerUsername,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Admin service to get all posts with pagination
 */
export const adminGetAllPostsService = async (
  page: number = 1,
  limit: number = 20,
  search: string = '',
  adminMongoRef: string,
) => {
  const offset = (page - 1) * limit;

  // Build search query
  const searchQuery = search
    ? {
        $or: [
          { content: { $regex: search, $options: 'i' } },
          { 'userId.username': { $regex: search, $options: 'i' } },
          { 'userId.friendlyId': { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  // Get total count
  const totalPosts = await Post.countDocuments(searchQuery);

  // Get posts with user details
  const posts = await Post.find(searchQuery)
    .populate('userId', 'username friendlyId profilePicture')
    .select('content image likes comments createdAt updatedAt')
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  // Format posts with additional admin info
  const formattedPosts = posts.map((post) => ({
    _id: post._id,
    content: post.content,
    image: post.image,
    likesCount: post.likes?.length || 0,
    commentsCount: post.comments?.length || 0,
    userId: post.userId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    // Add first few comments for admin preview
    recentComments:
      post.comments?.slice(0, 3).map((comment) => ({
        _id: comment._id,
        content: comment.text?.substring(0, 100) + (comment.text && comment.text.length > 100 ? '...' : ''),
        userId: comment.userId,
        createdAt: comment.createdAt,
      })) || [],
  }));

  // Log admin action
  Logger.info('Admin accessed posts list', {
    adminUser: adminMongoRef,
    action: 'view_all_posts',
    page,
    limit,
    search,
    totalPosts,
    timestamp: new Date().toISOString(),
  });

  return {
    posts: formattedPosts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      postsPerPage: limit,
    },
  };
};

/**
 * Admin service to get all projects with pagination
 */
export const adminGetAllProjectsService = async (
  page: number = 1,
  limit: number = 20,
  search: string = '',
  adminMongoRef: string,
) => {
  const offset = (page - 1) * limit;

  // Build search query
  const searchQuery = search
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'userId.username': { $regex: search, $options: 'i' } },
          { 'userId.friendlyId': { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  // Get total count
  const totalProjects = await Project.countDocuments(searchQuery);

  // Get projects with user details
  const projects = await Project.find(searchQuery)
    .populate('userId', 'username friendlyId profilePicture')
    .populate('tags', 'name')
    .select('title description media feedback tags createdAt updatedAt')
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  // Format projects with additional admin info
  const formattedProjects = projects.map((project) => ({
    _id: project._id,
    title: project.title,
    description:
      project.description?.substring(0, 200) + (project.description && project.description.length > 200 ? '...' : ''),
    media: project.media,
    feedbackCount: project.feedback?.length || 0,
    tagsCount: project.tags?.length || 0,
    tags: project.tags,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }));

  // Log admin action
  Logger.info('Admin accessed projects list', {
    adminUser: adminMongoRef,
    action: 'view_all_projects',
    page,
    limit,
    search,
    totalProjects,
    timestamp: new Date().toISOString(),
  });

  return {
    projects: formattedProjects,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalProjects / limit),
      totalProjects,
      projectsPerPage: limit,
    },
  };
};

/**
 * Admin service to get detailed post with all comments
 */
export const adminGetPostDetailsService = async (postId: string, adminMongoRef: string) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError('Invalid post ID format', 400);
  }

  const post = await Post.findById(postId)
    .populate('userId', 'username friendlyId profilePicture')
    .populate('comments.userId', 'username friendlyId profilePicture')
    .lean();

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Log admin action
  Logger.info('Admin viewed post details', {
    adminUser: adminMongoRef,
    action: 'view_post_details',
    postId,
    timestamp: new Date().toISOString(),
  });

  return {
    _id: post._id,
    content: post.content,
    image: post.image,
    likes: post.likes,
    likesCount: post.likes?.length || 0,
    userId: post.userId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    comments:
      post.comments?.map((comment) => ({
        _id: comment._id,
        content: comment.text,
        userId: comment.userId,
        createdAt: comment.createdAt,
      })) || [],
    commentsCount: post.comments?.length || 0,
  };
};

/**
 * Admin service to get specific user's posts with pagination
 */
export const adminGetUserPostsService = async (
  userFriendlyId: string,
  page: number = 1,
  limit: number = 20,
  search: string = '',
  adminMongoRef: string = '',
) => {
  // Find the user by friendlyId
  const user = await User.findOne({ friendlyId: userFriendlyId }).select('_id username friendlyId').lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const offset = (page - 1) * limit;

  // Build search query for user's posts
  const postQuery = { userId: user._id, ...(search && { content: { $regex: search, $options: 'i' } }) };

  // Get total count for this user
  const totalPosts = await Post.countDocuments(postQuery);

  // Get user's posts
  const posts = await Post.find(postQuery)
    .populate('userId', 'username friendlyId profilePicture')
    .select('content image likes comments createdAt updatedAt')
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  // Format posts with additional admin info
  const formattedPosts = posts.map((post) => ({
    _id: post._id,
    content: post.content,
    image: post.image,
    likesCount: post.likes?.length || 0,
    commentsCount: post.comments?.length || 0,
    userId: post.userId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    // Add first few comments for admin preview
    recentComments:
      post.comments?.slice(0, 3).map((comment) => ({
        _id: comment._id,
        content: comment.text?.substring(0, 100) + (comment.text && comment.text.length > 100 ? '...' : ''),
        userId: comment.userId,
        createdAt: comment.createdAt,
      })) || [],
  }));

  // Log admin action
  Logger.info('Admin accessed user posts', {
    adminUser: adminMongoRef,
    action: 'view_user_posts',
    targetUser: userFriendlyId,
    page,
    limit,
    totalPosts,
    timestamp: new Date().toISOString(),
  });

  return {
    user: {
      username: user.username,
      friendlyId: user.friendlyId,
    },
    posts: formattedPosts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      postsPerPage: limit,
    },
  };
};

/**
 * Admin service to get specific user's projects with pagination
 */
export const adminGetUserProjectsService = async (
  userFriendlyId: string,
  page: number = 1,
  limit: number = 20,
  search: string = '',
  adminMongoRef: string = '',
) => {
  // Find the user by friendlyId
  const user = await User.findOne({ friendlyId: userFriendlyId }).select('_id username friendlyId').lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const offset = (page - 1) * limit;

  // Build search query for user's projects
  const projectQuery = {
    userId: user._id,
    ...(search && {
      $or: [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }],
    }),
  };

  // Get total count for this user
  const totalProjects = await Project.countDocuments(projectQuery);

  // Get user's projects
  const projects = await Project.find(projectQuery)
    .populate('userId', 'username friendlyId profilePicture')
    .populate('tags', 'name')
    .select('title description media feedback tags createdAt updatedAt')
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  // Format projects with additional admin info
  const formattedProjects = projects.map((project) => ({
    _id: project._id,
    title: project.title,
    description:
      project.description?.substring(0, 200) + (project.description && project.description.length > 200 ? '...' : ''),
    media: project.media,
    feedbackCount: project.feedback?.length || 0,
    tagsCount: project.tags?.length || 0,
    tags: project.tags,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }));

  // Log admin action
  Logger.info('Admin accessed user projects', {
    adminUser: adminMongoRef,
    action: 'view_user_projects',
    targetUser: userFriendlyId,
    page,
    limit,
    totalProjects,
    timestamp: new Date().toISOString(),
  });

  return {
    user: {
      username: user.username,
      friendlyId: user.friendlyId,
    },
    projects: formattedProjects,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalProjects / limit),
      totalProjects,
      projectsPerPage: limit,
    },
  };
};

/**
 * Admin service to get posts where specific user commented
 */
export const adminGetUserCommentsService = async (
  userFriendlyId: string,
  page: number = 1,
  limit: number = 20,
  search: string = '',
  adminMongoRef: string = '',
) => {
  // Find the user by friendlyId
  const user = await User.findOne({ friendlyId: userFriendlyId }).select('_id username friendlyId').lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const offset = (page - 1) * limit;

  // Build search query for posts where user commented
  const query: Record<string, unknown> = { 'comments.userId': user._id };

  if (search) {
    query.$or = [
      { content: { $regex: search, $options: 'i' } },
      { 'comments.text': { $regex: search, $options: 'i' } },
    ];
  }

  // Get posts where user commented
  const postsWithUserComments = await Post.find(query)
    .populate('userId', 'username friendlyId profilePicture')
    .populate('comments.userId', 'username friendlyId profilePicture')
    .select('content image userId comments createdAt')
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  // Get total count
  const totalPostsWithComments = await Post.countDocuments(query);

  // Format posts and filter comments to show only user's comments
  const formattedPosts = postsWithUserComments.map((post) => {
    const userComments = post.comments.filter((comment) => comment.userId._id.toString() === user._id.toString());

    return {
      _id: post._id,
      content: post.content,
      image: post.image,
      postOwner: post.userId,
      userComments: userComments.map((comment) => ({
        _id: comment._id,
        content: comment.text,
        createdAt: comment.createdAt,
      })),
      totalCommentsOnPost: post.comments.length,
      userCommentsCount: userComments.length,
      createdAt: post.createdAt,
    };
  });

  // Log admin action
  Logger.info('Admin accessed user comments', {
    adminUser: adminMongoRef,
    action: 'view_user_comments',
    targetUser: userFriendlyId,
    page,
    limit,
    totalPostsWithComments,
    timestamp: new Date().toISOString(),
  });

  return {
    user: {
      username: user.username,
      friendlyId: user.friendlyId,
    },
    posts: formattedPosts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalPostsWithComments / limit),
      totalPosts: totalPostsWithComments,
      postsPerPage: limit,
    },
  };
};

/**
 * Admin service to get flat list of comments by specific user (Frontend-friendly format)
 */
export const adminGetUserCommentsFlat = async (
  userFriendlyId: string,
  page: number = 1,
  limit: number = 20,
  search: string = '',
  adminMongoRef: string = '',
) => {
  // Find the user by friendlyId
  const user = await User.findOne({ friendlyId: userFriendlyId }).select('_id username friendlyId').lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get all posts with comments by this user
  const postsWithUserComments = await Post.find({
    'comments.userId': user._id,
  })
    .populate('userId', 'username friendlyId profilePicture')
    .populate('comments.userId', 'username friendlyId profilePicture')
    .select('content image userId comments createdAt')
    .lean();

  // Extract and flatten all comments by this user
  interface FlatComment {
    _id: string;
    content: string;
    createdAt: Date;
    postId: string;
    postContent: string;
    postOwner: Record<string, unknown>;
  }
  let allUserComments: FlatComment[] = [];

  postsWithUserComments.forEach((post) => {
    const userCommentsInPost = post.comments.filter((comment) => comment.userId._id.toString() === user._id.toString());

    userCommentsInPost.forEach((comment) => {
      allUserComments.push({
        _id: comment._id.toString(),
        content: comment.text || 'No content available',
        createdAt: comment.createdAt,
        postId: post._id.toString(),
        postContent: post.content?.substring(0, 100) + (post.content && post.content.length > 100 ? '...' : ''),
        postOwner: post.userId as Record<string, unknown>,
      });
    });
  });

  // Apply search filter to comments
  if (search) {
    allUserComments = allUserComments.filter(
      (comment) =>
        comment.content?.toLowerCase().includes(search.toLowerCase()) ||
        comment.postContent?.toLowerCase().includes(search.toLowerCase()),
    );
  }

  // Sort comments by creation date (newest first)
  allUserComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Apply pagination
  const totalComments = allUserComments.length;
  const offset = (page - 1) * limit;
  const paginatedComments = allUserComments.slice(offset, offset + limit);

  // Log admin action
  Logger.info('Admin accessed user comments (flat)', {
    adminUser: adminMongoRef,
    action: 'view_user_comments_flat',
    targetUser: userFriendlyId,
    page,
    limit,
    totalComments,
    timestamp: new Date().toISOString(),
  });

  return {
    user: {
      username: user.username,
      friendlyId: user.friendlyId,
    },
    comments: paginatedComments,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments: totalComments,
      commentsPerPage: limit,
    },
  };
};

/**
 * Admin service to get system analytics
 */
export const adminGetAnalyticsService = async (adminMongoRef: string) => {
  const sqlClient = await getSQLClient();

  try {
    // Get user statistics
    const totalUsersResult = await sqlClient.query('SELECT COUNT(*) as total FROM users WHERE active = true');
    const totalUsers = parseInt(totalUsersResult.rows[0].total);

    const inactiveUsersResult = await sqlClient.query('SELECT COUNT(*) as total FROM users WHERE active = false');
    const inactiveUsers = parseInt(inactiveUsersResult.rows[0].total);

    // Get MongoDB statistics
    const totalProjects = await Project.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalTags = (await mongoose.connection.db?.collection('tags').countDocuments()) || 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentProjects = await Project.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentPosts = await Post.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Log admin action
    Logger.info('Admin accessed analytics', {
      adminUser: adminMongoRef,
      action: 'view_analytics',
      timestamp: new Date().toISOString(),
    });

    return {
      users: {
        total: totalUsers,
        active: totalUsers,
        inactive: inactiveUsers,
        recentlyRegistered: recentUsers,
      },
      content: {
        totalProjects,
        totalPosts,
        totalTags,
        recentProjects,
        recentPosts,
      },
      activity: {
        period: 'Last 7 days',
        newUsers: recentUsers,
        newProjects: recentProjects,
        newPosts: recentPosts,
      },
      generatedAt: new Date().toISOString(),
    };
  } finally {
    sqlClient.release();
  }
};
