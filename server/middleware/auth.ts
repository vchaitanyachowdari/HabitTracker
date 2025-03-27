import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: number;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT token
 * Extracts the token from Authorization header and verifies it
 */
export const authenticateJWT = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Extract the token from the Bearer format
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    // Verify the token
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Optional authentication middleware
 * If a token is provided and valid, it adds the user to the request
 * If no token is provided or token is invalid, it allows the request to proceed
 */
export const optionalAuthenticateJWT = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = authService.verifyToken(token);
        req.user = decoded;
        req.userId = decoded.userId;
      }
    }
    
    next();
  } catch (error) {
    // Continue even if token is invalid
    next();
  }
};