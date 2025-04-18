
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/User';
import RefreshTokenModel from '../models/RefreshToken';

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

        // Create token payload
        const payload: TokenPayload = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };

        // Generate access token
        const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: accessExpire });

        // Generate refresh token
        const refreshTokenString = randomUUID();
        
        // Calculate expiry date for refresh token
        const refreshExpireMs = 
          refreshExpire.endsWith('d') 
            ? parseInt(refreshExpire.slice(0, -1)) * 24 * 60 * 60 * 1000 
            : 7 * 24 * 60 * 60 * 1000; // Default 7 days
        
        const expiresAt = new Date(Date.now() + refreshExpireMs);
        
        // Save refresh token to database
        const refreshToken = new RefreshTokenModel({
          userId: user._id,
          token: refreshTokenString,
          expiresAt,
          ip,
          userAgent,
        });
        
        await refreshToken.save();

        resolve({
          accessToken,
          refreshToken: refreshTokenString,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async register(userData: UserRegistration, ip?: string, userAgent?: string): Promise<TokenPair> {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = new UserModel({
      email: userData.email.toLowerCase(),
      passwordHash: userData.password, // Will be hashed by pre-save hook
      role: userData.role || 'client',
    });

    // Save user to database
    await user.save();

    // Generate tokens
    return this.generateTokens(user, ip, userAgent);
  }

  public static async login(email: string, password: string, ip?: string, userAgent?: string): Promise<TokenPair> {
    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    return this.generateTokens(user, ip, userAgent);
  }

  public static async refresh(token: string, ip?: string, userAgent?: string): Promise<TokenPair> {
    // Find refresh token in database
    const refreshToken = await RefreshTokenModel.findOne({
      token,
      isDeleted: false,
    });

    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is expired
    if (refreshToken.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Find user
    const user = await UserModel.findById(refreshToken.userId);
    if (!user || user.isDeleted) {
      throw new Error('User not found or disabled');
    }

    // Invalidate the current refresh token
    refreshToken.isDeleted = true;
    await refreshToken.save();

    // Generate new tokens
    return this.generateTokens(user, ip, userAgent);
  }

  public static async revokeToken(token: string): Promise<void> {
    // Find and invalidate the refresh token
    const refreshToken = await RefreshTokenModel.findOne({ token, isDeleted: false });
    if (!refreshToken) return;

    refreshToken.isDeleted = true;
    await refreshToken.save();
  }
}

export default AuthService;
