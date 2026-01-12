# 🗺️ Real-Time Geo Analytics Map - Snapchat-Style Implementation

## Overview

Added a Snapchat-style interactive real-time location map to the Naija Amebo Gist platform's analytics dashboard. This feature combines live geolocation tracking with heat mapping and user clustering for comprehensive analytics visualization.

## Features

### 🎯 Core Features

1. **Interactive Leaflet Map**
   - Real-time visualization of user locations across Nigeria
   - Centered on Nigeria with default zoom level of 6
   - Smooth animations and intuitive interactions

2. **Smart Marker System**
   - Custom-styled markers showing user activity levels
   - Color-coded by engagement (Red=95%+ active, Orange=80-94%, Yellow=60-79%, Green=<60%)
   - Hover effects with real-time data display
   - Click to see detailed popup with full analytics

3. **Marker Clustering (Optional)**
   - Groups nearby markers for cleaner visualization
   - Dynamic cluster sizing based on density
   - Spider effect when clicking clusters
   - Toggle-able in map controls

4. **Activity Heatmap Layer (Optional)**
   - Shows user concentration and engagement density
   - Color gradient from blue (low) to red (high activity)
   - Fully customizable intensity
   - Toggle-able in map controls

5. **Real-Time Data Display**
   - Live user counts per region
   - Engagement scores (0-100)
   - Last active timestamp
   - City and state information
   - Custom avatars/emojis per region

## Architecture

### Component: `InteractiveAnalyticsMap`

**Location:** `components/InteractiveAnalyticsMap.tsx`

**Props:**
```typescript
interface InteractiveAnalyticsMapProps {
  data?: UserLocation[];           // Optional custom location data
  showHeatmap?: boolean;            // Toggle heatmap layer (default: true)
  showClusters?: boolean;           // Toggle marker clustering (default: true)
  zoomLevel?: number;               // Initial zoom level (default: 6)
}

interface UserLocation {
  id: string;                       // Unique identifier
  name: string;                     // Location display name
  latitude: number;                 // GPS latitude
  longitude: number;                // GPS longitude
  city: string;                     // City name
  state: string;                    // State/region name
  activity: number;                 // Engagement score 0-100
  users: number;                    // Number of users in location
  lastActive: string;               // Last activity timestamp
  avatar?: string;                  // Optional emoji/avatar
}
```

### Dashboard Integration

**File:** `app/dashboard/geo-map/page.tsx`

**Features:**
- Toggle controls for heatmap and clustering
- Summary statistics cards
- Regional breakdown with percentage bars
- Heat intensity legend
- Real-time data loading

## Usage

### Basic Implementation

```tsx
import InteractiveAnalyticsMap from '@/components/InteractiveAnalyticsMap';

export default function YourComponent() {
  return (
    <div style={{ height: '600px' }}>
      <InteractiveAnalyticsMap 
        showHeatmap={true}
        showClusters={true}
        zoomLevel={6}
      />
    </div>
  );
}
```

### With Custom Data

```tsx
const customLocations: UserLocation[] = [
  {
    id: 'location-1',
    name: 'Downtown Hub',
    latitude: 6.5244,
    longitude: 3.3792,
    city: 'Lagos',
    state: 'Lagos',
    activity: 92,
    users: 450,
    lastActive: '2 mins ago',
    avatar: '🌟'
  },
  // ... more locations
];

<InteractiveAnalyticsMap data={customLocations} />
```

### Dynamic Toggle Controls

```tsx
const [showHeatmap, setShowHeatmap] = useState(true);
const [showClusters, setShowClusters] = useState(true);

return (
  <>
    <label>
      <input 
        type="checkbox" 
        checked={showHeatmap}
        onChange={(e) => setShowHeatmap(e.target.checked)}
      />
      Show Heatmap
    </label>
    <InteractiveAnalyticsMap 
      showHeatmap={showHeatmap}
      showClusters={showClusters}
    />
  </>
);
```

## Marker Color Coding

