# 🗺️ Geo Analytics Map - Visual Reference Guide

## Map Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🗺️ Live Geo Analytics Map (Snapchat-style)                    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ ← Back to Dashboard  |  Show Heatmap ☑  |  Cluster Markers ☑  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │   👥     │  │   🗺️     │  │   📍     │                       │
│  │9,900 Users│ │9 Regions │  │Lagos     │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ╔═════════════════════╗                      │
│                    ║   INTERACTIVE MAP   ║                      │
│               ┌─ ─ ╫ Zoom: +/−          ║ ─ ─┐                 │
│               │    ║ Drag to Pan         ║    │                 │
│  🟢 Ilorin    │ ┌──╫─────────────────────╫──┐ │                 │
│  📍 6.3 users │ │  ║  🟠 Lagos          ║  │ │    🟡 Kano      │
│  ⚡ 65%       │ │  ║  👥 2,500 users    ║  │ │    50% engagement│
│               │ │  ║  ⚡ 95% active     ║  │ │                 │
│               │ │  ║  🟢 Cluster 3     ║  │ │    🔴 Abuja     │
│  🟡 Ibadan    │ │  ║   Markers          ║  │ │    87% active   │
│  📍 7.8 users │ │  ╚═════════════════════╝  │ │                 │
│  ⚡ 71%       │ └─────────────────────────┘ │                 │
│               └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘                 │
│                                                                  │
│    🔴 Red    🟠 Orange   🟡 Yellow   🟢 Green                  │
│    80-100%   60-79%      40-59%      0-39%                      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Regional Breakdown                                              │
│  Lagos      ████████████████████░░ 28% (2,500 users)           │
│  Abuja      ███████████████░░░░░░░ 20% (1,800 users)           │
│  Kano       █████████░░░░░░░░░░░░░ 13% (1,200 users)           │
│  Port H.    ████████░░░░░░░░░░░░░░ 11% (950 users)             │
│  Ibadan     ██████░░░░░░░░░░░░░░░░  9% (780 users)             │
│  Enugu      █████░░░░░░░░░░░░░░░░░  7% (620 users)             │
│  Calabar    ████░░░░░░░░░░░░░░░░░░  5% (480 users)             │
│  Ilorin     ███░░░░░░░░░░░░░░░░░░░  4% (370 users)             │
│  Benin      ██░░░░░░░░░░░░░░░░░░░░  3% (280 users)             │
└─────────────────────────────────────────────────────────────────┘
```

## Marker Design & Colors

### Individual Marker
```
         ┌───────────────────────┐
         │  🎬 Lagos Hub         │
         │  Lagos, Lagos         │
         │                       │
         │  👥 2,500 users       │
         │  ⚡ 95% active        │
         │                       │
         │  ▰▰▰▰▰▰▰▰▰░ (95%)     │
         │                       │
         │  Last: 2 mins ago     │
         └───────────────────────┘
              │
              │
              ○ ◉ (colored dot with glow)
              
