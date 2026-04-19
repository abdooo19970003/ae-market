import { Request, Response, NextFunction } from 'express';
import { sendError } from '../lib/response.js';
import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../lib/jwt.js';

//_____________________
// Augment Express request with 'user'
//_____________________

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

//_____________________
// Extract Bearer Token from header
//_____________________
function extractToken(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.substring(7);
}

//__________________________
// protect - block unauthenticated requests
//__________________________
export function protect(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token)
    return sendError(res, "Authentication Required", StatusCodes.UNAUTHORIZED)

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    return sendError(res, "Invalid or Expired Token", StatusCodes.UNAUTHORIZED)
  }

}

//________________________________________
// requireRole — must come after `protect`
// Usage: router.delete("/x", protect, requireRole("admin"), controller)
//________________________________________
export function requireRole(...roles: Array<"customer" | "admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role) || !req.user)
      return sendError(res, "Unauthorized", StatusCodes.UNAUTHORIZED)
    next();
  }
}

// ─────────────────────────────────────────────
// optionalAuth — attaches user if token present
// but does NOT block if missing (public routes)
// ─────────────────────────────────────────────
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    try { req.user = verifyAccessToken(token); } catch { /* ignore */ }
  }
  next();
}
