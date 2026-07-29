import { NextRequest, NextResponse } from 'next/server';
import { blogPostsDb } from '@/lib/database-unified';
import { getSession } from '@/lib/auth';

// GET /api/admin/blogs - Get all blog posts (including drafts) for admin
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const blogs = await blogPostsDb.getAll();
    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs', success: false },
      { status: 500 }
    );
  }
}