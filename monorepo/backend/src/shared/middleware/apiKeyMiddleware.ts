import { Request, Response, NextFunction } from 'express';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = process.env.API_KEY;

  if (req.headers['x-api-key'] !== apiKey) {
    res.status(403).json({ statusCode: 403, message: 'Forbidden' });
    return;
  }

  next();
}
