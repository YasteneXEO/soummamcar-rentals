import app from './app.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚗 SoummamCar API running on port ${PORT}`);
  logger.info(`   Environment: ${env.NODE_ENV}`);
  logger.info(`   Health: http://localhost:${PORT}/api/health`);
});
