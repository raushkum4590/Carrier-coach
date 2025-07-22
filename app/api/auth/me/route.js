import { NextResponse } from 'next/server';
import { authenticateUser } from '../../../../lib/middleware';

export async function GET(request) {
  try {
    const { user, error } = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { authenticated: false, error },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
