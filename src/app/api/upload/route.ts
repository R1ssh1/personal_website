import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { getSession } from '@/lib/auth';

const allowedTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
];

const maxSize = 10 * 1024 * 1024; // 10MB

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
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadFile = async (file: File) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload images or PDFs only.');
      }
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop() || 'bin';
      const filename = `${folder}/${timestamp}-${randomString}.${extension}`;

      const blob = await put(filename, file, {
        access: 'public',
        contentType: file.type,
      });

      return {
        url: blob.url,
        filename: file.name,
        size: file.size,
        type: file.type,
      };
    };

    if (files.length === 1) {
      const result = await uploadFile(files[0]);
      return NextResponse.json({ success: true, file: result });
    }

    const results = await Promise.all(files.map(uploadFile));
    return NextResponse.json({ success: true, files: results });

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

    await del(url);
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