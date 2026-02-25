import { Request, Response } from 'express';
import { db } from '../db';
import { articles, users, readLogs } from '../db/schema';
import { eq, and, isNull, ilike, or, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth';
import { baseResponse, paginatedResponse } from '../utils/response';

// Returns Public Feed
export const getPublicFeed = async (req: Request, res: Response) => {
  const { category, author, q } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const size = parseInt(req.query.size as string) || 10;

  const conditions = [
    eq(articles.status, 'Published'),
    isNull(articles.deletedAt)
  ];

  // category filter
  if (category) {
    conditions.push(eq(articles.category, category as string));
  }
  
  // search keyword 
  if (q) {
    conditions.push(
      or(
        ilike(articles.title, `%${q}%`),
        ilike(articles.content, `%${q}%`)
      ) as any
    );
  }

  const query = db.select({
      id: articles.id,
      title: articles.title,
      category: articles.category,
      authorName: users.name,
      createdAt: articles.createdAt
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id));

  if (author) {
    conditions.push(ilike(users.name, `%${author}%`));
  }

  const results = await query
    .where(and(...conditions))
    .orderBy(desc(articles.createdAt))
    .limit(size)
    .offset((page - 1) * size);

  return res.status(200).json(
    paginatedResponse(true, "News feed retrieved", results, page, size, results.length)
  );
};

// Fetch an article by ID (with Read Tracking)
export const getArticleById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Fetch the article
  const [article] = await db.select()
    .from(articles)
    .where(and(
      eq(articles.id, id as string),
      eq(articles.status, 'Published'),
      isNull(articles.deletedAt)
    ))
    .limit(1);

  if (!article) {
    return res.status(404).json(baseResponse(false, "Article not found"));
  }

  // TRIGGER: Non-blocking engagement tracking
  // We send the response to the user immediately, then handle the log

  if (!(req as any).skipLogging) {
    setImmediate(async () => {
      try {
        await db.insert(readLogs).values({
          articleId: article.id,
          readerId: req.user?.sub || null,
        });
        console.log(`Background Log: Article ${id} view recorded.`);
      } catch (err) {
        console.error("Failed to log read event:", err);
      }
    });
  }
   
 
  // 3. Return the response immediately
  return res.status(200).json(baseResponse(true, "Article retrieved", article));
};

// Create an article
export const createArticle = async (req: AuthRequest, res: Response) => {
  const { title, content, category, status } = req.body;
  const authorId = req.user!.sub; // From JWT middleware

  const [article] = await db.insert(articles).values({
    title,
    content,
    category,
    status,
    authorId,
  }).returning();

  return res.status(201).json(baseResponse(true, "Article created", article));
};

// Retrieve authored articles
export const getMyArticles = async (req: AuthRequest, res: Response) => {
  const authorId = req.user!.sub;
  const page = parseInt(req.query.page as string) || 1;
  const size = parseInt(req.query.size as string) || 10;

  const myArticles = await db.select()
    .from(articles)
    .where(eq(articles.authorId, authorId))
    .limit(size)
    .offset((page - 1) * size);

  return res.status(200).json(
    paginatedResponse(true, "Your articles", myArticles, page, size, myArticles.length)
  );
};

// Delete an Article
export const deleteArticle = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string; 
  const authorId = req.user!.sub;

  const result = await db.update(articles)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(articles.id, id),
      eq(articles.authorId, authorId)
    ))
    .returning();

  if (result.length === 0) {
    return res.status(404).json(baseResponse(false, "Article not found or unauthorized"));
  }

  return res.status(200).json(baseResponse(true, "Article soft-deleted successfully"));
};

// Update an Article
export const updateArticle = async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const authorId = req.user!.sub;
    
    const result = await db.update(articles)
      .set({ ...req.body })
      .where(and(
        eq(articles.id, id),
        eq(articles.authorId, authorId),
        isNull(articles.deletedAt) // Cannot update a deleted article
      ))
      .returning();
  
    if (result.length === 0) {
      return res.status(404).json(baseResponse(false, "Article not found or unauthorized"));
    }
  
    return res.status(200).json(baseResponse(true, "Article updated", result[0]));
};