import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { CookieOptions } from 'express';
import UserModel, { IUser } from '../models/User';
import RefreshTokenModel from '../models/RefreshToken';

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface UserRegistration {
  email: string;
  password: string;
  role?: string;
}

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  private static generateTokens(user: IUser, ip?: string, userAgent?: string): Promise<TokenPair> {
    return new Promise(async (resolve, reject) => {
      try {
        const jwtSecret = process.env.JWT_SECRET;
        const accessExpire = process.env.JWT_ACCESS_EXPIRE || '15m';
        const refreshExpire = process.env.JWT_REFRESH_EXPIRE || '7d';

        if (!jwtSecret) {
          throw new Error('JWT_SECRET not set in environment variables');
        }

        const payload: TokenPayload = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };

        const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: accessExpire });
        const refreshToken = randomUUID();
        
        const refreshExpireMs = 
          refreshExpire.endsWith('d') 
            ? parseInt(refreshExpire.slice(0, -1)) * 24 * 60 * 60 * 1000 
            : 7 * 24 * 60 * 60 * 1000;
        
        const expiresAt = new Date(Date.now() + refreshExpireMs);
        
        await RefreshTokenModel.create({
          userId: user._id,
          token: refreshToken,
          expiresAt,
          ip,
          userAgent,
        });

        resolve({ accessToken, refreshToken });
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async register(userData: UserRegistration, ip?: string, userAgent?: string): Promise<TokenPair> {
    const existingUser = await UserModel.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = new UserModel({
      email: userData.email.toLowerCase(),
      passwordHash: userData.password, // Will be hashed by pre-save hook
      role: userData.role || 'client',
    });

    await user.save();

    return this.generateTokens(user, ip, userAgent);
  }

  public static async login(email: string, password: string, ip?: string, userAgent?: string): Promise<TokenPair> {
    const user = await UserModel.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return this.generateTokens(user, ip, userAgent);
  }

  public static async refresh(token: string, ip?: string, userAgent?: string): Promise<TokenPair> {
    const refreshToken = await RefreshTokenModel.findOne({
      token,
      isDeleted: false,
    });

    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    const user = await UserModel.findById(refreshToken.userId);
    if (!user || user.isDeleted) {
      throw new Error('User not found or disabled');
    }

    refreshToken.isDeleted = true;
    await refreshToken.save();

    return this.generateTokens(user, ip, userAgent);
  }

  public static async revokeToken(token: string): Promise<void> {
    const refreshToken = await RefreshTokenModel.findOne({ token, isDeleted: false });
    if (!refreshToken) return;

    refreshToken.isDeleted = true;
    await refreshToken.save();
  }
}

export default AuthService;
export { COOKIE_OPTIONS };
