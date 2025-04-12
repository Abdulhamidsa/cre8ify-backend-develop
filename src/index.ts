import { connectMongoDB } from './common/config/mongo.connection.js';
import { SECRETS } from './common/config/secrets.js';
import Logger from './common/utils/logger.js';
import app from './server.js';

const PORT = SECRETS.port;

const start = async (): Promise<void> => {
  try {
    await connectMongoDB();
    Logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      Logger.info(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
};
start();
