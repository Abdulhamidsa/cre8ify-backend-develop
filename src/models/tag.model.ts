import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  name: string;
}

const TagSchema: Schema<ITag> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const Tag = mongoose.model<ITag>('Tag', TagSchema);
