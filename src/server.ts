import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';

import { corsOptions } from './common/config/cors.js';
import expressErrorMiddleware from './common/middleware/error.middleware.js';
import routes from './routes/index.js';

const app = express();
// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middlewares
app.use(cookieParser());
app.use(bodyParser.json());
app.use(limiter);
app.use(express.json());
app.use(cors(corsOptions));
// Routes
app.get('/', (_req: Request, res: Response) => {
  res.send('SERVER IS RUNNING MY FAMALAM READY FOR REQUESTS');
});
app.use('/api', routes);
// Error handling middleware
app.use(expressErrorMiddleware);
// Start function

export default app;
