import jwt from 'jsonwebtoken';
import connectToDatabase from './dbConnect';
import User from '@/app/models/userModel';

export const authMiddleware = async (req) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided', status: 401 };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    // Return user data
    return { 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    };

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token', status: 401 };
    }
    
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired', status: 401 };
    }
    
    return { error: 'Authentication failed', status: 401 };
  }
};

// Helper function to create authenticated API route
export const withAuth = (handler) => {
  return async (request) => {
    const authResult = await authMiddleware(request);
    
    if (authResult.error) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Add user to request object
    request.user = authResult.user;
    
    return handler(request);
  };
};
