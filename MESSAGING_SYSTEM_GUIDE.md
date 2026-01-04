# Private Messaging System & Community Moderation Guide

## Overview

The Naija Amebo Gist platform now includes a comprehensive private messaging system and community moderation dashboard for managing users and content.

## 🎯 Key Features

### 1. Private Messaging System (`/private-messages`)

#### Message Types Supported
- **User-to-User**: Direct messaging between registered users
- **User-to-Admin**: Support tickets and inquiries from users to admins
- **Admin-to-User**: Admin responses with optional anonymous mode
- **Admin-to-Admin**: Internal admin communications

#### Access Requirements
- **For Users**: Must be a registered user with an active account
  - Anonymous users CANNOT access messaging (will be redirected to `/community`)
  - Restricted or banned users are blocked at login (community page checks)
  - Only signed-up users can send/receive messages

- **For Admins**: Automatic access
  - All admin accounts can access messaging immediately
  - Can message any user or other admins
  - Can toggle "Send Anonymous" when messaging users

#### Rich Attachment Support
Users can share multiple types of attachments in private messages:

| Icon | Type | Purpose |
|------|------|---------|
| 🖼️ | Gallery | Share images and photos |
| 💳 | Wallet | Send payment/wallet information |
| 📄 | Files | Share documents and files |
| 📍 | Location | Share real-time location (GPS) |
| 📊 | Poll | Create polls and surveys |
| 👤 | Contact | Share contact information |
| 🎵 | Music | Share music and audio files |

#### Features
- **Real-time Updates**: Messages appear instantly in conversations
- **Conversation Management**: View all active conversations with last message preview
- **Unread Indicators**: Badge showing unread message count per conversation
- **Message Timestamps**: All messages show when they were sent
- **User Search**: Find and start conversations with specific users
- **Message History**: Full conversation history with timestamps
- **Anonymous Mode** (Admins only): Send messages without revealing admin identity

#### User Interface Components
1. **Conversations List** (Left Panel)
   - New Message button to start conversations
   - User search functionality
   - Conversation list with unread counts
   - Last message preview
   - Conversation timestamps

2. **Message View** (Main Panel)
   - Message thread display
   - User information header
   - Anonymous mode toggle (for admins)
   - Real-time message updates
   - Attachment menu

3. **Input Area**
   - Text message input field
   - Attachment button (📎)
   - Send button
   - Enter key support for quick send

### 2. Community Moderation Dashboard (`/admin/community-moderation`)

#### Statistics Dashboard
View real-time community statistics:
- **Total Users**: All registered users
- **Active Users**: Currently online/active users
- **Restricted Users**: Users with active restrictions
- **Banned Users**: Permanently banned users

#### User Management

##### Filter Options
- **All Users**: View complete user list
- **Banned Users**: Filter to show only banned accounts
- **Restricted Users**: Filter to show only restricted accounts

##### User Details Panel
When selecting a user, view:
- Full name and username
- Email address
- Account status (Active/Restricted/Banned)
- Ban reason (if applicable)
- Restriction reason and expiration date (if applicable)

##### User Actions

**Restrict User**
- Temporarily limit user account access
- Duration options: 1-365 days (customizable)
- Provide restriction reason
- Restrictions automatically expire after duration
- Users cannot post, chat, or participate while restricted

**Ban User**
- Permanently ban user account
- Record ban reason
- User cannot access any features
- Ban can be reversed with "Unban" button

**Unrestrict User**
- Immediately remove active restriction
- Reinstates user access
- Can be done before expiration date

**Unban User**
- Reinstate previously banned user
- User regains full account access
- Useful for appealing bans

#### Message Moderation
- **View Recent Messages**: See messages from community chat
- **Delete Messages**: Remove inappropriate or policy-violating messages
- **Message Deletion Log**: Track what was deleted and when

#### Restriction & Ban Management
- **Automatic Expiration**: Restrictions automatically expire after set duration
- **Real-time Status**: See current status of all users
- **Reason Tracking**: Keep detailed records of why users are restricted/banned
- **Easy Reversal**: Simple one-click buttons to unrestrict/unban

