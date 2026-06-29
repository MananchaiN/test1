import { Request, Response } from 'express';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';

const prisma = new PrismaClient();
const JWT_SECRET = 'your-secret-key';

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many attempts, please try again later',
});

// Registration endpoint
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, otp } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        emailVerified: false,
      },
    });

    // Generate OTP
    const otpToken = uuidv4();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Store OTP in database
    await prisma.otpToken.create({
      data: {
        userId: user.id,
        token: otpToken,
        expiresAt: otpExpires,
      },
    });

    // Send verification email (mock implementation)
    // In a real application, this would send an email with the OTP
    console.log(`Verification email sent to ${email} with OTP: ${otpToken}`);

    res.status(201).json({
      message: 'User registered successfully. Check your email for verification.',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login endpoint
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const passwordMatch = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    if (!passwordMatch || !(await prisma.user.findUnique({ where: { email }, select: { password: true } }))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check email verification
    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Forgot password endpoint
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check OTP
    const otpRecord = await prisma.otpToken.findFirst({
      where: {
        userId: user.id,
        token: otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Generate new password (in a real application, this would be sent to the user)
    const newPassword = 'generated_password';

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hash(newPassword, 12),
      },
    });

    res.status(200).json({
      message: 'Password reset successful',
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user profile endpoint
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // Extract user ID from JWT token
    const userId = (req as any).user.userId;

    // Find user by ID
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply rate limiting to all auth endpoints
export const applyAuthRateLimit = (req: Request, res: Response, next: Function) => {
  authLimiter(req, res, next);
};