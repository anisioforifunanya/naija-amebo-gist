import { NextRequest, NextResponse } from 'next/server';
import { readData, initializeDefaultData } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Initialize default data on first run
    initializeDefaultData();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase().trim() || '';

    if (!query) {
      return NextResponse.json({ results: [], query: '' });
    }

    const results: any[] = [];

    // Search users
    const users = readData('users.json');
    users.forEach((user: any) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const username = user.username.toLowerCase();
      const bio = user.bio.toLowerCase();
      const displayName = user.displayName?.toLowerCase() || '';

      if (
        fullName.includes(query) ||
        username.includes(query) ||
        bio.includes(query) ||
        displayName.includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'user',
          id: user.id,
          title: user.displayName || `${user.firstName} ${user.lastName}`,
          subtitle: `@${user.username}`,
          description: user.bio,
          avatar: user.avatar,
          url: `/profile/${user.id}`,
          category: 'Users'
        });
      }
    });

    // Search admins
    const admins = readData('admins.json');
    admins.forEach((admin: any) => {
      const email = admin.email.toLowerCase();
      const username = admin.username.toLowerCase();

      if (email.includes(query) || username.includes(query)) {
        results.push({
          type: 'admin',
          id: admin.id,
          title: admin.username,
          subtitle: admin.email,
          description: 'Administrator',
          avatar: admin.avatar,
          url: '/admin',
          category: 'Admins'
        });
      }
    });

    // Search groups
    const groups = readData('groups.json');
    groups.forEach((group: any) => {
      const name = group.name.toLowerCase();
      const description = group.description.toLowerCase();

      if (name.includes(query) || description.includes(query)) {
        results.push({
          type: 'groupchat',
          id: group.id,
          title: group.name,
          subtitle: `${group.members} members`,
          description: group.description,
          url: '/group-chats',
          category: 'Groups'
        });
      }
    });

    // Search channels
    const channels = readData('channels.json');
    channels.forEach((channel: any) => {
      const name = channel.name.toLowerCase();
      const description = channel.description.toLowerCase();

      if (name.includes(query) || description.includes(query)) {
        results.push({
          type: 'channel',
          id: channel.id,
          title: channel.name,
          subtitle: `${channel.members} members`,
          description: channel.description,
          url: '/channels',
          category: 'Channels'
        });
      }
    });

    // Search news
    const news = readData('news.json');
    news.forEach((newsItem: any) => {
      const title = newsItem.title.toLowerCase();
      const content = newsItem.content.toLowerCase();
      const category = newsItem.category.toLowerCase();

      if (title.includes(query) || content.includes(query) || category.includes(query)) {
        results.push({
          type: 'news',
          id: newsItem.id,
          title: newsItem.title,
          subtitle: `${newsItem.category} • By ${newsItem.author}`,
          description: newsItem.content.substring(0, 100),
          url: '/breaking-news',
          category: 'News'
        });
      }
    });

    return NextResponse.json({
      results: results.slice(0, 50), // Limit to 50 results
      query,
      total: results.length
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
