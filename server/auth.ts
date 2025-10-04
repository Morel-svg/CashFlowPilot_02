import bcrypt from "bcryptjs";
import { supabase } from "./db";
import type { User, InsertUser, LoginRequest } from "@shared/schema";

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async createUser(userData: InsertUser): Promise<Omit<User, 'passwordHash'>> {
    const { password, confirmPassword, ...userInfo } = userData;

    const passwordHash = await this.hashPassword(password);

    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', userInfo.email)
      .maybeSingle();

    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        ...userInfo,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) throw error;

    const { password_hash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword as any;
  }

  static async authenticateUser(credentials: LoginRequest): Promise<Omit<User, 'passwordHash'> | null> {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .maybeSingle();

    if (!user || !user.is_active) {
      return null;
    }

    const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash);
    if (!isValidPassword) {
      return null;
    }

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as any;
  }

  static async getUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!user || !user.is_active) {
      return null;
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as any;
  }

  static async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    const { data: allUsers } = await supabase
      .from('users')
      .select('*');

    return (allUsers || []).map(user => {
      const { password_hash: _, ...userWithoutPassword } = user;
      return userWithoutPassword as any;
    });
  }
}

export function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

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

declare module "express-session" {
  interface SessionData {
    user?: Omit<User, 'passwordHash'>;
  }
}
