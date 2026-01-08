import { NextRequest, NextResponse } from 'next/server';
import { readData, initializeDefaultData } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Initialize default data on first run
    initializeDefaultData();

    // Read admins from data file
    const admins = readData('admins.json');

    return NextResponse.json({
      success: true,
      admins: admins || []
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
