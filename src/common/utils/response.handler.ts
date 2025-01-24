export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export const createResponse = <T>(success: boolean, data?: T, message?: string): ApiResponse<T> => ({
  success,
  data,
  message,
});
