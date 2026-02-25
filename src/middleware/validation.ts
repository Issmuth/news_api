import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { baseResponse } from '../utils/response';

const invalidTypeError = "Invalid input type";

// User Story 1: Strict Validation Criteria
export const signupSchema = z.object({
  body: z.object({
    name: z.string().regex(/^[a-zA-Z\s]+$/, "Name must contain only alphabets and spaces"),
    email: z.string().email("Invalid email format"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password requires at least one uppercase letter")
      .regex(/[a-z]/, "Password requires at least one lowercase letter")
      .regex(/[0-9]/, "Password requires at least one number")
      .regex(/[^A-Za-z0-9]/, "Password requires at least one special character"),
    role: z.enum(['author', 'reader'], invalidTypeError),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
});
// Updated Validation Middleware with explicit typing
export const validate = (schema: z.ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Use .issues for better compatibility and type the 'issue'
        const errorMessages = error.issues.map((issue: z.ZodIssue) => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        
        return res.status(400).json(
          baseResponse(false, "Validation failed", null, errorMessages)
        );
      }
      return res.status(500).json(
        baseResponse(false, "Internal server error", null, ["Unknown validation error"])
      );
    }
};