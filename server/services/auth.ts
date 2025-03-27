import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { InsertUser, User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'habits-tracker-secret-key';
const SALT_ROUNDS = 10;

export interface AuthToken {
  userId: number;
  username: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: Omit<InsertUser, 'password'> & { password: string }): Promise<User> {
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Create the user with hashed password
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });

    return user;
  }

  /**
   * Authenticate a user and return a JWT token
   */
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    // Find the user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    // Generate a JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Generate a JWT token for a user
   */
  generateToken(user: User): string {
    const payload: AuthToken = {
      userId: user.id,
      username: user.username,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Verify a JWT token and return the decoded data
   */
  verifyToken(token: string): AuthToken {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user information by token
   */
  async getUserFromToken(token: string): Promise<User | undefined> {
    try {
      const decoded = this.verifyToken(token);
      return await storage.getUser(decoded.userId);
    } catch (error) {
      return undefined;
    }
  }
}

export const authService = new AuthService();