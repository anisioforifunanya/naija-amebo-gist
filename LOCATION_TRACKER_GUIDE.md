# Live Location Tracking - User Guide

## Overview

The Naija Amebo Gist platform now includes an advanced real-time geolocation tracking system that allows users to share and view their live location with high accuracy GPS positioning.

## Features

### Real-Time GPS Tracking
- **High Accuracy Mode**: Uses GPS when available for precision within meters
- **Continuous Updates**: Position refreshes automatically as you move (typically 1-2 seconds)
- **No Cached Data**: Always uses fresh position data (maximumAge: 0)
- **Fast Response**: 10-second timeout for position requests

### Interactive Map Display
- **Powered by Leaflet**: Open-source mapping library with OpenStreetMap tiles
- **Live Marker**: Your position shown with a blue marker that updates in real-time
- **Accuracy Circle**: Visual representation of GPS precision
- **Popup Information**: Click marker to see detailed location data

### Location Statistics
- **Coordinates**: Latitude and longitude displayed to 6 decimal places
- **Accuracy**: GPS precision in meters
- **Speed**: Current velocity in km/h (when available)
- **Altitude**: Height above sea level (when available)
- **Heading**: Direction of travel (when available)
- **Tracking History**: Last 50 positions tracked

## How to Use

### Standalone Location Tracker

1. **Navigate to Location Page**
   - Click on `/location` or use the location link in the navigation menu

2. **Grant Location Permission**
   - Your browser will request location access
   - Click "Allow" to enable GPS tracking
   - This is required for the feature to work

3. **Choose Tracking Mode**
   - **Single Point**: Gets your location once
   - **Continuous**: Tracks your location in real-time as you move

4. **Start Tracking**
   - Click the "Start Tracking" button
   - The map will center on your current position
   - Green dot indicates active tracking

5. **View Your Location**
   - See your coordinates in the info panel
   - Watch the map marker update as you move
   - Monitor accuracy and speed statistics

6. **Stop Tracking**
   - Click "Stop Tracking" when done
   - Tracking will automatically stop when you leave the page

### Location Sharing in Community Chat

1. **Open Community Chat**
   - Navigate to `/community`
   - Login if you haven't already

2. **Access Location Sharing**
   - Click the attachment icon (📎) next to the send button
   - Select "Location" from the attachment menu

3. **Enable Tracking**
   - A location tracker modal will appear
   - Grant location permissions if prompted
   - Click "Start Tracking"

4. **Share Your Location**
   - Your live location will be displayed on the map
   - Other community members can see where you are
   - Close the modal when done

## Technical Details

### GPS Configuration
```javascript
{
  enableHighAccuracy: true,  // Use GPS for best precision
  timeout: 10000,            // 10 seconds max wait time
  maximumAge: 0              // No cached positions
}
```

### Update Frequency
- **Continuous Mode**: Updates whenever position changes (typically 1-2 seconds)
- **Movement Detection**: Automatically updates when you move
- **Background Tracking**: Continues tracking while modal is open

### Accuracy Levels
- **High Accuracy (0-10m)**: GPS active, outdoor location
- **Medium Accuracy (10-100m)**: WiFi/Cell tower positioning
- **Low Accuracy (>100m)**: IP-based location

### Browser Requirements
- Modern browser with Geolocation API support
- HTTPS connection (required for security)
- Location services enabled on device
- Browser permissions granted

### Supported Browsers
✅ Chrome/Chromium (Desktop & Mobile)
✅ Edge (Desktop & Mobile)
✅ Firefox (Desktop & Mobile)
✅ Safari (Desktop & iOS)
✅ Samsung Internet
✅ Opera

## Privacy & Security

### Data Storage
- ✅ All location data is processed locally on your device
- ✅ No location data is sent to external servers
- ✅ You control when tracking starts and stops
- ✅ Location history is stored in browser memory only

### Permissions
- 🔒 Location access requires explicit user permission
- 🔒 You can revoke permissions at any time in browser settings
- 🔒 Tracking stops immediately when you close the page

### Best Practices
1. Only share location with trusted community members
2. Stop tracking when not actively sharing
3. Be aware that location accuracy can reveal precise addresses
4. Use anonymous mode in community if desired

## Troubleshooting

### Location Permission Denied
**Problem**: Browser blocks location access
**Solution**:
1. Click the lock icon in the address bar
2. Change location permission to "Allow"
3. Refresh the page and try again

