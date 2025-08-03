# Search Functionality Implementation

## Overview

This implementation provides a comprehensive search system that works with existing documents in the `uploads` folder. The search functionality includes advanced filtering, sorting, and download capabilities.

## Features Implemented

### ✅ Search Features
- **Text Search**: Search across titles, descriptions, and tags
- **Advanced Filters**: Content type, author, tags, priority, date range
- **Sorting**: Relevance, date, views, title
- **Download**: Direct file download functionality
- **Real-time Results**: Debounced search with loading states

### ✅ Filter Options
- **Content Type**: Documentation, Pull Requests, Meeting Notes, Changelogs
- **Date Range**: Today, This Week, This Month, This Quarter, This Year
- **Author**: Dynamic list based on existing documents
- **Priority**: High, Medium, Low
- **Tags**: Dynamic list based on existing documents

### ✅ Backend Endpoints

#### 1. Search Endpoint
```
GET /api/search
```
**Parameters:**
- `q` - Search query
- `type` - Content type filter (multiple)
- `author` - Author filter (multiple)
- `tags` - Tags filter (multiple)
- `priority` - Priority filter
- `dateRange` - Date range filter
- `sortBy` - Sort by (relevance, date, views, title)

**Example:**
```
GET /api/search?q=syllabus&type=documentation&author=Current%20User
```

#### 2. Filter Options Endpoint
```
GET /api/search/filters
```
Returns available filter options based on existing documents.

#### 3. Download Endpoint
```
GET /api/download/<filename>
GET /api/download/<subdir>/<filename>
```
Downloads files from the uploads folder.

#### 4. Search Stats Endpoint
```
GET /api/search/stats
```
Returns search statistics and document counts.

## File Structure

```
backend/
├── search_filter.py          # Main search implementation
├── app.py                   # Flask app with search integration
├── uploads/                 # Document storage
│   ├── *.json              # Document metadata
│   ├── *.pdf               # PDF documents
│   ├── *.docx              # Word documents
│   └── rakku/              # Subdirectory with documents
│       ├── meta_data.json  # Subdirectory metadata
│       └── Resume.pdf      # Document files
└── test_search.py          # Test script
```

## Document Metadata Format

Each document has a JSON metadata file with the following structure:

```json
{
  "id": "unique-id",
  "title": "Document Title",
  "type": "documentation",
  "author": "Author Name",
  "date": "2025-08-01",
  "tags": ["tag1", "tag2"],
  "priority": "medium",
  "views": 0,
  "description": "Document description",
  "lastModified": "recent",
  "size": "1.2 MB",
  "status": "uploaded",
  "file_path": "/path/to/file",
  "file_size": 1234567,
  "download_url": "/api/download/filename",
  "filename": "original_filename.pdf"
}
```

## Frontend Integration

The frontend `SearchFilter.jsx` component connects to the backend API and provides:

- **Real-time Search**: Debounced search with loading states
- **Filter UI**: Interactive filter panels with dynamic options
- **Download**: Click-to-download functionality
- **Responsive Design**: Grid and list view modes
- **Modern UI**: Beautiful, modern interface with animations

## Usage Examples

### Basic Search
```javascript
// Search for documents containing "syllabus"
fetch('/api/search?q=syllabus')
```

### Advanced Filtering
```javascript
// Search for documentation by specific author
fetch('/api/search?type=documentation&author=Current%20User')
```

### Combined Filters
```javascript
// Search with multiple filters
fetch('/api/search?q=resume&type=documentation&priority=high&dateRange=this_month')
```

## Testing

Run the test script to verify functionality:

```bash
cd backend
python test_search.py
```

## API Response Format

### Search Results
```json
[
  {
    "id": "unique-id",
    "title": "Document Title",
    "type": "documentation",
    "author": "Author Name",
    "date": "2025-08-01",
    "tags": ["tag1", "tag2"],
    "priority": "medium",
    "views": 0,
    "description": "Document description",
    "lastModified": "recent",
    "size": "1.2 MB",
    "status": "uploaded",
    "download_url": "/api/download/filename"
  }
]
```

### Filter Options
```json
{
  "contentTypes": ["documentation", "meetings", "notes"],
  "authors": ["Current User", "rakshitha"],
  "tags": ["Frontend", "Backend"],
  "priorities": ["high", "medium", "low"]
}
```

## Implementation Details

### Backend (`search_filter.py`)
- **Document Loading**: Scans uploads folder for JSON metadata and actual files
- **Filter Logic**: Implements all filter types with proper date handling
- **Search Algorithm**: Case-insensitive text search across multiple fields
- **Download Handling**: Secure file serving with proper MIME types

### Frontend (`SearchFilter.jsx`)
- **API Integration**: Real-time connection to backend endpoints
- **State Management**: React hooks for search state and filters
- **User Experience**: Loading states, error handling, debounced search
- **Download Functionality**: Browser-based file download

## Security Considerations

- File downloads are restricted to the uploads directory
- Proper file path validation prevents directory traversal
- CORS is configured for frontend-backend communication
- File size limits are enforced

## Performance Optimizations

- Debounced search to reduce API calls
- Efficient document loading with error handling
- Cached filter options
- Optimized search algorithms

## Future Enhancements

- Full-text search with Elasticsearch
- Document preview functionality
- Advanced analytics and usage tracking
- User authentication and permissions
- Document versioning
- Collaborative features

## Troubleshooting

### Common Issues

1. **No search results**: Check if documents exist in uploads folder
2. **Download fails**: Verify file paths and permissions
3. **CORS errors**: Ensure backend CORS is properly configured
4. **Filter not working**: Check filter parameter names match backend

### Debug Commands

```bash
# Test search endpoint
curl http://localhost:5000/api/search

# Test filters endpoint
curl http://localhost:5000/api/search/filters

# Test download endpoint
curl http://localhost:5000/api/download/filename.pdf
```

## Dependencies

### Backend
- Flask
- Flask-CORS
- Python standard library (os, json, datetime)

### Frontend
- React
- Lucide React (icons)
- Tailwind CSS

## Setup Instructions

1. **Backend**: Run `python app.py` in the backend directory
2. **Frontend**: Run `npm start` in the toolkit directory
3. **Test**: Use the test script or frontend interface

The search functionality is now fully implemented and ready for use! 🎉 