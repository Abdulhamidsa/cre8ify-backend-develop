// import { Request, Response, NextFunction } from "express";
// import { getSuccessResponse, getErrorResponse } from '../../common/utils/response.handler.js';
// import { signUpUser } from './auth.service.js';
// import { verifyToken } from '../../common/utils/jwt.js';

// // Define the request body interfaces
// interface SignupRequestBody {
//   firstName: string;
//   lastName: string;
//   username: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   phoneNumber?: string;
//   address?: string;
//   profession: string;
//   country: string;
//   links?: string[];
//   profilePicture?: string;
// }

// interface SigninRequestBody {
//   email: string;
//   password: string;
// }

// // Signup handler
// export const signupHandler = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
//   try {
//     const data: SignupRequestBody = req.body;
//     await signUpUser(data);
//     return res.json(getSuccessResponse("User registered successfully"));
//   } catch (error) {
//     next(error);
//   }
// };

// // Signin handler
// export const signinHandler = async (req: Request<{}, {}, SigninRequestBody>, res: Response, next: NextFunction): Promise<Response | void> => {
//   try {
//     const { email, password }: SigninRequestBody = req.body;
//     const { accessToken, refreshToken } = await signinService({ email, password });

//     res.cookie("accessToken", accessToken, {
//       httpOnly: Boolean(process.env.HTTP_ONLY),
//       secure: Boolean(process.env.SECURE),
//       maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY) || 900000, // 15 minutes
//       path: "/",
//       sameSite: "strict",
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: Boolean(process.env.HTTP_ONLY),
//       secure: Boolean(process.env.SECURE),
//       maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) || 604800000, // 7 days
//       path: "/",
//       sameSite: "strict",
//     });

//     res.cookie("isAuthorized", "true", {
//       httpOnly: false,
//       secure: false,
//       maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY) || 900000, // 15 minutes
//       path: "/",
//       sameSite: "strict",
//     });

//     return res.json(getSuccessResponse(accessToken));
//   } catch (error) {
//     next(error);
//   }
// };

// // Signout handler
// export const signout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
//   try {
//     const accessToken = req.cookies.accessToken;
//     const refreshToken = req.cookies.refreshToken;

//     if (!accessToken && !refreshToken) {
//       return res.json(getSuccessResponse("User not logged in"));
//     }

//     if (accessToken && refreshToken) {
//       res.clearCookie("accessToken");
//       res.clearCookie("refreshToken");
//       res.clearCookie("isAuthorized");
//     }

//     return res.json(getSuccessResponse("User signed out"));
//   } catch (error) {
//     next(error);
//   }
// };

// // Required login handler (not a middleware)
// export const requiredLogin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
//   const token = req.cookies.accessToken;

//   if (!token) {
//     return res.status(401).json(getErrorResponse("Unauthorized: No access token provided"));
//   }

//   try {
//     await verifyToken(token, "access");
//     return res.json(getSuccessResponse("user authenticated"));
//   } catch (error) {
//     if ((error as Error).message !== "Token is invalid") {
//       console.error("Token verification error:", error);
//     }
//     next(error);
//   }
// };
