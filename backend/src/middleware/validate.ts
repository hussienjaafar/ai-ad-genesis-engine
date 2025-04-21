
import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation Error',
          details: result.error.format()
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation Error',
          details: result.error.format()
        });
      }
      req.query = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}
