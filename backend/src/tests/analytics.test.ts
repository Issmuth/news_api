import { triggerManualSync } from '../services/queue.service';
import { runAnalyticsAggregation } from '../services/analytics.service';
import { db } from '../db';
import { PgDialect } from 'drizzle-orm/pg-core';

// Mock BullMQ and Redis
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'bull-job-123' }),
  })),
  Worker: jest.fn(),
}));
jest.mock('ioredis', () => jest.fn());

describe('Analytics Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enqueue a daily-sync job', async () => {
    const job = await triggerManualSync();
    expect(job.id).toBe('bull-job-123');
  });

  it('should execute the correct GMT SQL during aggregation', async () => {
    const dbSpy = jest.spyOn(db, 'execute').mockResolvedValue({} as any);

    await runAnalyticsAggregation();

    expect(dbSpy).toHaveBeenCalled();

    // 1. Get the SQL object from the first call
    const sqlObject = dbSpy.mock.calls[0][0] as any;

    // 2. USE THE DIALECT TO COMPILE THE SQL
    // This turns the Drizzle 'chunks' into a real SQL string
    const dialect = new PgDialect();
    const compiledQuery = dialect.sqlToQuery(sqlObject);
    
    const queryLower = compiledQuery.sql.toLowerCase();

    // 3. Robust Assertions
    expect(queryLower).toContain('daily_analytics');
    expect(queryLower).toContain('gmt');
    expect(queryLower).toContain('on conflict');
  });
});