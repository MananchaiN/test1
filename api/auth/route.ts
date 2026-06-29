import { H3Event } from 'h3';
import { createError } from 'h3';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'h3-rate-limit';

// Mock database
const users = [];
const otpTokens = {};
const sessions = {};

// Rate limiting middleware
const limiter = rateLimit({
  window: '1 hour',
  max: 5,
  message: 'Too many requests, please try again later.'
});

// Register endpoint
export default async function register(event: H3Event) {
  const { email, password } = await useBody(event);

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return createError({ statusCode: 400, message: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Create user
  const newUser = {
    id: Date.now(),
    email,
    password: hashedPassword,
    verified: false
  };

  users.push(newUser);

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpTokens[email] = {
    otp,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
  };

  // Send OTP via email (mock implementation)
  console.log(`OTP sent to ${email}: ${otp}`);

  return {
    message: 'User registered successfully. OTP sent to email.',
    user: newUser
  };
}

// Login endpoint
export async function login(event: H3Event) {
  const { email, password } = await useBody(event);

  // Check if user exists
  const user = users.find(u => u.email === email);
  if (!user) {
    return createError({ statusCode: 400, message: 'Invalid email or password' });
  }

  // Check password
  const passwordMatch = await compare(password, user.password);
  if (!passwordMatch) {
    return createError({ statusCode: 400, message: 'Invalid email or password' });
  }

  // Check if email is verified
  if (!user.verified) {
    return createError({ statusCode: 400, message: 'Email not verified' });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '1h' });

  // Create session
  sessions[user.id] = {
    token,
    expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
  };

  return {
    message: 'Login successful',
    token
  };
}

// Forgot password endpoint
export async function forgotPassword(event: H3Event) {
  const { email } = await useBody(event);

  // Check if user exists
  const user = users.find(u => u.email === email);
  if (!user) {
    return createError({ statusCode: 400, message: 'User not found' });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpTokens[email] = {
    otp,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
  };

  // Send OTP via email (mock implementation)
  console.log(`OTP sent to ${email}: ${otp}`);

  return {
    message: 'OTP sent to email for password reset.'
  };
}

// Get user profile endpoint
export async function getProfile(event: H3Event) {
  const token = event.headers.get('Authorization')?.split(' ')[1];

  // Verify JWT token
  try {
    const decoded = jwt.verify(token, 'secret-key');
    const userId = decoded.userId;

    // Check if session exists
    const session = sessions[userId];
    if (!session || session.expiresAt < Date.now()) {
      return createError({ statusCode: 401, message: 'Session expired' });
    }

    // Find user
    const user = users.find(u => u.id === userId);
    if (!user) {
      return createError({ statusCode: 404, message: 'User not found' });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified
      }
    };
  } catch (error) {
    return createError({ statusCode: 401, message: 'Invalid or expired token' });
  }
}

// Apply rate limiting to all endpoints
export const middleware = (event: H3Event) => {
  return limiter(event);
};