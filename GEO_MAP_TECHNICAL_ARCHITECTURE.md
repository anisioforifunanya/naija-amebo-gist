# 🗺️ Interactive Geo Analytics Map - Technical Architecture

## System Overview

The real-time geo analytics map is a sophisticated, modular system for visualizing user locations and engagement metrics across Nigeria.

```
┌─────────────────────────────────────────┐
│        Dashboard (/geo-map)             │
│   - Statistics Cards                    │
│   - Map Controls (Toggle/Filter)        │
│   - Regional Breakdown Table            │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   InteractiveAnalyticsMap Component     │
│   (Main Map Container)                  │
└──────────────────┬──────────────────────┘
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Leaflet  │ │ Markers  │ │ Heatmap  │
│  Map     │ │ Cluster  │ │  Layer   │
│(OSM)     │ │  Group   │ │(Optional)│
└──────────┘ └──────────┘ └──────────┘
```

## Component Architecture

### 1. Main Component: `InteractiveAnalyticsMap`

**File**: `components/InteractiveAnalyticsMap.tsx`

**Responsibilities**:
- Initialize Leaflet map instance
- Manage marker lifecycle
- Handle clustering and heatmap layers
- Display location data with custom markers

**Props Interface**:
```typescript
interface InteractiveAnalyticsMapProps {
  data?: UserLocation[];           // Custom location data (optional)
  showHeatmap?: boolean;            // Heatmap visibility toggle
  showClusters?: boolean;           // Clustering toggle
  zoomLevel?: number;               // Initial zoom (default: 6)
}
```

### 2. Data Structure: `UserLocation`

```typescript
interface UserLocation {
  id: string;                  // Unique identifier
  name: string;                // Hub/region name
  latitude: number;            // GPS coordinate
  longitude: number;           // GPS coordinate
  city: string;                // City name
  state: string;               // State/region
  activity: number;            // Engagement 0-100%
  users: number;               // Active user count
  lastActive: string;          // Activity timestamp
  avatar?: string;             // Emoji/icon (optional)
}
```

## Core Features

### 1. Map Initialization

```
┌─────────────────────┐
│   useEffect Hook    │
├─────────────────────┤
│ - Create map at     │
│   center (9°N 7°E)  │
│ - Add OSM tiles     │
│ - Initialize        │
│   layers            │
└─────────────────────┘
```

**Default Settings**:
- Center: Nigeria (9.0765°N, 7.3986°E)
- Zoom Level: 6 (regional view)
- Tile Provider: OpenStreetMap
- Attribution: OSM Contributors

### 2. Custom Markers

**Marker Features**:
- Color-coded by engagement level
- Custom HTML content with flexbox layout
- Popup with detailed statistics
- Smooth animations
- Hover effects

**Color Mapping Algorithm**:
```typescript
const getMarkerColor = (activity: number) => {
  if (activity >= 80) return '#ef4444';  // Red
  if (activity >= 60) return '#f97316';  // Orange
  if (activity >= 40) return '#eab308';  // Yellow
  return '#22c55e';                       // Green
};
```

**Marker Content Structure**:
```
┌──────────────────────────┐
│  Hub Name & Location     │ ← Custom HTML
│  👥 Users | ⚡ Activity  │
│  Last: 2 mins ago        │
└──────────────────────────┘
        │
        ▼
    Colored Dot
    (Glow Effect)
```

### 3. Marker Clustering

**Library**: `leaflet.markercluster`

**Configuration**:
```typescript
{
  maxClusterRadius: 80,        // Cluster radius in pixels
  spiderfyOnMaxZoom: true,     // Spider effect on click
  showCoverageOnHover: true    // Show coverage circle
}
```

**Features**:
- Automatic grouping by proximity
- Dynamic cluster count display
- Spider effect for expansion
- Performance optimization

### 4. Heatmap Layer

**Library**: `leaflet-heatmap`

**Data Format**:
```typescript
[
  [latitude, longitude, intensity],  // intensity: 0-1
  [6.5244, 3.3792, 0.95],
  [9.0765, 7.3986, 0.87],
  // ... more points
]
```

**Gradient Mapping**:
```
0.0 ──► Blue   (Low activity)
0.25 ──► Green
0.5  ──► Yellow (Medium activity)
0.75 ──► Orange
1.0  ──► Red    (High activity)
```

**Heatmap Configuration**:
```typescript
{
  radius: 50,              // Radius of influence
  blur: 15,                // Blur radius
  maxZoom: 17,             // Maximum zoom level
  gradient: {              // Custom gradient
    0.0: '#0000ff',
    0.25: '#00ff00',
    0.5: '#ffff00',
    0.75: '#ff7f00',
    1.0: '#ff0000'
  }
}
```

## Styling System

### CSS Architecture

**File**: `styles/interactive-map.css`

**Styling Layers**:

