import { NextRequest, NextResponse } from 'next/server';
import { blogPostsDb } from '@/lib/database';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for blog post creation/update
const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).default([]),
  publishDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  featuredImage: z.string().url().optional().or(z.literal('')),
  published: z.boolean().default(false),
});

const updateBlogPostSchema = createBlogPostSchema.partial();

// GET /api/blogs - Get published blog posts for public consumption
export async function GET() {
  try {
    const blogs = blogPostsDb.getPublished();
    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    console.error('Get blogs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs', success: false },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create new blog post
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = createBlogPostSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
          success: false,
        },
        { status: 400 }
      );
    }

    const blogData = validationResult.data;
    const blogId = blogPostsDb.create({
      title: blogData.title,
      excerpt: blogData.excerpt,
      content: blogData.content,
      tags: blogData.tags,
      publishDate: blogData.publishDate,
      featuredImage: blogData.featuredImage || undefined,
      published: blogData.published,
    });

    const blog = blogPostsDb.getById(blogId);

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post', success: false },
      { status: 500 }
    );
  }
}