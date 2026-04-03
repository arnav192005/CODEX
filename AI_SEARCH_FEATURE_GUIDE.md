# AI-Based File Location Search Feature

## Overview
An intelligent search feature has been added to the materials section that automatically detects and displays the folder location (block) where specific files are located.

## Features Implemented

### 1. **Location Information in Data**
- Each material now includes:
  - `location`: Detailed path (e.g., "3RD SEMESTER / DBMS")
  - `block`: Semester block category (e.g., "3RD SEMESTER")

### 2. **Smart Search Results Display**
When users search for materials, they get:
- A dedicated **"File Location Information"** panel
- Materials grouped by their location blocks
- Each block shows:
  - 📁 Block name (e.g., "3RD SEMESTER")
  - List of matching materials in that block
  - Exact file locations

### 3. **Material Cards Enhancement**
Each material card now displays:
- Original information (title, badges, description)
- 📍 Location badge showing the full path to the file

## How It Works

### Search Process
1. User enters a search query (e.g., "DBMS")
2. System filters materials matching the query
3. AI automatically groups results by location blocks
4. Visual location panel appears showing:
   - Which blocks contain the searched material
   - Exact location within each block
   - All matching files organized by block

### Multiple Results
If searching for multiple materials:
- System shows all matching blocks
- Each block displays all related materials
- User can quickly see where everything is located

### Clearing Filters
- Click "Clear All" to hide the location information panel
- Reset all search filters to show all materials

## Visual Design

### Location Information Panel
- **Position**: Below the search filters
- **Color**: Cyan/blue gradient UI
- **Animation**: Smooth slide-in when search is active

### Location Blocks
- Grid layout (responsive design)
- Hover effects for interactivity
- File icons and folder indicators
- Color-coded items

### File Badges
- 📍 Location indicator on each material card
- Shows full path to the file
- Cyan colored text for visibility

## Search Examples

### Example 1: Search "DBMS"
```
Results: 1 material found

📍 File Location Information
┌─────────────────────────────┐
│ 📁 3RD SEMESTER            │
│   • DATABASE MANAGEMENT... │
│     Location: 3RD SEMESTER │
│     / DBMS                 │
└─────────────────────────────┘
```

### Example 2: Search "Mathematics"
```
Results: 2 materials found

📍 File Location Information
┌──────────────────────┐ ┌──────────────────────┐
│ 📁 1ST SEMESTER      │ │ 📁 2ND SEMESTER      │
│  • ENGINEERING       │ │  • ENGINEERING      │
│    MATHEMATICS-I     │ │    MATHEMATICS-II   │
│    Location: 1ST     │ │    Location: 2ND    │
│    SEMESTER / Maths  │ │    SEMESTER / Maths │
└──────────────────────┘ └──────────────────────┘
```

## Technical Implementation

### CSS Classes Added
- `.search-results-info` - Main container for location panel
- `.location-blocks` - Grid layout for blocks
- `.location-block` - Individual block container
- `.block-name` - Block title with folder icon
- `.location-items` - List of materials in block
- `.location-item` - Individual material item
- `.material-location` - Location badge on cards

### JavaScript Functions
- `displayLocationInfo(materials)` - Generates location information
  - Groups materials by block
  - Creates visual representation
  - Handles multiple results

- `renderMaterials(filteredMaterials)` - Enhanced to:
  - Show location info when searching
  - Hide location info when clearing
  - Display location badges on cards

## Data Structure Example

```javascript
{
  title: "DATABASE MANAGEMENT SYSTEMS",
  branch: "CE",
  semester: "3",
  type: "notes",
  subject: "DBMS",
  code: "CT306-N",
  description: "...",
  link: "...",
  location: "3RD SEMESTER / DBMS",        // New
  block: "3RD SEMESTER"                   // New
}
```

## User Benefits

✅ **Quick Location Finding**: Users immediately know where materials are stored
✅ **Organized Display**: Clear block structure shows folder hierarchy
✅ **Multiple Results**: See all locations if searching for common subjects
✅ **Visual Clarity**: Icons and colors make it easy to scan
✅ **Context Awareness**: Shows both general block and specific location

## Supported Blocks

Current blocks implemented:
- 1ST SEMESTER
- 2ND SEMESTER
- 3RD SEMESTER
- 4TH SEMESTER

## Future Enhancements

Possible additions:
- Search by location
- Direct folder navigation
- Filter by semester block
- Search history with locations
- Breadcrumb navigation
- Export location paths

---

**Note**: This feature improves user experience by providing AI-like intelligent search results that show exactly where to find study materials within the folder structure.
