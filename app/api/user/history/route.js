import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/middleware';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const GET = requireAuth(async (request, context) => {
  try {
    const { user } = context;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 5, 5); // Max 5 resumes
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('ai_career_coach');
    const users = db.collection('users');

    const userData = await users.findOne(
      { _id: new ObjectId(user._id) },
      { 
        projection: { 
          resumeAnalyses: { 
            $slice: [-5, 5] // Get latest 5 analyses only
          }
        }
      }
    );

    const analyses = userData?.resumeAnalyses || [];
    
    // Sort by most recent first
    const sortedAnalyses = analyses
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      analyses: sortedAnalyses,
      pagination: {
        page,
        limit,
        total: analyses.length,
        hasMore: analyses.length > skip + limit
      }
    });

  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis history' },
      { status: 500 }
    );
  }
});