The map uses color gradients to represent user engagement levels:

| Color | Activity Level | Engagement Score |
|-------|---|---|
| 🔴 Red | Very High | 80-100% |
| 🟠 Orange | High | 60-79% |
| 🟡 Yellow | Medium | 40-59% |
| 🟢 Green | Low | 0-39% |

## Data Display

### Marker Popup Information

When clicking a marker, users see:
- Location name and region
- Number of active users
- Engagement percentage with visual bar
- Last activity timestamp
- Visual engagement indicator

### Interactive Features

- **Hover**: Shows location preview with key stats
- **Click**: Opens detailed popup with full analytics
- **Cluster Click**: Spider effect showing individual markers
- **Drag**: Pan the map to explore different regions
- **Scroll**: Zoom in/out for detailed/overview perspective

## Real-Time Updates

Current implementation uses mock data. To integrate with real data:

```tsx
// In your component
const [locations, setLocations] = useState<UserLocation[]>([]);

useEffect(() => {
  // Fetch from your API
  const fetchLocations = async () => {
    const response = await fetch('/api/analytics/locations');
    const data = await response.json();
    setLocations(data);
  };

  fetchLocations();
  
  // Optional: Poll for updates every 30 seconds
  const interval = setInterval(fetchLocations, 30000);
  return () => clearInterval(interval);
}, []);

<InteractiveAnalyticsMap data={locations} />
```

## Styling & Dark Mode

The component includes:
- Full Tailwind CSS dark mode support
- Responsive design for all screen sizes
- Custom Leaflet popup styling
- Smooth transitions and animations
- Mobile-friendly touch controls

## Libraries Used

1. **leaflet** (^1.9.4)
   - Core mapping library
   - OpenStreetMap tile provider
   - GeoJSON support

2. **react-leaflet** (^4.2.1)
   - React wrapper for Leaflet
   - Component-based map building

3. **leaflet.markercluster**
   - Marker clustering and spiderfication
   - Performance optimization for large datasets

4. **leaflet-heatmap**
   - Heatmap layer visualization
   - Customizable gradients and intensity

## Performance Considerations

- **Large Datasets**: Clustering automatically enabled for 100+ markers
- **Rendering**: Lazy loading of map tiles
- **Updates**: Debounced re-renders on data changes
- **Mobile**: Touch-optimized controls and responsive sizing

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers with touch support
- Requires JavaScript enabled
- WebGL support for optimal heatmap rendering

## Next Steps

To extend this feature further:

1. **Real-Time WebSocket Integration**
   ```typescript
   // Connect to WebSocket for live location updates
   ```

2. **Custom Filters**
   - Filter by activity level
   - Filter by user demographics
   - Time-based analytics

3. **Export Analytics**
   - Download location data as CSV/JSON
   - Generate heat maps as images
   - Create location reports

4. **Advanced Heatmap**
   - Time-series heatmaps
   - Activity pattern analysis
   - Predictive location recommendations

5. **User Profile Links**
   - Click markers to view trending users
   - See recent activity feeds by location
   - Location-based user discovery

## Troubleshooting

### Map Not Rendering
- Ensure container has defined height
- Check browser console for CSS/JS errors
- Verify Leaflet CSS is properly imported

### Markers Not Showing
- Check data format matches `UserLocation` interface
- Verify latitude/longitude values are valid
- Ensure component is mounted before data update

### Heatmap Not Visible
- Toggle heatmap in map controls
- Check leaflet-heatmap library is installed
- Verify activity scores are between 0-100

### Dark Mode Issues
- Restart development server
- Clear browser cache
- Check dark class applied to parent elements

## Files Modified

- `components/InteractiveAnalyticsMap.tsx` (NEW)
- `app/dashboard/geo-map/page.tsx` (UPDATED)
- `package.json` (UPDATED with new dependencies)

## Access

Visit the map at: `/dashboard/geo-map`

The feature is integrated into the main analytics dashboard and accessible to logged-in users only.
