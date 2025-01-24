import { Document, Model } from 'mongoose';

/**
 * Generic MongoDB service to save a document.
 * @param model - The Mongoose model to use.
 * @param data - The data to save.
 */

/**
 * Generic MongoDB service to save a document.
 * @param model - The Mongoose model to use.
 * @param data - The data to save.
 */
export const saveDocument = async <T extends Document>(model: Model<T>, data: Partial<T>): Promise<T> => {
  const document = new model(data);

  return await document.save();
};

/**
 * Generic MongoDB service to find a document by criteria.
 * @param model - The Mongoose model to use.
 * @param criteria - The search criteria.
 */
export const findDocument = async <T>(model: Model<T>, criteria: Partial<T>): Promise<T | null> => {
  return await model.findOne(criteria);
};

/**
 * Generic MongoDB service to update a document.
 * @param model - The Mongoose model to use.
 * @param criteria - The criteria to find the document.
 * @param updateData - The data to update.
 */
export const updateDocument = async <T>(
  model: Model<T>,
  criteria: Partial<T>,
  updateData: Partial<T>,
): Promise<T | null> => {
  return await model.findOneAndUpdate(criteria, updateData, { new: true });
};
