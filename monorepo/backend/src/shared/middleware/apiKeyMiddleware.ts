import { Request, Response, NextFunction } from 'express';

const swaggerPaths = ['/docs', '/docs-json', '/docs/'];

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (swaggerPaths.some((p) => req.path.startsWith(p))) {
    next();
    return;
  }

  const apiKey = process.env.API_KEY;

  if (req.headers['x-api-key'] !== apiKey) {
    res.status(403).json({ statusCode: 403, message: 'Forbidden' });
    return;
  }

  next();
}