### Low Accuracy
**Problem**: Accuracy shows >100 meters
**Solution**:
1. Make sure you're outdoors with clear sky view
2. Enable GPS/Location Services on your device
3. Wait a few seconds for GPS to lock
4. Check that "High Accuracy" mode is enabled in device settings

### Position Not Updating
**Problem**: Location marker doesn't move
**Solution**:
1. Check that "Continuous" mode is selected
2. Make sure you're actually moving (try walking outside)
3. Refresh the page to restart tracking
4. Check browser console for errors

### "Geolocation Not Supported"
**Problem**: Browser doesn't support geolocation
**Solution**:
1. Update your browser to the latest version
2. Use a modern browser (Chrome, Firefox, Safari, Edge)
3. Make sure you're using HTTPS (not HTTP)

### Timeout Error
**Problem**: "Location request timed out"
**Solution**:
1. Move to an area with better GPS reception (outdoors)
2. Check your device's location services are enabled
3. Restart location services on your device
4. Try again after a few seconds

## Advanced Features

### Tracking Statistics
- **Points Tracked**: Number of location updates received
- **Average Accuracy**: Mean GPS precision across all points
- **Duration**: Total time tracking has been active
- **Distance Traveled**: Calculated from position changes (coming soon)

### Map Controls
- **Zoom**: Use +/- buttons or mouse wheel to zoom
- **Pan**: Click and drag to move the map
- **Marker Info**: Click the marker to see detailed coordinates
- **Accuracy Circle**: Blue circle shows GPS precision radius

### Technical Information Panel
Expand the "Technical Details" section to see:
- Current GPS configuration
- Update frequency settings
- Cache policy
- API details
- Privacy information

## API Reference

### LocationTracker Component Props

```typescript
interface LocationTrackerProps {
  onLocationUpdate?: (position: GeolocationPosition) => void
  enableTracking?: boolean      // Auto-start tracking
  updateInterval?: number        // Update frequency (ms)
  showMap?: boolean             // Display map
  height?: string               // Map height
  onClose?: () => void          // Close callback
}
```

### Location Data Structure

```typescript
interface LocationData {
  latitude: number              // Decimal degrees
  longitude: number             // Decimal degrees
  accuracy: number              // Meters
  altitude: number | null       // Meters above sea level
  altitudeAccuracy: number | null
  heading: number | null        // Degrees (0-360)
  speed: number | null          // Meters per second
  timestamp: number             // Unix timestamp
}
```

## Performance

### Resource Usage
- **CPU**: Minimal impact, only processes position updates
- **Battery**: GPS usage will drain battery faster
- **Network**: Only loads map tiles, no continuous data transfer
- **Memory**: <5MB for component and map tiles

### Optimization Tips
1. Use "Single Point" mode when you don't need continuous tracking
2. Stop tracking when not actively using the feature
3. Close the location modal when done
4. Clear browser cache if map tiles load slowly

## Future Enhancements

Coming soon:
- 📍 Location history visualization
- 📏 Distance traveled calculation
- 🗺️ Multiple map style options
- 📤 Export location data
- 👥 Share location with specific users
- 📍 Geofencing and location alerts
- 🕐 Time-based location history
- 📊 Location analytics dashboard

## Support

For issues or questions:
- Check this guide first
- Review browser console for error messages
- Ensure all requirements are met
- Contact support with detailed error information

## FAQ

**Q: Does this work offline?**
A: GPS works offline but the map requires an internet connection to load tiles.

**Q: How accurate is the location?**
A: With GPS outdoors: 3-10 meters. WiFi/Cell: 10-100 meters. IP-based: 100+ meters.

**Q: Will this drain my battery?**
A: GPS usage does consume more battery. Stop tracking when not needed.

**Q: Can I use this on mobile?**
A: Yes! The feature is fully responsive and works on all mobile browsers.

**Q: Is my location data shared with servers?**
A: No. All processing happens locally on your device. No data is sent to external servers.

**Q: Can I customize the map appearance?**
A: Currently uses OpenStreetMap style. Custom styles coming in future updates.

**Q: What's the update rate for continuous tracking?**
A: The position updates whenever it changes, typically every 1-2 seconds when moving.

**Q: Does this work in all countries?**
A: Yes! GPS works globally. Map tiles are also worldwide.

---

**Version**: 1.0.0
**Last Updated**: 2024
**Component**: LocationTracker.tsx
**Dependencies**: Leaflet 1.9.4, react-leaflet 4.2.1
