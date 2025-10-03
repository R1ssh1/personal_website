import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Missing image URL parameter' },
      { status: 400 }
    );
  }

  try {
    // Validate that the URL is from an allowed domain
    const allowedDomains = [
      'images.credly.com',
      'cdn.credly.com'
    ];

    const parsedUrl = new URL(imageUrl);
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      );
    }

    // Fetch the image from the external URL
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'Referer': 'https://www.credly.com/',
        'Origin': 'https://www.credly.com'
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch image ${imageUrl}: ${response.status} ${response.statusText}`);

      // For 403 errors, try a different approach
      if (response.status === 403) {
        const fallbackResponse = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
            'Accept': '*/*'
          },
        });

        if (fallbackResponse.ok) {
          const imageBuffer = await fallbackResponse.arrayBuffer();
          const contentType = fallbackResponse.headers.get('content-type') || 'image/png';

          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
}