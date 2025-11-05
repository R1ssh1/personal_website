import { NextRequest, NextResponse } from 'next/server';
import { blogPostsDb } from '@/lib/database';
import { getSession } from '@/lib/auth';
import { getBlogSlugFromTitle } from '@/lib/slug';
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/mdx';
import { z } from 'zod';

// Validation schema for blog post updates
const updateBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  tags: z.array(z.string()).optional(),
  publishDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  published: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Database row interface (matches actual database schema)
interface BlogPostRow {
  id: string
  title: string
  summary?: string  // Old column name
  excerpt?: string  // New column name
  content: string
  date?: string     // Old column name
  publish_date?: string // New column name
  tags: string      // JSON string
  read_time?: string
  featured?: number
  published?: number
  created_at: string
  updated_at: string
  featured_image?: string
}

// Helper function to check if a string looks like a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/blogs/[id] - Get single blog post by ID or slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // If it looks like a UUID, treat as database ID
    if (isUUID(id)) {
      const blog = await blogPostsDb.getById(id);
      if (!blog) {
        return NextResponse.json(
          { error: 'Blog post not found', success: false },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, blog });
    }

    // Otherwise, treat as slug and search both MDX and database

    // First, try to find in MDX files
    const mdxPost = getBlogPostBySlug(id); // id is actually slug here
    if (mdxPost) {
      return NextResponse.json({
        success: true,
        blog: {
          ...mdxPost.metadata,
          content: mdxPost.content,
          type: 'mdx'
        }
      });
    }

    // Then, try to find in database by matching slug to title
    const allDbPosts = await blogPostsDb.getAll() as unknown as BlogPostRow[];
    const dbPost = allDbPosts.find(post =>
      getBlogSlugFromTitle(post.title) === id
    );

    if (dbPost) {
      // Handle both old and new column names
      const tags = dbPost.tags ? (typeof dbPost.tags === 'string' ? JSON.parse(dbPost.tags) : dbPost.tags) : [];

      return NextResponse.json({
        success: true,
        blog: {
          id: dbPost.id,
          title: dbPost.title,
          summary: dbPost.summary || dbPost.excerpt || '',
          content: dbPost.content,
          date: dbPost.date || dbPost.publish_date || '',
          tags: tags,
          readTime: dbPost.read_time || '',
          featured: Boolean(dbPost.featured),
          published: Boolean(dbPost.published),
          type: 'database'
        }
      });
    }

    return NextResponse.json(
      { error: 'Blog post not found', success: false },
      { status: 404 }
    );
  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update blog post
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = updateBlogPostSchema.safeParse(body);

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

    // Check if blog exists
    const existingBlog = blogPostsDb.getById(id);
    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog post not found', success: false },
        { status: 404 }
      );
    }

    const updateData = validationResult.data;
    const success = blogPostsDb.update(id, updateData);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update blog post', success: false },
        { status: 500 }
      );
    }

    const updatedBlog = blogPostsDb.getById(id);
    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error('Update blog error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete blog post
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if blog exists
    const existingBlog = blogPostsDb.getById(id);
    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog post not found', success: false },
        { status: 404 }
      );
    }

    const success = blogPostsDb.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete blog post', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post', success: false },
      { status: 500 }
    );
  }
}