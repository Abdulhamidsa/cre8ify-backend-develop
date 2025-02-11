import { start } from './server.js';

if (process.env.NODE_ENV !== 'serverless') {
  start();
}
