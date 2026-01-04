# 🎯 Feature Walkthrough: Private Messaging & Community Moderation

## Part 1: Private Messaging System

### Accessing Private Messages

#### Method 1: From Header Navigation
```
Home Page / Any Page
    ↓
Click "💬 Messages" in header navigation
    ↓
Redirects to /private-messages
    ↓
Shows conversation list and message interface
```

#### Method 2: From Community Chat
```
Community Chat (/community)
    ↓
Click "💬 Messages" button (top right)
    ↓
Redirects to /private-messages
```

#### Method 3: From Admin Dashboard
```
Admin Dashboard (/admin)
    ↓
Click "💬 Messages" quick link button
    ↓
Redirects to /private-messages
```

### Sending Your First Message

#### Step 1: Start New Conversation
```
Private Messages Page
├─ Left Panel: Conversations List
│  └─ Click "New Message" button (blue)
│     ├─ Search box appears
│     ├─ Lists all users except yourself
│     └─ Click on user to select
│
└─ Middle Panel: Message Thread
   └─ "Select a conversation to start messaging"
```

#### Step 2: Type and Send
```
Middle Panel: Message View
├─ Shows selected user name
├─ Shows previous messages (if any)
├─ Input Area:
│  ├─ Text field: "Type a message..."
│  ├─ Attachment button (📎)
│  └─ Send button
│
└─ Type your message and press Enter or click Send
   └─ Message appears immediately with timestamp
```

#### Step 3: View Attachments Menu
```
Click Attachment Button (📎)
    ↓
Menu appears with 7 options:
├─ 🖼️  Gallery (2 columns, touch/click to select)
├─ 💳 Wallet
├─ 📄 Files
├─ 📍 Location
├─ 📊 Poll
├─ 👤 Contact
└─ 🎵 Music

Click selection → Popup: "Gallery attachment - Feature coming soon!"
```

### Managing Conversations

#### Viewing Conversation List
```
Left Panel - Conversations
├─ Each conversation shows:
│  ├─ User name with emoji (👑 for admin)
│  ├─ Last message preview (truncated)
│  ├─ Timestamp of last message
│  └─ Unread badge (blue, showing count)
│
└─ Click to select and view messages
```

#### Unread Message Badges
```
Conversation with 3 unread messages:
User Name  👑 Admin        💬
Last message... 2024-01-15  [3]  ← Blue badge showing count
```

#### Conversation Selection Highlight
```
Selected conversation shows:
├─ Light blue/purple background
├─ All message history
└─ Previous messages visible with times
```

### Anonymous Admin Messaging

#### For Regular Users
```
User cannot see "Send Anonymous" checkbox
(Only admins have this feature)
```

#### For Admins
```
When messaging a user:
├─ Header shows user name
├─ Checkbox appears: "☑️ Send Anonymous"
│
├─ When checked:
│  ├─ "Send Anonymous" label visible
│  ├─ User receives message without seeing admin name
│  └─ Message shows "(Anonymous)" timestamp
│
└─ When unchecked:
   ├─ Message shows admin name
   └─ User knows it's from admin
```

---

## Part 2: Community Moderation Dashboard

### Accessing Moderation Dashboard

#### Method 1: From Admin Dashboard
```
Admin Dashboard (/admin)
    ↓
Top right area - Quick Links
    ↓
Click "🛡️ Community" button (purple gradient)
    ↓
Redirects to /admin/community-moderation
```

#### Method 2: Direct URL
```
Navigate directly to:
/admin/community-moderation
```

### Statistics Dashboard

#### Cards Display
```
┌─ Moderation Dashboard Header ──────────────┐
│ 🛡️ Community Moderation                    │
│ Manage users and content                   │
└────────────────────────────────────────────┘

Statistics Cards (4 cards):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Total Users  │  │ Active Users │  │ Restricted   │  │ Banned Users │
│      4       │  │      2       │  │      1       │  │      1       │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

#### Understanding Metrics
- **Total Users**: All registered user accounts
- **Active Users**: Users without bans/restrictions
- **Restricted Users**: Users with temporary restrictions
- **Banned Users**: Permanently banned accounts

### User Management

#### Filtering Users
```
User List Panel - Top
├─ "All Users" dropdown
│  ├─ Shows: All Users
│  ├─ Shows: Banned Only
│  └─ Shows: Restricted Only
│
└─ Search box: "Search by name/username"
   └─ Real-time filtering as you type
