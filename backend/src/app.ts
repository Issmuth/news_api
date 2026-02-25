import express from 'express';
import 'express-async-errors';
import routes from './routes'; // Points to src/routes/index.ts
import { baseResponse } from './utils/response';

const app = express();

app.use(express.json());

// Main Router Entry
app.use('/api', routes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json(
    baseResponse(false, "An error occurred", null, [err.message || "Internal Server Error"])
  );
});

export default app;