### 3. Navigation Integration

#### Header Updates
All authenticated users see these navigation options:
- **Desktop**: "💬 Messages" link in main navigation
- **Mobile**: "💬 Private Messages" link in mobile menu
- Quick access from any page

#### Admin Dashboard Quick Links
Quick access buttons at top of admin dashboard:
- **🛡️ Community**: Direct link to moderation dashboard
- **💬 Messages**: Direct link to private messages

#### Community Page Integration
Registered users in community chat see:
- **💬 Messages**: Button in top right to access private messaging

## 🔧 Technical Implementation

### Data Structure

#### PrivateMessage Object
```typescript
{
  id: string;              // Unique message ID (timestamp-based)
  senderId: string;        // Sender's user ID
  senderName: string;      // Sender's display name
  receiverId: string;      // Recipient's user ID
  receiverName: string;    // Recipient's display name
  message: string;         // Message content
  timestamp: string;       // ISO timestamp of when sent
  isRead: boolean;         // Read status
  isAnonymous: boolean;    // Whether message is sent anonymously (admin only)
  attachments?: {          // Optional attachments array
    type: string;          // Attachment type (image, file, etc.)
    data: any;            // Attachment data
  }[];
}
```

#### Conversation Object
```typescript
{
  id: string;              // Unique conversation ID
  otherUserId: string;     // ID of the other participant
  otherUserName: string;   // Display name of other participant
  otherUserType: 'user' | 'admin'; // Participant type
  lastMessage: string;     // Most recent message content
  lastTimestamp: string;   // When last message was sent
  unreadCount: number;     // Number of unread messages
}
```

### Storage
- **Database**: localStorage (client-side)
- **Key**: `naijaAmeboPrivateMessages` (array of PrivateMessage objects)
- **Size Consideration**: For production, migrate to server database

### Access Control Flow

```
User Request to /private-messages
        ↓
Check localStorage for naijaAmeboCurrentUser
        ↓
User exists?
    ├─ No → Redirect to /login
    └─ Yes → Continue
        ↓
Is Anonymous?
    ├─ Yes → Show alert, redirect to /community
    └─ No → Allow access to messaging
```

### Message Flow

1. User types message and clicks send
2. Message object created with timestamp
3. Message added to `naijaAmeboPrivateMessages` in localStorage
4. UI updates with new message
5. Conversation list updated with last message
6. Other user sees message on refresh (or real-time with socket in future)

## 🚀 Usage Workflow

### For Regular Users

1. **Sign Up/Register** at `/register`
2. **Login** at `/login` with credentials
3. **Access Messages** via:
   - Header navigation: "💬 Messages"
   - Community page button: "💬 Messages"
4. **Start Conversation**:
   - Click "New Message"
   - Search for recipient
   - Click to select
   - Type message
   - Click Send
5. **View Attachments**:
   - Click 📎 icon
   - Select attachment type
   - Attachment note added to system

### For Admins

1. **Login** at `/admin` with admin credentials
2. **Access Private Messages**:
   - Quick link on admin dashboard
   - Header navigation
   - Direct URL: `/private-messages`
3. **Send to Users**:
   - Click New Message
   - Find user
   - Toggle "Send Anonymous" if needed
   - Type and send
4. **Manage Community**:
   - Click "🛡️ Community" button
   - View user statistics
   - Select user to view details
   - Use action buttons to restrict/ban
5. **Monitor Messages**:
   - See recent community messages
   - Delete inappropriate content

## 🔒 Security & Privacy

### Data Security
- All messages stored locally (client-side)
- No server transmission in current implementation
- **Note**: For production, implement encrypted server storage

### User Privacy
- **Location Sharing**: Only when explicitly shared through attachment
- **Anonymous Mode**: Admins can send messages anonymously to users
- **Read Status**: Users see who has read messages
- **Conversation History**: Automatically maintained

### Access Control
- Users must be registered and logged in
- Anonymous users explicitly blocked
- Banned/restricted users can't access messaging
- Admins have full access
- Admin-to-admin messaging available

