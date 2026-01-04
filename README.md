# Naija Amebo Gist

A celebrity news platform built with Next.js, Tailwind CSS, Sanity CMS, Supabase, and more.

## Features

- Homepage with trending news, celebrity highlights, and viral stories
- Breaking News Section
- Trending Stories Section
- Celebrity News Section
- Entertainment News Section
- Viral Content Section
- Social Media Embed Integration
- Gossip & Rumors Section
- Exclusive Interviews
- Photo Galleries
- Short Video Clips
- Long-Form Video Content
- Live Streaming
- Headlines & Banner Sliders
- Search Bar
- Categories & Tags
- Author & Blogger Profiles
- Date & Time Stamp
- Comment Section
- Emoji Reaction Buttons
- Social Media Share Buttons
- WhatsApp Broadcast & Channel Integration
- Telegram Channel Integration
- TikTok Page Integration
- Instagram Feed Integration
- YouTube Channel Integration
- X (Twitter) Feed Integration
- Threads Integration
- Push Notifications
- Newsletter Subscription
- Mobile-First Responsive Design
- Dark Mode
- Advertisement Sections
- Sponsored & Paid Content
- Influencer Promotion Section
- Polls & Fan Voting
- Comment Moderation System
- Fact-Check & Source Labels
- Archive Section
- Local & International Celebrity Coverage
- Events Coverage
- Fashion & Lifestyle Section
- Music & Movie Release Updates
- Fan Community Features
- Live Location Tracking & Geolocation
- Real-Time GPS Tracking with High Accuracy
- Interactive Map Visualization
- Attachment Sharing (Gallery, Files, Music, Location)
- Voice & Video Recording
- **Private Messaging System** - Advanced messaging between users and admins
  - User-to-user direct messaging
  - Admin-to-user messaging with anonymous mode
  - User-to-admin support tickets
  - Admin-to-admin internal communication
  - Attachment support in messages (Gallery, Wallet, Files, Location, Poll, Contact, Music)
  - Real-time message updates
  - Unread message indicators
  - Conversation management
  - Message-based attachments
- **Community Moderation Dashboard** - Advanced user and content management
  - User statistics and filtering
  - Ban users with reason tracking
  - Restrict users with time-based expiration
  - Message deletion from community chat
  - Restriction expiration management
- Feedback & Tip-Off Page
- Privacy Policy Page
- Terms & Copyright Page
- About Us Page
- Contact & Business Enquiries Page
- Monetization & Creator Tools

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- Next.js 16.1.1
- React 18
- TypeScript 5
- Tailwind CSS 3.3.0
- Leaflet 1.9.4 (Mapping Library)
- react-leaflet 4.2.1 (React Leaflet Wrapper)
- Browser Geolocation API (GPS Tracking)
- MediaRecorder API (Voice/Video Recording)
- Sanity CMS (planned)
- Supabase (planned)
- OneSignal (planned)
- Algolia (planned)
- Vercel (deployment)

## Project Structure

- `app/` - Next.js App Router pages
  - `location/` - Live Location Tracker page
  - `community/` - Community chat with location sharing
  - `admin/` - Admin dashboard with management features
- `components/` - Reusable React components
  - `LocationTracker.tsx` - Real-time GPS tracking component
  - `Header.tsx` - Navigation header
  - `Footer.tsx` - Site footer
- `lib/` - Utility functions and configurations
  - `leaflet-config.ts` - Leaflet icon configuration

## Key Features

### Live Location Tracking
- **Real-time GPS tracking** with high accuracy mode (uses GPS when available)
- **Continuous position updates** using watchPosition API (updates as you move)
- **Interactive map** powered by Leaflet and OpenStreetMap
- **Accuracy visualization** with circle radius showing GPS precision
- **Speed tracking** showing current velocity in km/h
- **Privacy-focused** - all data processed locally, no server tracking
- **Fast updates** - typically 1-2 second refresh rate
- **Location sharing** in community chat

### Private Messaging System
- **Multiple message types:**
  - User-to-user direct messaging
  - Admin-to-user messaging with optional anonymous mode
  - User-to-admin support messages
  - Admin-to-admin internal communication
