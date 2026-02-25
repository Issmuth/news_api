import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

export const analyticsQueue = new Queue('analytics-queue', { connection });

export const startQueue = async () => {
  // Requirement: Daily processing in GMT
  // This adds a repeatable job at 01:00 AM every day
  await analyticsQueue.add(
    'daily-sync',
    {},
    {
      repeat: {
        pattern: '0 1 * * *', // GMT Cron
      },
    }
  );
  console.log('BullMQ: Daily sync scheduled for 01:00 AM GMT');
};

export const triggerManualSync = async () => {
    console.log('Triggering manual analytics sync...');
    return await analyticsQueue.add('daily-sync', { manual: true });
};