Color = Engagement Level
🔴 Red (#ef4444)      - 80%+
🟠 Orange (#f97316)   - 60-79%
🟡 Yellow (#eab308)   - 40-59%
🟢 Green (#22c55e)    - 0-39%
```

### Clustered Markers
```
    ╭─────────────────╮
    │       123       │  ← Cluster count
    │   ●●●●●●●●●●    │
    │   ●●●●●●●●●●    │  Represents
    │   ●●●●●●●●●●    │  grouped
    │       ●●●       │  markers
    ╰─────────────────╯
    
Click → Spiderfication (Expand)
   │
   ├─ ● Marker 1
   ├─ ● Marker 2
   ├─ ● Marker 3
   └─ ● Marker 4
```

## Heatmap Visualization

### Heat Intensity Gradient
```
INTENSITY LEVEL
     100% ┃ RED     (Highest Activity)
     75%  ┃ ORANGE  
     50%  ┃ YELLOW  (Medium Activity)
     25%  ┃ GREEN   
      0%  ┃ BLUE    (Lowest Activity)

Visual Example:
     🔴🟠🟡🟢🔵
   ┌────────────────────┐
   │  User Concentration│
   │  Across Nigeria    │
   └────────────────────┘
```

## Engagement Score Display

### Ring Progress
```
┌─────────────┐
│    ↑ 87%    │
│  ⚡ ACTIVE  │
│             │  Shows engagement
│  █████░░░░  │  level as progress
│             │  indicator
└─────────────┘
```

### Activity Levels Explained
```
ENGAGEMENT LEVEL       INDICATOR    MEANING
0-39%                  🟢 Green     Low activity
40-59%                 🟡 Yellow    Moderate activity
60-79%                 🟠 Orange    High activity
80-100%                🔴 Red       Very active

User Count Scale:
< 100 users            📍 Small
100-500 users          📌 Medium
500-1000 users         📍 Large
1000+ users            📍📍 Very Large
```

## Control Panel Layout

### Toggle Switches
```
Map Options:
┌─────────────────────────────────────┐
│ ☑ Show Heatmap                      │
│ ☑ Cluster Markers                   │
│                                     │
│ Info: Heatmap shows engagement      │
│       density across regions        │
│                                     │
│       Clustering groups nearby      │
│       markers for cleaner view      │
└─────────────────────────────────────┘
```

## Statistics Cards

### Card Types
```
┌──────────────────┐
│  Total Users     │
│  9,900           │ ← Large number display
│  👥 (50% icon)   │
└──────────────────┘

┌──────────────────┐
│  Regions Covered │
│  9               │ ← Count display
│  🗺️ (50% icon)   │
└──────────────────┘

┌──────────────────┐
│  Top Region      │
│  Lagos           │ ← Name display
│  📍 (50% icon)   │
└──────────────────┘
```

## Heatmap Legend

### Heat Intensity Reference
```
Heat Intensity Legend

🔴 Very High (20%+ of users)
   └─ Brightest red zones
   
🟠 High (10-20% of users)
   └─ Orange zones
   
🟡 Medium (5-10% of users)
   └─ Yellow zones
   
🟢 Low (<5% of users)
   └─ Green zones
   
🔵 No users/No data
   └─ Blue zones
```

## Popup Information Structure

### Full Details Popup
```
┌─────────────────────────────────┐
│  Lagos Hub                      │
│  Lagos, Lagos State             │
├─────────────────────────────────┤
│ Location │ Lagos               │
│ Users    │ 2,500               │
│ Activity │ █████████░ 95%      │
│ Status   │ Active now (2 min)  │
└─────────────────────────────────┘
```

## Map Interactions

### Zoom Levels
```
ZOOM LEVEL    VIEW TYPE        WHAT YOU SEE
1-3           Global           Entire world (too far)
4-5           Continental      Africa, Europe
6-7           Country          All of Nigeria ← DEFAULT
8-10          Region           1-2 states
11-15         City             Streets, districts
16+           Street           Precise locations
```

### Pan & Drag
```
Before:              After:
┌─────────┐         ┌─────────┐
│  ◉ ◯    │ DRAG    │  ◯  ◉   │
│         │ RIGHT → │         │
│  ◯  ◯   │         │  ◯  ◯   │
└─────────┘         └─────────┘

(Markers move with map as you drag)
```

## Mobile View

### Portrait Layout
```
┌──────────────────────────┐
│  🗺️ Geo Map              │ ← Header
├──────────────────────────┤
│  [Controls Area]         │ ← Toggles
├──────────────────────────┤
│                          │
│   [MAP DISPLAY]          │ ← Interactive
│   (Touch Controls)       │
│                          │
├──────────────────────────┤
│  Stats Cards (Stacked)   │ ← Vertical
├──────────────────────────┤
│  Regional Breakdown      │ ← Scrollable
│  (Scrollable)            │
└──────────────────────────┘
```

## Color Scheme

### Light Mode
```
Background      #f3f4f6    (Light gray)
Text            #1f2937    (Dark gray)
Borders         #e5e7eb    (Medium gray)
Accent          #3b82f6    (Blue)
Success         #22c55e    (Green)
Warning         #f97316    (Orange)
Error           #ef4444    (Red)
```

### Dark Mode
```
Background      #111827    (Very dark)
Text            #ffffff    (White)
Borders         #374151    (Dark gray)
Accent          #60a5fa    (Light blue)
Success         #22c55e    (Green)
Warning         #f97316    (Orange)
Error           #ef4444    (Red)
```

## User Flow Diagram

```
START
  │
  ├─→ Dashboard
  │     │
  │     ├─→ [Geo Map Link]
  │     │
  │     └─→ 🗺️ GEO MAP PAGE
  │           │
  │           ├─→ View Interactive Map
  │           │    ├─→ Click Markers
  │           │    ├─→ See Popups
  │           │    ├─→ Toggle Heatmap
  │           │    ├─→ Toggle Clustering
  │           │    └─→ Zoom/Pan
  │           │
  │           ├─→ View Statistics
  │           │    ├─→ Total Users
  │           │    ├─→ Regions Covered
  │           │    └─→ Top Region
  │           │
  │           └─→ Regional Breakdown
  │                ├─→ User Counts
  │                ├─→ Percentages
  │                └─→ Progress Bars
  │
  └─→ Back to Dashboard
```

## Keyboard Shortcuts

```
ACTION              SHORTCUT        RESULT
Zoom In             +  or  =        Zoom in 1 level
Zoom Out            -  or  _        Zoom out 1 level
Pan Left            ← Arrow         Move map left
Pan Right           → Arrow         Move map right
Pan Up              ↑ Arrow         Move map up
Pan Down            ↓ Arrow         Move map down
Search              Ctrl+F          Find on page
Back                Alt+← or ESC    Back to dashboard
```

## Real-Time Update Indicators

```
INDICATOR          MEANING
🟢 Green dot       Currently active (< 1 min)
🟡 Yellow dot      Recently active (1-10 min)
🟠 Orange dot      Somewhat active (10-60 min)
🔴 Red dot         Less active (> 60 min)

TIMESTAMP EXAMPLES:
Just now           Just now (< 1 min)
2 mins ago        2-59 minutes ago
1 hour ago        1+ hours ago
Yesterday         > 24 hours ago
```

---

**Visual Guide Version**: 1.0  
**Last Updated**: January 2026  
**Format**: ASCII Reference Guide
