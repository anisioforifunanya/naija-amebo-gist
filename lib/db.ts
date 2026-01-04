import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read JSON data file
export function readData(filename: string) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Write JSON data file
export function writeData(filename: string, data: any) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// Initialize default data if not present
export function initializeDefaultData() {
  ensureDataDir();
  
  // Initialize users
  const usersFile = path.join(DATA_DIR, 'users.json');
  if (!fs.existsSync(usersFile)) {
    const defaultUsers = [
      {
        id: 'user-1',
        firstName: 'Prince',
        lastName: 'Anisiofor',
        username: 'princeani',
        email: 'prince@example.com',
        bio: 'Celebrity enthusiast and entertainment news lover',
        avatar: '',
        followers: 245,
        following: 89,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-2',
        firstName: 'Alex',
        lastName: 'King',
        username: 'siralexking',
        email: 'alex@example.com',
        bio: 'Professional news journalist and storyteller',
        avatar: '',
        followers: 512,
        following: 234,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-3',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test account for demonstration',
        avatar: '',
        followers: 10,
        following: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-4',
        firstName: 'Chioma',
        lastName: 'Adeyemi',
        username: 'chiomaade',
        email: 'chioma@example.com',
        bio: 'Breaking news correspondent',
        avatar: '',
        followers: 342,
        following: 156,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-5',
        firstName: 'Kunle',
        lastName: 'Okafor',
        username: 'kunleok',
        email: 'kunle@example.com',
        bio: 'Viral content curator and meme enthusiast',
        avatar: '',
        followers: 678,
        following: 432,
        createdAt: new Date().toISOString()
      }
    ];
    writeData('users.json', defaultUsers);
  }

  // Initialize admins
  const adminsFile = path.join(DATA_DIR, 'admins.json');
  if (!fs.existsSync(adminsFile)) {
    const defaultAdmins = [
      {
        id: 'admin-1',
        email: 'admin@naijaambogist.com',
        username: 'admin',
        password: 'admin123', // In production, this should be hashed
        avatar: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 'admin-2',
        email: 'moderator@naijaambogist.com',
        username: 'moderator',
        password: 'mod123',
        avatar: '',
        createdAt: new Date().toISOString()
      }
    ];
    writeData('admins.json', defaultAdmins);
  }

  // Initialize groups
  const groupsFile = path.join(DATA_DIR, 'groups.json');
  if (!fs.existsSync(groupsFile)) {
    const defaultGroups = [
      {
        id: 'group-1',
        name: 'Celebrity Gossip Central',
        description: 'All the latest celebrity news and entertainment updates',
        members: 245,
        createdAt: new Date().toISOString()
      },
      {
        id: 'group-2',
        name: 'Breaking News Hub',
        description: 'Real-time breaking news and current events',
        members: 512,
        createdAt: new Date().toISOString()
      },
      {
        id: 'group-3',
        name: 'Viral Trends',
        description: 'Share and discuss viral content',
        members: 1023,
        createdAt: new Date().toISOString()
      }
    ];
    writeData('groups.json', defaultGroups);
  }

  // Initialize channels
  const channelsFile = path.join(DATA_DIR, 'channels.json');
  if (!fs.existsSync(channelsFile)) {
    const defaultChannels = [
      {
        id: 'channel-1',
        name: 'Entertainment News',
        description: 'Latest entertainment industry news',
        members: 456,
        createdAt: new Date().toISOString()
      },
      {
        id: 'channel-2',
        name: 'Sports Updates',
        description: 'Sports scores and updates',
        members: 789,
        createdAt: new Date().toISOString()
      },
      {
        id: 'channel-3',
        name: 'Politics & Government',
        description: 'Political news and government updates',
        members: 634,
        createdAt: new Date().toISOString()
      }
    ];
    writeData('channels.json', defaultChannels);
  }

  // Initialize news
  const newsFile = path.join(DATA_DIR, 'news.json');
  if (!fs.existsSync(newsFile)) {
    const defaultNews = [
      {
        id: 'news-1',
        title: 'Celebrity Charity Event Raises Millions',
        content: 'A major charity event organized by celebrities raises record-breaking funds',
        category: 'Celebrity',
        author: 'Prince Anisiofor',
        createdAt: new Date().toISOString()
      },
      {
        id: 'news-2',
        title: 'Tech Industry Announces Major Breakthrough',
        content: 'Major technology companies announce joint venture',
        category: 'Technology',
        author: 'Alex King',
        createdAt: new Date().toISOString()
      },
      {
        id: 'news-3',
        title: 'Sports Championship Finals Underway',
        content: 'Exciting championship matches happening this weekend',
        category: 'Sports',
        author: 'Kunle Okafor',
        createdAt: new Date().toISOString()
      }
    ];
    writeData('news.json', defaultNews);
  }
}
