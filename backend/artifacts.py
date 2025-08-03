from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import uuid
from datetime import datetime, timedelta
import random
from flask import Blueprint

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # React frontend URL

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('data', exist_ok=True)

# Import blueprints
from onboarding import onboarding_bp
from ai_assistant import ai_bp

artifacts_bp = Blueprint('artifacts', __name__)

# Example route
@artifacts_bp.route('/artifacts/test', methods=['GET'])
def test():
    return "Artifacts blueprint is working!"

# Register blueprints
app.register_blueprint(onboarding_bp, url_prefix='/api')
app.register_blueprint(ai_bp, url_prefix='/api')

# Dashboard data matching your DashboardCard.jsx expectations
dashboard_stats = {
    'stats': [
        {'label': 'Total Documents', 'value': '1,247', 'change': '+12%', 'icon': 'FileText', 'color': 'blue'},
        {'label': 'Active PRs', 'value': '23', 'change': '+3', 'icon': 'GitPullRequest', 'color': 'green'},
        {'label': 'Team Members', 'value': '45', 'change': '+5', 'icon': 'Users', 'color': 'purple'},
        {'label': 'Knowledge Score', 'value': '94%', 'change': '+2%', 'icon': 'TrendingUp', 'color': 'orange'}
    ],
    'activity': [
        {'id': 1, 'type': 'pr', 'title': 'Refactor authentication service', 'author': 'Sarah Chen', 'time': '2 hours ago', 'status': 'merged'},
        {'id': 2, 'type': 'doc', 'title': 'API Design Guidelines v2.1', 'author': 'Mike Johnson', 'time': '4 hours ago', 'status': 'updated'},
        {'id': 3, 'type': 'meeting', 'title': 'Architecture Review - Q1 2024', 'author': 'Team Alpha', 'time': '1 day ago', 'status': 'uploaded'},
        {'id': 4, 'type': 'pr', 'title': 'Add Redis caching layer', 'author': 'Alex Kumar', 'time': '2 days ago', 'status': 'review'}
    ],
    'categories': [
        {'name': 'Documentation', 'count': 456, 'icon': 'BookOpen', 'color': 'bg-blue-500'},
        {'name': 'Pull Requests', 'count': 234, 'icon': 'GitPullRequest', 'color': 'bg-green-500'},
        {'name': 'Meeting Notes', 'count': 123, 'icon': 'MessageSquare', 'color': 'bg-purple-500'},
        {'name': 'Changelogs', 'count': 89, 'icon': 'Activity', 'color': 'bg-orange-500'}
    ]
}

# Mock search data matching your SearchFilter.jsx expectations
search_data = [
    {
        'id': 1, 'title': "API Authentication & Security Guidelines", 'type': "documentation",
        'author': "Sarah Chen", 'date': "2024-07-28", 'tags': ["security", "api", "authentication"],
        'priority': "high", 'views': 145, 'description': "Comprehensive guide for implementing secure authentication in our microservices architecture...",
        'lastModified': "3 days ago", 'size': "2.3 MB", 'status': "updated"
    },
    {
        'id': 2, 'title': "Fix: Memory leak in user session management", 'type': "pull-request",
        'author': "Mike Johnson", 'date': "2024-07-25", 'tags': ["bug-fix", "performance", "session"],
        'priority': "high", 'views': 89, 'description': "Resolved critical memory leak affecting user sessions during peak traffic periods...",
        'lastModified': "1 week ago", 'size': "1.2 MB", 'status': "merged"
    },
    {
        'id': 3, 'title': "Q2 Architecture Review Meeting", 'type': "meeting-notes",
        'author': "Engineering Team", 'date': "2024-07-20", 'tags': ["architecture", "review", "planning"],
        'priority': "medium", 'views': 67, 'description': "Discussion on microservices migration strategy and infrastructure scaling plans...",
        'lastModified': "2 weeks ago", 'size': "856 KB", 'status': "final"
    },
    {
        'id': 4, 'title': "Database Migration Rollback Procedures", 'type': "documentation",
        'author': "Alex Kumar", 'date': "2024-07-15", 'tags': ["database", "migration", "procedures"],
        'priority': "high", 'views': 234, 'description': "Step-by-step procedures for safely rolling back database migrations in production...",
        'lastModified': "3 weeks ago", 'size': "1.8 MB", 'status': "approved"
    },
    {
        'id': 5, 'title': "Implement Redis caching layer", 'type': "pull-request",
        'author': "Emma Wilson", 'date': "2024-07-10", 'tags': ["caching", "performance", "redis"],
        'priority': "medium", 'views': 92, 'description': "Added Redis caching to improve API response times and reduce database load...",
        'lastModified': "1 month ago", 'size': "3.1 MB", 'status': "review"
    },
    {
        'id': 6, 'title': "Frontend Component Library v3.0", 'type': "changelog",
        'author': "Design System Team", 'date': "2024-07-05", 'tags': ["frontend", "components", "design-system"],
        'priority': "medium", 'views': 156, 'description': "Major update to component library with new design tokens and accessibility improvements...",
        'lastModified': "1 month ago", 'size': "2.7 MB", 'status': "released"
    }
]