```

#### Viewing User Details
```
User List (Left):              User Details Panel (Right):
├─ John Doe                    ├─ Name: John Doe
│  Status: Active              ├─ Username: johndoe
│  [Click to select]           ├─ Email: john@example.com
│                              ├─ Status: 🟢 Active
├─ Jane Smith                  │
│  Status: Restricted          ├─ Actions:
│  [Click to select]           │  ├─ Restrict User (button)
│                              │  ├─ Ban User (button)
└─ Admin User                  │  ├─ Unrestrict (greyed if not restricted)
   Status: Banned              │  └─ Unban (greyed if not banned)
   [Click to select]           │
                               └─ If Restricted:
                                  ├─ Reason: [text]
                                  └─ Expires: 2024-01-22
```

### Taking Moderation Actions

#### Restricting a User
```
1. Select user from list
2. Click "Restrict User" button (yellow)
3. Modal/Form appears:
   ├─ "Restriction Reason" textarea
   │  └─ Example: "Spam posting"
   │
   ├─ "Duration (days)" input
   │  └─ Range: 1-365 days
   │  └─ Example: 7 days
   │
   └─ "Restrict" button
      └─ User status changes to "Restricted"
         └─ Shows: "Expires: [calculated date]"
```

#### Banning a User
```
1. Select user from list
2. Click "Ban User" button (red)
3. Modal/Form appears:
   ├─ "Ban Reason" textarea
   │  └─ Example: "Harassment and abuse"
   │
   └─ "Ban User" button
      └─ User status changes to "Banned"
         └─ Cannot access any platform features
```

#### Unrestricting a User
```
User is currently Restricted:
├─ Status shows: 🟡 Restricted
├─ "Unrestrict" button visible
│
Click "Unrestrict"
├─ User immediately restored
├─ Status changes to: 🟢 Active
└─ Restriction removed even if not expired
```

#### Unbanning a User
```
User is currently Banned:
├─ Status shows: 🔴 Banned
├─ "Unban" button visible
│
Click "Unban"
├─ User immediately unbanned
├─ Can access platform again
└─ All privileges restored
```

### Content Moderation

#### Recent Messages Section
```
Recent Community Messages:
├─ Message: "Check out this gossip!"
│  User: john_doe
│  Time: 2024-01-15 10:30
│  [Delete Message] button
│
├─ Message: "Breaking news incoming..."
│  User: jane_smith
│  Time: 2024-01-15 10:25
│  [Delete Message] button
│
└─ Message: "You won't believe this!"
   User: another_user
   Time: 2024-01-15 10:20
   [Delete Message] button
```

#### Deleting a Message
```
1. Locate message in list
2. Click [Delete Message] button
3. Message is removed from community chat
4. Entry removed from recent list
```

---

## Part 3: User Experience Flows

### Flow 1: User Sends Private Message

```
START: User on Community Page
   ↓
Click "💬 Messages" button
   ↓
Redirected to /private-messages
   ↓
Click "New Message" button
   ↓
Search for "jane_smith" in search box
   ↓
Click "jane_smith" from results
   ↓
Type: "Hi Jane! How are you?"
   ↓
Click Send
   ↓
Message appears with timestamp "10:30 AM"
   ↓
Jane sees message (with timestamp shown)
   ↓
Jane clicks Messages
   ↓
Jane replies: "I'm good! How about you?"
   ↓
You see Jane's reply immediately
   ↓
Continue conversation...
```

### Flow 2: Admin Moderates User

```
START: Admin on Dashboard
   ↓
Click "🛡️ Community" quick link
   ↓
View statistics cards
   ↓
See "Restricted Users: 1"
   ↓
Click "Restricted" filter dropdown
   ↓
See "spammer_user" in list
   ↓
Click to select "spammer_user"
   ↓
View details panel:
   ├─ Name: John Spammer
   ├─ Status: 🟡 Restricted
   ├─ Reason: "Excessive spam posting"
   └─ Expires: 2024-01-22
   ↓
Click "Unrestrict" button
   ↓
Status changes to "🟢 Active"
   ↓
User can now post/chat again
```

### Flow 3: Admin Sends Anonymous Message

```
START: Admin on Private Messages
   ↓
Click "New Message"
   ↓
Search and select "regular_user"
   ↓
Type: "We received complaints about your posts."
   ↓
See checkbox: "☑️ Send Anonymous"
   ↓
Check the anonymous checkbox
   ↓
Click Send
   ↓
User receives message without knowing admin name
   ↓
User sees: "(Anonymous) 2:45 PM"
   ↓
User can reply to anonymous message
   ↓
You see reply in conversation
```

### Flow 4: Admin Bans User

```
START: Admin on Moderation Dashboard
   ↓
See "Banned Users: 1" card
   ↓
