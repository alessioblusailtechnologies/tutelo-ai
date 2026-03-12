import 'dotenv/config';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { startEmailPolling } from './services/email-polling/index.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
  startEmailPolling();
});
