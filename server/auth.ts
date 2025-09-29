import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User, InsertUser, LoginRequest } from "@shared/schema";

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Create new user
  static async createUser(userData: InsertUser): Promise<Omit<User, 'passwordHash'>> {
    const { password, confirmPassword, ...userInfo } = userData;
    
    // Hash the password
    const passwordHash = await this.hashPassword(password);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userInfo.email))
      .limit(1);
      
    if (existingUser.length > 0) {
      throw new Error("User already exists with this email");
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        ...userInfo,
        passwordHash,
      })
      .returning();

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Authenticate user
  static async authenticateUser(credentials: LoginRequest): Promise<Omit<User, 'passwordHash'> | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, credentials.email))
      .limit(1);

    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await this.verifyPassword(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Get user by ID
  static async getUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user || !user.isActive) {
      return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    const allUsers = await db
      .select()
      .from(users);

    return allUsers.map(user => {
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}

// Middleware for checking authentication
export function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Middleware for checking specific roles
export function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    next();
  };
}

// Declare session user type
declare module "express-session" {
  interface SessionData {
    user?: Omit<User, 'passwordHash'>;
  }
}






