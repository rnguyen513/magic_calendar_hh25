import { NextRequest, NextResponse } from 'next/server';

const API_BASE = "https://canvas.its.virginia.edu/api/v1";
const ACCESS_TOKEN = process.env.CANVAS_ACCESS_TOKEN;

/**
 * API route handler to proxy Canvas API requests
 * Handles any path after /api/canvas/ and forwards it to the Canvas API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  console.log('Canvas API proxy called with path:', params.path);
  
  try {
    // Validate token existence
    if (!ACCESS_TOKEN) {
      console.error('No Canvas ACCESS_TOKEN found in environment variables');
      return NextResponse.json(
        { error: 'No Canvas API token configured' },
        { status: 500 }
      );
    }

    // Build the API path by joining all path segments
    const apiPath = params.path.join('/');
    const url = new URL(request.url);
    let apiUrl = `${API_BASE}/${apiPath}`;

    // Forward query parameters
    if (url.search) {
      apiUrl += url.search;
    }

    console.log('Proxying request to Canvas API:', apiUrl);

    // Make the request to Canvas API
    const canvasResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!canvasResponse.ok) {
      console.error('Canvas API returned error:', canvasResponse.status);
      return NextResponse.json(
        { error: `Canvas API returned ${canvasResponse.status}` },
        { status: canvasResponse.status }
      );
    }

    // Get response data
    const data = await canvasResponse.json();
    console.log('Canvas API proxy response successful');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Canvas API proxy:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Canvas API' },
      { status: 500 }
    );
  }
} 