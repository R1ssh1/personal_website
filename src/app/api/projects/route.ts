import { NextRequest, NextResponse } from 'next/server';
import { projectsDb } from '@/lib/database-unified';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for project creation/update
const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  techStack: z.array(z.string()).min(1, 'At least one technology is required'),
  githubLink: z.string().url().optional().or(z.literal('')),
  liveDemoLink: z.string().url().optional().or(z.literal('')),
  images: z.array(z.string().url()).default([]),
});

// GET /api/projects - Get all projects
export async function GET() {
  try {
    const projects = await projectsDb.getAll();
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', success: false },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
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
    const validationResult = createProjectSchema.safeParse(body);

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

    const projectData = validationResult.data;
    const projectId = await projectsDb.create({
      title: projectData.title,
      description: projectData.description,
      techStack: projectData.techStack,
      githubLink: projectData.githubLink || undefined,
      liveDemoLink: projectData.liveDemoLink || undefined,
      images: projectData.images,
    });

    const project = await projectsDb.getById(projectId);

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project', success: false },
      { status: 500 }
    );
  }
}