Click on banned user to select
   ↓
View details: 🔴 Banned
   ↓
Reason: "Harassment and threats"
   ↓
User can no longer:
   ├─ Login to account
   ├─ View any content
   ├─ Post messages
   ├─ Access community chat
   └─ Send messages
   ↓
Later: User appeals ban
   ↓
Click "Unban" button
   ↓
Status: 🟢 Active
   ↓
User can login and use platform again
```

---

## Part 4: Key UI Elements

### Button States

```
Primary Buttons:
├─ Send (Blue gradient) - Enabled when message typed
├─ New Message (Blue) - Always enabled
├─ Restrict (Yellow) - Enabled when user selected
└─ Ban (Red) - Enabled when user selected

Secondary Buttons:
├─ Unrestrict (Grey) - Only if user restricted
├─ Unban (Grey) - Only if user banned
├─ Delete Message (Red) - Always enabled
└─ [Attachment type] (Grid) - Always enabled

Toggle Buttons:
└─ Send Anonymous (Checkbox for admins only)
```

### Status Indicators

```
User Status Colors:
├─ 🟢 Active (Green) - User is normal
├─ 🟡 Restricted (Yellow) - User temporarily limited
└─ 🔴 Banned (Red) - User permanently banned

Message Status:
├─ Unread badge [3] - Blue circle with count
└─ (Anonymous) label - When sent by admin anonymously
```

### Responsive Layout

```
Desktop (Large Screen):
┌─────────────────────────────────────┐
│ [Conv List] │ [Message View] │ [Info] │  ← 3 columns
└─────────────────────────────────────┘

Tablet (Medium Screen):
┌──────────────────────────────────┐
│ [Conv List] │ [Message View]      │  ← 2 columns
└──────────────────────────────────┘

Mobile (Small Screen):
┌──────────────────┐
│ [Conversations]  │  ← Full width, switched by buttons
│ [Messages]       │
└──────────────────┘
```

---

## Part 5: Data Persistence

### What Gets Saved

```
localStorage Keys:

1. naijaAmeboCurrentUser
   └─ Currently logged-in user data
   └─ Checked at /private-messages load

2. naijaAmeboPrivateMessages
   └─ All private messages array
   └─ Updated whenever message sent
   └─ Loaded on /private-messages open

3. naijaAmeboUsers
   └─ All user accounts
   └─ Updated when restricted/banned
   └─ Used for search functionality

4. naijaAmeboAdmins
   └─ All admin accounts
   └─ Loaded for admin messaging
```

### Auto-Expiring Restrictions

```
When User is Restricted:
├─ restrictionExpires set to future date
├─ Community page checks on login:
│  └─ If date passed: restriction removed
│  └─ If date pending: user blocked
│
Moderation Dashboard:
├─ Shows expiration date
├─ Auto-updates on next load
└─ Can manually unrestrict anytime
```

---

## 🎓 Quick Reference Table

| Feature | User | Admin | Anonymous User |
|---------|------|-------|-----------------|
| Send Messages | ✅ | ✅ | ❌ |
| Receive Messages | ✅ | ✅ | ❌ |
| See Unread Count | ✅ | ✅ | N/A |
| Use Attachments | ✅ | ✅ | ❌ |
| Send Anonymous | ❌ | ✅ | ❌ |
| Access Moderation | ❌ | ✅ | ❌ |
| Ban Users | ❌ | ✅ | ❌ |
| Restrict Users | ❌ | ✅ | ❌ |
| Delete Messages | ❌ | ✅ | ❌ |
| View Statistics | ❌ | ✅ | ❌ |

---

## 🎯 Common Tasks

### "I want to block a user from posting"
1. Go to Community Moderation
2. Search for user
3. Click to select
4. Click "Restrict User"
5. Enter reason
6. Set duration (e.g., 7 days)
7. Click Restrict

### "I want to give a user warning"
1. Go to Private Messages
2. Click New Message
3. Find user
4. Check "Send Anonymous"
5. Type warning message
6. Send
7. User won't know it's from admin

### "I need to remove a spammer's message"
1. Go to Community Moderation
2. Find message in "Recent Messages"
3. Click [Delete Message]
4. Message removed from chat

### "I want to message another admin privately"
1. Go to Private Messages
2. Click New Message
3. Search for admin (shows 👑 emoji)
4. Type message
5. Send
6. Admin receives message

---

**All features are now live and ready to use!** 🎉

For technical details, see: `MESSAGING_SYSTEM_GUIDE.md`
For implementation details, see: `IMPLEMENTATION_SUMMARY.md`
