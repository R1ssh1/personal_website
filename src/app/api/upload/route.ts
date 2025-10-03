import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';

interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

async function saveFileLocally(file: File, folder: string = 'uploads'): Promise<UploadResult> {
  // Generate a unique filename to prevent conflicts
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop() || '';
  const filename = `${timestamp}-${randomString}.${extension}`;

  // Create the upload directory path
  const uploadDir = path.join(process.cwd(), 'public', folder);
  const filePath = path.join(uploadDir, filename);

  // Validate file type and size
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Please upload images or PDFs only.');
  }

  // Limit file size to 10MB
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }

  // Ensure upload directory exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Convert File to Buffer and save to local filesystem
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  // Return the public URL for the uploaded file
  const publicUrl = `/${folder}/${filename}`;

  return {
    url: publicUrl,
    filename: file.name,
    size: file.size,
    type: file.type,
  };
}

async function deleteFileLocally(fileUrl: string): Promise<void> {
  // Extract the file path from the URL (remove leading slash)
  const filePath = path.join(process.cwd(), 'public', fileUrl.replace(/^\/+/, ''));

  if (existsSync(filePath)) {
    await unlink(filePath);
  } else {
    throw new Error('File not found');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Handle single file upload
    if (files.length === 1) {
      const result = await saveFileLocally(files[0], folder);
      return NextResponse.json({
        success: true,
        file: result
      });
    }

    // Handle multiple file upload
    const uploadPromises = files.map(file => saveFileLocally(file, folder));
    const results = await Promise.all(uploadPromises);
    return NextResponse.json({
      success: true,
      files: results
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'No file URL provided' },
        { status: 400 }
      );
    }

    await deleteFileLocally(url);
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Delete failed',
        success: false
      },
      { status: 500 }
    );
  }
}