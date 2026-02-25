import app from './app';
import dotenv from 'dotenv';
import './workers/anayltics.worker';
import { startQueue, triggerManualSync } from './services/queue.service';

dotenv.config();


const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await startQueue();  
  // Run once on startup to ensure data is fresh
  await triggerManualSync();
  console.log(`
  🚀 Server ready at: http://localhost:${PORT}
  🛠️  Environment: ${process.env.NODE_ENV || 'development'}
  `);
});