import { NextRequest, NextResponse } from 'next/server';
import { readData, initializeDefaultData } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Initialize default data on first run
    initializeDefaultData();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Search in file-based users
    const users = readData('users.json');
    const user = users.find((u: any) => u.id === userId);

    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName || user.firstName,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          phone: user.phone || '',
          followers: user.followers || [],
          following: user.following || [],
          likes: user.likes || 0,
          likedBy: user.likedBy || [],
          subscribers: user.subscribers || [],
          friends: user.friends || [],
          blockedUsers: user.blockedUsers || [],
          joinedDate: user.joinedDate,
          lastLogin: user.lastLogin,
          role: 'user'
        }
      });
    }

    // Search in file-based admins
    const admins = readData('admins.json');
    const admin = admins.find((a: any) => a.id === userId);

    if (admin) {
      return NextResponse.json({
        success: true,
        user: {
          id: admin.id,
          firstName: admin.firstName || admin.username,
          lastName: admin.lastName || '',
          displayName: admin.displayName || admin.firstName || admin.username,
          username: admin.username,
          email: admin.email,
          bio: admin.bio || 'Administrator',
          avatar: admin.avatar,
          phone: admin.phone || '',
          followers: admin.followers || [],
          following: admin.following || [],
          likes: admin.likes || 0,
          likedBy: admin.likedBy || [],
          subscribers: admin.subscribers || [],
          friends: admin.friends || [],
          blockedUsers: admin.blockedUsers || [],
          joinedDate: admin.joinedDate,
          lastLogin: admin.lastLogin,
          role: 'admin'
        }
      });
    }

    // For dynamically created users not in database, return 404
    // The client will use localStorage fallback which has the complete user data
    return NextResponse.json(
      { error: 'User not found in database - check localStorage', isClientCreated: true },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