# Dashboard endpoints
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Dashboard statistics for your DashboardCard component"""
    artifacts = load_all_artifacts()
    total_docs = len([a for a in artifacts if a['type'] == 'documentation'])
    total_prs = len([a for a in artifacts if a['type'] == 'pull-request'])
    total_meetings = len([a for a in artifacts if a['type'] == 'meeting-notes'])
    total_changelogs = len([a for a in artifacts if a['type'] == 'changelog'])
    # Example: count by author
    rakku_count = len([a for a in artifacts if a.get('author', '').lower() == 'rakku'])
    pran_count = len([a for a in artifacts if a.get('author', '').lower() == 'pran'])

    return jsonify([
        {'label': 'Total Documents', 'value': total_docs, 'icon': 'FileText', 'color': 'blue'},
        {'label': 'Pull Requests', 'value': total_prs, 'icon': 'GitPullRequest', 'color': 'green'},
        {'label': 'Meeting Notes', 'value': total_meetings, 'icon': 'MessageSquare', 'color': 'purple'},
        {'label': 'Changelogs', 'value': total_changelogs, 'icon': 'Activity', 'color': 'orange'},
        {'label': 'Rakku Docs', 'value': rakku_count, 'icon': 'User', 'color': 'pink'},
    ])

@app.route('/api/dashboard/activity', methods=['GET'])
def get_dashboard_activity():
    """Recent activity for dashboard (from uploads metadata)"""
    artifacts = sorted(load_all_artifacts(), key=lambda x: x['date'], reverse=True)
    return jsonify([
        {
            'title': a['title'],
            'type': a['type'],
            'author': a.get('author', 'Unknown'),
            'time': a['date'],
            'status': a.get('status', 'uploaded')
        }
        for a in artifacts[:10]
    ])

@app.route('/api/dashboard/categories', methods=['GET'])
def get_dashboard_categories():
    """Knowledge base categories"""
    return jsonify(dashboard_stats['categories'])

# Search endpoint matching SearchFilter.jsx
@app.route('/api/search', methods=['GET'])
def advanced_search():
    """Advanced search matching your SearchFilter component exactly"""
    query = request.args.get('q', '').lower()
    content_type = request.args.getlist('type')
    authors = request.args.getlist('author')
    tags = request.args.getlist('tags')
    priority = request.args.get('priority', '')
    sort_by = request.args.get('sortBy', 'relevance')

    results = search_data.copy()

    # Apply filters
    if query:
        results = [r for r in results if 
                  query in r['title'].lower() or 
                  query in r['description'].lower() or
                  any(query in tag.lower() for tag in r['tags'])]

    if content_type:
        results = [r for r in results if r['type'] in content_type]

    if authors:
        results = [r for r in results if r['author'] in authors]

    if tags:
        results = [r for r in results if any(tag in r['tags'] for tag in tags)]

    if priority:
        results = [r for r in results if r['priority'] == priority]

    # Sort results
    if sort_by == 'date':
        results.sort(key=lambda x: x['date'], reverse=True)
    elif sort_by == 'views':
        results.sort(key=lambda x: x['views'], reverse=True)
    elif sort_by == 'title':
        results.sort(key=lambda x: x['title'])

    return jsonify(results)

# File upload endpoint
@app.route('/api/upload', methods=['POST'])
def upload_files():
    """File upload for UploadArticrafts component"""
    try:
        files = request.files.getlist('files')
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        category = request.form.get('category', '')
        tags = request.form.getlist('tags')

        uploaded_files = []

        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)

                # Add to search data
                new_item = {
                    'id': len(search_data) + 1,
                    'title': title or filename,
                    'type': category or 'documentation',
                    'author': 'Current User',
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'tags': tags,
                    'priority': 'medium',
                    'views': 0,
                    'description': description,
                    'lastModified': 'just now',
                    'size': f"{os.path.getsize(file_path) / 1024:.1f} KB",
                    'status': 'uploaded'
                }
                search_data.append(new_item)

                uploaded_files.append({
                    'id': str(uuid.uuid4()),
                    'name': filename,
                    'size': os.path.getsize(file_path),
                    'type': file.content_type or 'application/octet-stream',
                    'uploadProgress': 100
                })

        return jsonify({
            'message': 'Files uploaded successfully',
            'uploaded_files': uploaded_files,
            'success': True
        })

    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'dashboard': 'ready',
            'search': 'ready',
            'upload': 'ready',
            'onboarding': 'ready',
            'ai': 'ready'
        }
    })

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def load_all_artifacts():
    artifacts = []
    uploads_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    for fname in os.listdir(uploads_folder):
        if fname.endswith('.json'):
            with open(os.path.join(uploads_folder, fname)) as f:
                artifacts.append(json.load(f))
    return artifacts

if __name__ == '__main__':
    print("🚀 Knowledge Transfer Platform Backend Starting...")
    print("📍 Backend API: http://localhost:5000/api/")
    print("🔗 Frontend: http://localhost:3000")
    print("✅ Dashboard, Search, Upload, Onboarding, AI - All Ready!")
    print("=" * 60)
    app.run(debug=True, port=5000, host='0.0.0.0')