- **Rich attachments:**
  - 🖼️ Gallery images
  - 💳 Wallet/Payment info
  - 📄 File sharing
  - 📍 Live location
  - 📊 Polls
  - 👤 Contact cards
  - 🎵 Music sharing
- **Access Control:**
  - Registered users only (sign-up required)
  - All admins have automatic access
- **Features:**
  - Real-time conversation list with last message preview
  - Unread message counters
  - Message timestamps
  - Anonymous mode toggle for admins
  - Conversation history
  - User search and filtering

### Community Moderation Dashboard
- **User Management:**
  - View all users with real-time statistics
  - Filter by status (all/banned/restricted)
  - Ban users with detailed reason tracking
  - Restrict users with time-based expiration (1-365 days)
  - Unrestrict/Unban user accounts
  - User account details and status display
- **Content Moderation:**
  - View recent community messages
  - Delete messages from public chat
  - Automatic restriction expiration
- **Statistics:**
  - Total users count
  - Active users tracking
  - Restricted users count
  - Banned users count

### Community Features
- **Real-time chat** with message reactions
- **Attachment support** - share gallery, files, music, location
- **Voice & video recording** with inline controls
- **User presence** tracking
- **Anonymous mode** option

### Admin Dashboard
- **Dual admin creation** - create new admins OR promote existing users
- **Statistics dashboard** - view counts for news, admins, users, messages
- **Permission system** - 6 granular permissions for role management
- **User management** - ban, restrict, promote users
- **Quick access links** - Community Moderation and Private Messages buttons

## Usage

### Private Messaging

#### For Registered Users
1. **Access Messages:**
   - Navigate to `/private-messages` or click "💬 Messages" in the header
   - Only available for registered users with an account

2. **Start a Conversation:**
   - Click "New Message" button
   - Search for a user or admin by name or username
   - Click to select and start conversation

3. **Send Messages:**
   - Type your message in the input field
   - Click send or press Enter
   - Messages appear in real-time with timestamps

4. **Share Attachments:**
   - Click the attachment icon (📎)
   - Select attachment type:
     - 🖼️ Gallery
     - 💳 Wallet
     - 📄 Files
     - 📍 Location
     - 📊 Poll
     - 👤 Contact
     - 🎵 Music

#### For Admins
1. All messaging features are automatically available
2. **Anonymous Mode:**
   - Toggle "Send Anonymous" checkbox when messaging users
   - Admin name will be hidden, showing as "Anonymous Admin"
3. Can message any user, other admins, or respond to user inquiries

### Community Moderation

1. **Access Moderation Dashboard:**
   - Click "🛡️ Community" button in admin dashboard
   - Or navigate to `/admin/community-moderation`

2. **Manage Users:**
   - View user statistics (total, active, restricted, banned)
   - Search and filter users by status
   - Select a user to view details

3. **Restrict Users:**
   - Click "Restrict User" button
   - Enter restriction reason
   - Select duration (1-365 days)
   - User cannot post/chat until restriction expires

4. **Ban Users:**
   - Click "Ban User" button
   - Enter ban reason
   - User account is permanently banned

5. **Unrestrict/Unban:**
   - Click buttons next to restricted/banned users
   - Immediately removes restriction or ban

6. **Moderate Messages:**
   - View recent community messages
   - Delete inappropriate messages
   - Manage community content quality

### Accessing Location Tracker

Visit `/location` to access the standalone location tracker with full features:
- Choose between single-point or continuous tracking
- View real-time GPS coordinates
- Monitor accuracy and speed
- Track your movement history

### Using Location in Community Chat

1. Navigate to `/community`
2. Click the attachment icon next to the send button
3. Select "Location" from the menu
4. Grant location permissions
5. Start tracking to share your live location

## Browser Compatibility

The location tracking feature requires:
- Modern browser with Geolocation API support
- HTTPS connection (required by browsers for security)
- Location permissions granted by user

Tested on:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please read the contributing guidelines first.

## License

This project is licensed under the MIT License.