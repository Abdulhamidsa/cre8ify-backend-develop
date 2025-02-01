import Professions from '../data/constants/proffesions.js';

export type IUserProfile = {
  userInfo: UserType;
  userCredential: IUserCredential;
};
export type IUserCredential = {
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
};
export type IPersonalInfo = {
  firstName: string;
  lastName: string;
  username: string;
  profilePicture: string;
  bio: string;
  profession?: typeof Professions;
  country: string;
  dateOfBirth: Date;
};

export type UserType = {
  friendlyId: string;

  personalInfo: IPersonalInfo;
  userRole: string;
  profilePicture: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
export type RegisteredUser = {
  id: string;
  email: string;
  name: string;
  age: number;
};

export type SigninInput = {
  email: string;
  password: string;
};

export type SignInResponse = {
  mongo_ref?: string;
  accessToken: string;
  refreshToken: string;
  friendlyId: string;
  userId: string;
  role?: string;
};
