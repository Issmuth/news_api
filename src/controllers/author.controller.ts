import { Request, Response } from 'express';
import { db } from '../db';
import { articles, dailyAnalytics } from '../db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth';
import { baseResponse } from '../utils/response';

export const getAuthorDashboard = async (req: AuthRequest, res: Response) => {
  const authorId = req.user!.sub;

  const stats = await db.select({
      articleId: articles.id,
      title: articles.title,
      views: sql<number>`CAST(COALESCE(SUM(${dailyAnalytics.viewCount}), 0) AS INTEGER)`
    })
    .from(articles)
    .leftJoin(dailyAnalytics, eq(articles.id, dailyAnalytics.articleId))
    .where(and(eq(articles.authorId, authorId), isNull(articles.deletedAt)))
    .groupBy(articles.id, articles.title);

  return res.status(200).json(baseResponse(true, "Performance stats", stats));
};