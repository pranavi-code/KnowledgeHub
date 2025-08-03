# Knowledge Transfer Platform - Backend

A Flask-based backend for the Knowledge Transfer Platform with organized, modular structure.

## 🏗️ Project Structure

```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── routes/               # API route blueprints
│   ├── __init__.py
│   ├── dashboard.py      # Dashboard endpoints
│   ├── upload.py         # Upload endpoints
│   ├── search.py         # Search endpoints
│   └── health.py         # Health check endpoints
├── utils/                # Utility functions
│   ├── __init__.py
│   └── upload_utils.py   # Upload helper functions
├── uploads/              # Uploaded files storage
├── data/                 # Data storage
├── logs/                 # Application logs
└── [legacy files]        # Existing blueprints for compatibility
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python app.py
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Dashboard Routes (`/api/dashboard/`)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get recent activity
- `GET /api/dashboard/all-uploads` - Get all uploads

### Upload Routes (`/api/upload/`)
- `POST /api/upload` - Upload files with metadata
- `GET /api/recent-uploads` - Get recent uploads
- `GET /uploads/<filename>` - Serve uploaded files

### Search Routes (`/api/search/`)
- `GET /api/search` - Advanced search with filters

### Health Routes (`/api/health/`)
- `GET /api/health` - Health check endpoint

## 🔧 Key Features

### ✅ Real Data Only
- Dashboard shows actual upload counts (no dummy data)
- Dynamic updates when new files are uploaded
- Real-time activity feed

### ✅ Organized Structure
- **Routes**: Separated by functionality (dashboard, upload, search, health)
- **Utils**: Reusable helper functions
- **Clean main app**: Only imports and registers blueprints

### ✅ Modular Design
- Each route file is a separate blueprint
- Easy to add new endpoints
- Clear separation of concerns

## 📊 Data Flow

1. **Upload**: Files saved to `uploads/` folder with metadata JSON
2. **Dashboard**: Reads from `uploads/` folder to display stats
3. **Search**: Filters artifacts from uploads folder
4. **Activity**: Shows recent uploads with timestamps

## 🧪 Testing

### Test API Endpoints:
```bash
# Dashboard stats
curl http://localhost:5000/api/dashboard/stats

# Recent activity
curl http://localhost:5000/api/dashboard/activity

# Health check
curl http://localhost:5000/api/health
```

### Test Upload:
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@test.pdf" \
  -F "title=Test Document" \
  -F "category=documentation" \
  -F "description=Test upload" \
  -F "tags=test,demo"
```

## 🔄 Adding New Features

### 1. New Route Blueprint
Create `routes/new_feature.py`:
```python
from flask import Blueprint, jsonify

new_feature_bp = Blueprint('new_feature', __name__)

@new_feature_bp.route('/api/new-feature', methods=['GET'])
def new_feature():
    return jsonify({'message': 'New feature!'})
```

### 2. Register in app.py
```python
from routes.new_feature import new_feature_bp
app.register_blueprint(new_feature_bp)
```

## 📝 Notes

- **Real Data**: Dashboard now shows only actual upload counts
- **No Dummy Data**: Removed all hardcoded base numbers
- **Clean Structure**: Routes organized by functionality
- **Backward Compatible**: Existing blueprints still work