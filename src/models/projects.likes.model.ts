import mongoose, { Model, Schema } from 'mongoose';

type ProjectLikes = {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  likedAt: Date;
};

const projectLikeSchema: Schema<ProjectLikes> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  likedAt: {
    type: Date,
    default: Date.now,
  },
});
export const ProjectLike: Model<ProjectLikes> = mongoose.model<ProjectLikes>('ProjectLike', projectLikeSchema);