1. **Base Leaflet Styles**
   - Popup styling
   - Container styling
   - Marker customization

2. **Dark Mode Support**
   - Dark popup backgrounds
   - Light text in dark mode
   - Adjusted cluster colors

3. **Custom Marker Styles**
   - Glow effect
   - Hover animations
   - Border colors by activity

```css
.leaflet-popup-content-wrapper {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.dark .leaflet-popup-content-wrapper {
  background: #1f2937;
  color: white;
}
```

## Data Flow

### Rendering Pipeline

```
1. Component Mount
   ├─ Check if already initialized
   ├─ Create map instance
   └─ Add tile layer

2. Data Processing
   ├─ Convert to marker format
   ├─ Calculate colors
   └─ Generate popups

3. Layer Creation
   ├─ Add cluster group (if enabled)
   ├─ Add markers to clusters
   ├─ Add heatmap (if enabled)
   └─ Attach event handlers

4. Display
   └─ Render map with all layers
```

### State Management

```typescript
const [mounted, setMounted] = useState(false);
// Tracks component mounting for client-side only code

const mapRef = useRef<L.Map | null>(null);
// Reference to Leaflet map instance

const markerClusterGroupRef = useRef<any>(null);
// Reference to marker cluster group

const heatmapLayerRef = useRef<any>(null);
// Reference to heatmap layer
```

## Performance Optimization

### 1. Lazy Loading
- Map only initialized on first render
- Tiles loaded as viewport changes
- Ref-based instance management

### 2. Marker Clustering
- Reduces DOM nodes for large datasets
- Auto-cluster when zoomed out
- Expand on demand with spider effect

### 3. Heatmap Rendering
- Debounced updates
- WebGL acceleration (browser dependent)
- Optional rendering

### 4. Event Handlers
- Click: Opens popup with stats
- Hover: Shows preview
- Cluster click: Expands markers

## Integration Points

### With Dashboard

**File**: `app/dashboard/geo-map/page.tsx`

**Integration Features**:
- Toggle controls for heatmap/clustering
- Summary statistics cards
- Regional breakdown table
- Real-time data loading

### API Ready

To connect real data:

```typescript
// Fetch from API
const response = await fetch('/api/analytics/locations');
const data = await response.json();
setLocations(data);

// Pass to map
<InteractiveAnalyticsMap data={locations} />
```

## Browser Compatibility

**Supported**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements**:
- ES6 JavaScript support
- CSS Grid/Flexbox
- WebGL (for heatmap optimization)
- Geolocation API (optional)

## Security & Privacy

### Data Handling
- Locations stored client-side only (in state)
- No data sent to analytics by default
- Ready for GDPR/privacy compliance

### Map Data
- Public OpenStreetMap tiles
- No proprietary map data
- Open-source libraries only

## Extension Points

### Custom Data Integration

```typescript
const customData: UserLocation[] = [/* your data */];
<InteractiveAnalyticsMap data={customData} />
```

### Styling Customization

```css
/* Override in global CSS */
.leaflet-marker-cluster {
  background-color: #your-color;
}
```

### Event Handling

```typescript
marker.on('click', () => {
  // Custom logic
});

marker.on('mouseover', () => {
  // Preview logic
});
```

## Future Enhancements

### Phase 2: Real-Time Updates
```
WebSocket
    ↓
Live Location Feed
    ↓
Map Re-render
    ↓
Smooth Animations
```

### Phase 3: Advanced Features
- Time-series visualization
- User profile integration
- Location-based messaging
- Predictive analytics

### Phase 4: Export & Analytics
- CSV/JSON export
- Report generation
- Image capture
- Analytics dashboard

## Troubleshooting Guide

### Symptom: Map not rendering
**Check**:
1. Container has defined height
2. Leaflet CSS is imported
3. DOM element with id="analytics-map" exists

### Symptom: Markers invisible
**Check**:
1. Data format matches UserLocation interface
2. Latitude/longitude are valid
3. Map is not zoomed too far out
4. Heatmap not obscuring markers

### Symptom: Heatmap not visible
**Check**:
1. Activity values between 0-100
2. showHeatmap prop is true
3. Browser supports WebGL
4. leaflet-heatmap library loaded

### Symptom: Poor performance
**Optimize**:
1. Enable marker clustering
2. Reduce animation complexity
3. Use simpler tile provider
4. Limit data points shown

## Dependencies

```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "leaflet.markercluster": "^1.5.1",
  "leaflet-heatmap": "^0.2.0"
}
```

## Files Summary

| File | Purpose | Size |
|------|---------|------|
| `InteractiveAnalyticsMap.tsx` | Main component | ~350 lines |
| `interactive-map.css` | Styling | ~80 lines |
| `geo-map/page.tsx` | Dashboard page | ~240 lines |
| `GEO_ANALYTICS_MAP_GUIDE.md` | User guide | ~450 lines |

---

**Architecture Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Production Ready ✅
