import { db } from '../db';
import { dailyAnalytics, readLogs } from '../db/schema';
import { sql } from 'drizzle-orm';

export const runAnalyticsAggregation = async () => {
  console.log("Syncing Daily Analytics...");
  
  return await db.execute(sql`
    INSERT INTO daily_analytics (article_id, date, view_count)
    SELECT 
      article_id, 
      (read_at AT TIME ZONE 'GMT')::date as day, 
      COUNT(*) as count
    FROM read_logs
    GROUP BY article_id, day
    ON CONFLICT (article_id, date) 
    DO UPDATE SET 
      view_count = EXCLUDED.view_count;
  `);
};