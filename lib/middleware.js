import { verifyToken } from './auth';
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

export const authenticateUser = async (request) => {
  try {
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // Try to get token from cookies if not in authorization header
    if (!token) {
      // Handle different ways cookies might be accessed
      if (request.cookies && typeof request.cookies.get === 'function') {
        token = request.cookies.get('auth-token')?.value;
      } else if (request.headers.get('cookie')) {
        // Parse cookies manually if needed
        const cookies = request.headers.get('cookie');
        const authTokenMatch = cookies.match(/auth-token=([^;]+)/);
        token = authTokenMatch ? authTokenMatch[1] : null;
      }
    }

    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { user: null, error: 'Invalid token' };
    }

    const client = await clientPromise;
    const db = client.db('ai_career_coach');
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
};

export const requireAuth = (handler) => {
  return async (request, context = {}) => {
    const { user, error } = await authenticateUser(request);
    
    if (!user) {
      return Response.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    // Add user to context
    context.user = user;
    return handler(request, context);
  };
};
