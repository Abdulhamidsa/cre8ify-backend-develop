import { AppError } from '../../../common/errors/app.error.js';
import { Tag } from '../../../common/models/tag.model.js';
import Logger from '../../../common/utils/logger.js';

export const addTagsService = async (tagNames: string[]): Promise<string[]> => {
  try {
    if (!Array.isArray(tagNames) || tagNames.length === 0) {
      throw new AppError('No tags provided', 400);
    }
    // Fetch existing tags and create new ones if necessary
    const existingTags = await Tag.find({ name: { $in: tagNames } }).lean();

    const existingTagNames = existingTags.map((tag) => tag.name);
    const existingTagIds = existingTags.map((tag) => tag._id.toString());

    const newTagNames = tagNames.filter((tagName) => !existingTagNames.includes(tagName));
    const newTags = await Tag.insertMany(newTagNames.map((name) => ({ name })));

    const newTagIds = newTags.map((tag) => tag.id.toString());

    return [...existingTagIds, ...newTagIds];
  } catch (error) {
    Logger.error('Error adding tags:', error);
    throw error;
  }
};
