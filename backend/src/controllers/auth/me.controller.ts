
import { Request, Response } from 'express';
import UserModel from '../../models/User';

export async function meController(req: Request, res: Response): Promise<Response> {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await UserModel.findById(req.user.id).select('-passwordHash');
    
    if (!user || user.isDeleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
}
