// import bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import express, { Request, Response } from 'express';
// import { rateLimit } from 'express-rate-limit';
// import { corsOptions } from './common/config/cors.js';
// import { connectMongoDB } from './common/config/mongo.connection.js';
// import { SECRETS } from './common/config/secrets.js';
// import expressErrorMiddleware from './common/middleware/error.middleware.js';
// import Logger from './common/utils/logger.js';
// import routes from './routes/index.js';
// const app = express();
// const PORT = SECRETS.port;
// // Rate limiter middleware
// // At the top of your server file, after creating the Express app:
// app.set('trust proxy', true);
// // Then, when you set up express-rate-limit:
// app.use(
//   rateLimit({
//     windowMs: 60 * 1000, // 1 minute
//     max: 100, // limit each IP to 100 requests per window
//     standardHeaders: true,
//     legacyHeaders: false,
//     keyGenerator: (req) => {
//       // Check for x-forwarded-for header (Vercel sends this)
//       const xForwardedFor = req.headers['x-forwarded-for'];
//       if (xForwardedFor) {
//         // If there are multiple IPs, take the first one.
//         return (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor).split(',')[0].trim();
//       }
//       // Fallback to req.ip or connection remoteAddress
//       return req.ip || (req.connection && req.connection.remoteAddress) || '';
//     },
//   }),
// );
// // Middlewares
// app.use(cookieParser());
// app.use(bodyParser.json());
// // app.use(limiter);
// app.use(express.json());
// app.use(cors(corsOptions));
// // Routes
// app.get('/', (_req: Request, res: Response) => {
//   res.send('SERVER IS RUNNING');
// });
// app.get('/ping', (_req, res) => {
//   res.send('pong');
// });
// app.use('/', routes);
// // Error handling middleware
// app.use(expressErrorMiddleware);
// // Start function
// export const start = async (): Promise<void> => {
//   try {
//     await connectMongoDB();
//     Logger.info('Connected to SQL and MongoDB');
//     app.listen(PORT, () => {
//       Logger.info(`Server running at http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     Logger.error(error);
//     process.exit(1);
//   }
// };
// export default app;
import express, { Request, Response } from 'express';

const app = express();

app.get('/ping', (_req: Request, res: Response) => {
  res.send('pong');
});

export default app;
