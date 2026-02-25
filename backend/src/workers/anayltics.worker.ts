import { Worker } from 'bullmq';
import { runAnalyticsAggregation } from '../services/analytics.service';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

export const analyticsWorker = new Worker(
  'analytics-queue',
  async (job) => {
    if (job.name === 'daily-sync') {
      console.log('BullMQ: Running GMT Analytics Aggregation...');
      await runAnalyticsAggregation();
    }
  },
  { connection }
);

analyticsWorker.on('completed', (job) => console.log(`Job ${job.id} completed`));
analyticsWorker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));