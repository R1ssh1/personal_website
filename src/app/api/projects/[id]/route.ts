import { NextRequest, NextResponse } from 'next/server';
import { projectsDb } from '@/lib/database-unified';
import { getSession } from '@/lib/auth';
import { getProjectSlugFromTitle } from '@/lib/slug';
import { getAllProjects, getProjectBySlug } from '@/lib/mdx';
import { z } from 'zod';

// Validation schema for project updates
const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  techStack: z.array(z.string()).min(1, 'At least one technology is required').optional(),
  githubLink: z.union([z.string().url(), z.literal('')]).optional(),
  liveDemoLink: z.union([z.string().url(), z.literal('')]).optional(),
  images: z.array(z.string()).optional().default([]),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Database row interface (matches actual database schema)
interface ProjectRow {
  id: string
  title: string
  summary?: string
  description: string
  technologies: string  // JSON string
  date?: string
  featured?: number
  github?: string
  demo?: string
  image_url?: string
  created_at: string
  updated_at: string
}

// Helper function to check if a string looks like a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/projects/[id] - Get single project by ID or slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // If it looks like a UUID, treat as database ID
    if (isUUID(id)) {
      const project = await projectsDb.getById(id);
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found', success: false },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, project });
    }

    // Otherwise, treat as slug and search both MDX and database

    // First, try to find in MDX files
    const mdxProject = getProjectBySlug(id); // id is actually slug here
    if (mdxProject) {
      return NextResponse.json({
        success: true,
        project: {
          ...mdxProject.metadata,
          content: mdxProject.content,
          type: 'mdx'
        }
      });
    }

    // Then, try to find in database by matching slug to title
    const allDbProjects = await projectsDb.getAll();
    const dbProject = allDbProjects.find(project =>
      getProjectSlugFromTitle(project.title) === id
    );

    if (dbProject) {
      // Debug: Log the raw database project
      console.log('Raw DB Project:', JSON.stringify(dbProject, null, 2));

      const projectData = {
        id: dbProject.id,
        title: dbProject.title,
        summary: dbProject.description || '',
        description: dbProject.description,
        content: dbProject.description,
        technologies: dbProject.techStack || [],
        date: '',
        featured: false,
        githubUrl: dbProject.githubLink || '',
        demoUrl: dbProject.liveDemoLink || '',
        imageUrl: dbProject.images?.[0] || '',
        images: dbProject.images || [],
        type: 'database' as const
      };

      console.log('Processed Project Data:', JSON.stringify(projectData, null, 2));

      return NextResponse.json({
        success: true,
        project: projectData
      });
    }

    return NextResponse.json(
      { error: 'Project not found', success: false },
      { status: 404 }
    );
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
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
    const validationResult = updateProjectSchema.safeParse(body);

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

    // Check if project exists
    const existingProject = await projectsDb.getById(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found', success: false },
        { status: 404 }
      );
    }

    const updateData = validationResult.data;
    const success = await projectsDb.update(id, updateData);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update project', success: false },
        { status: 500 }
      );
    }

    const updatedProject = await projectsDb.getById(id);
    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Failed to update project', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
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

    // Check if project exists
    const existingProject = await projectsDb.getById(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found', success: false },
        { status: 404 }
      );
    }

    const success = await projectsDb.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete project', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project', success: false },
      { status: 500 }
    );
  }
}