## 📱 Mobile Responsiveness

Both messaging and moderation features are fully responsive:
- **Mobile**: Single column layout, optimized touch targets
- **Tablet**: Two-column hybrid layout
- **Desktop**: Full three-column layout with optimal spacing

## 🔄 Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration for instant messaging
2. **Message Encryption**: End-to-end encryption for security
3. **File Uploads**: Direct file upload for attachments
4. **Message Search**: Search through message history
5. **User Blocking**: Block unwanted users
6. **Read Receipts**: Double-check marks for read messages
7. **Typing Indicators**: See when user is typing
8. **Emoji Support**: Enhanced emoji reactions and responses
9. **Message Editing**: Edit sent messages
10. **Message Deletion**: Delete specific messages
11. **User Profiles**: View user profile from messaging
12. **Notification System**: Push notifications for new messages

### Database Migration
Currently using localStorage. Production implementation should:
- Migrate to MongoDB/PostgreSQL
- Implement server endpoints
- Add message encryption
- Implement real-time WebSocket updates
- Add message indexing for search

## 🐛 Troubleshooting

### Issue: Can't access private messages
- **Solution**: Ensure you're logged in as a registered user
- **Check**: localStorage has `naijaAmeboCurrentUser`
- **Fix**: Log out and log back in

### Issue: Messages not appearing
- **Solution**: Refresh the page
- **Check**: Browser console for errors
- **Note**: Current implementation is client-side only

### Issue: Restriction not working
- **Solution**: Check if restriction duration hasn't expired
- **Check**: User's `restrictionExpires` date
- **Fix**: Manually remove restriction from moderation dashboard

### Issue: Anonymous mode not working for admins
- **Solution**: Ensure you're logged in as an admin
- **Check**: `currentAdmin.role === 'admin'`
- **Note**: Only admins can send anonymous messages

## 📚 File Structure

```
app/
├── private-messages/
│   └── page.tsx              # Main messaging interface
│
└── admin/
    ├── page.tsx              # Admin dashboard (added quick links)
    └── community-moderation/
        └── page.tsx          # Moderation dashboard

components/
└── Header.tsx                # Updated with messages link

lib/
└── (configuration files)
```

## 🤝 Integration Points

### From Community Chat
Users can navigate to private messages from:
- Header "💬 Messages" link
- Community page "💬 Messages" button

### From Admin Dashboard
Admins can quickly access:
- "🛡️ Community" button → Moderation dashboard
- "💬 Messages" button → Private messaging

### From Moderation Dashboard
Easy navigation to messaging:
- User profile links
- Direct message button (future enhancement)

## 📝 Notes for Developers

### Key Decisions
1. **localStorage Storage**: Chosen for MVP, migrate to database for production
2. **Anonymous Mode**: Only for admins to maintain user anonymity in support interactions
3. **Access Control**: Server-side validation required in production
4. **Real-time Updates**: Client-side only currently, needs WebSocket for production

### Testing Checklist
- [ ] Create test accounts for user-to-user messaging
- [ ] Create admin account and test admin-to-user messaging
- [ ] Test anonymous mode toggle
- [ ] Test restriction and expiration
- [ ] Test message deletion from moderation
- [ ] Test user search functionality
- [ ] Test mobile responsiveness
- [ ] Test attachment menu
- [ ] Test unread counters
- [ ] Test logout and login flow

### Performance Considerations
- Current: All messages in single localStorage array
- Optimization needed: Pagination for large message counts
- Recommendation: Implement message archiving after 30 days

## 📞 Support

For issues or feature requests related to:
- **Messaging System**: Check message logs in browser console
- **Moderation Tools**: Verify admin permissions
- **Data Loss**: Check localStorage quota (usually 5-10MB per domain)

## Version History

- **v1.0** (Current)
  - Private messaging system with 4 message types
  - Community moderation dashboard
  - User ban/restrict functionality
  - Anonymous admin messaging
  - 7 attachment types
  - Conversation management
  - Real-time UI updates (client-side)

---

**Last Updated**: 2024
**Status**: MVP Complete - Ready for Production Migration
