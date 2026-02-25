import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { baseResponse } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_dev';

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // Check for duplicate email
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    // 409 Conflict required by User Story 1
    return res.status(409).json(baseResponse(false, "Signup failed", null, ["Email already exists"]));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [newUser] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    role,
  }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  return res.status(201).json(baseResponse(true, "User created successfully", newUser));
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userRecord = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (userRecord.length === 0) {
    return res.status(401).json(baseResponse(false, "Login failed", null, ["Invalid credentials"]));
  }

  const user = userRecord[0];
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return res.status(401).json(baseResponse(false, "Login failed", null, ["Invalid credentials"]));
  }

  // Generate JWT with sub and role claims, 24h expiration
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(200).json(baseResponse(true, "Login successful", { token }));
};