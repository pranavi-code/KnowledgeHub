from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))



# Load environment variables
load_dotenv()

# Import blueprints
from artifacts import artifacts_bp
from onboarding import onboarding_bp
from ai_assistant import app as ai_app  # If ai_app is a Flask app, skip; if it's a blueprint, import as blueprint
from search_filter import search_filter_bp
from github_routes import github_bp
from knowledge_paths import knowledge_paths_bp
from data_persistence import weekly_persistence
from routes.ai_assisstant import ai_bp
from routes.upload import upload_bp
from routes.rag_chat import rag_bp

# Import weekly dashboard blueprint
from weekly_dashboard import weekly_bp
from websocket_handler import socketio

# Import agent function
from agents.ai_agent import answer_query

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {"origins": ["http://localhost:3000"]},
    r"/github/*": {"origins": ["http://localhost:3000"]}
})


# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Register blueprints
app.register_blueprint(artifacts_bp, url_prefix='/api')
app.register_blueprint(onboarding_bp, url_prefix='/api')
app.register_blueprint(search_filter_bp)
app.register_blueprint(github_bp)
app.register_blueprint(knowledge_paths_bp, url_prefix='/api')
app.register_blueprint(ai_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(rag_bp)
app.register_blueprint(weekly_bp, url_prefix='/api')
# Global dashboard mock data
dashboard_data = {
    'stats': {
        'total_documents': 1247,
        'active_prs': 23,
        'team_members': 45,
        'knowledge_score': 94
    },
    'recent_activity': [],
    'notifications': []
}

# API Routes
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    return jsonify({
        'total_documents': dashboard_data['stats']['total_documents'],
        'active_prs': dashboard_data['stats']['active_prs'],
        'team_members': dashboard_data['stats']['team_members'],
        'knowledge_score': dashboard_data['stats']['knowledge_score'],
        'changes': {
            'documents': '+12%',
            'prs': '+3',
            'members': '+5',
            'score': '+2%'
        }
    })

@app.route('/api/dashboard/activity', methods=['GET'])
def get_recent_activity():
    mock_activity = [
        {
            'id': 1,
            'type': 'pr',
            'title': 'Refactor authentication service',
            'author': 'Sarah Chen',
            'time': '2 hours ago',
            'status': 'merged'
        },
        {
            'id': 2,
            'type': 'doc',
            'title': 'API Design Guidelines v2.1',
            'author': 'Mike Johnson',
            'time': '4 hours ago',
            'status': 'updated'
        },
        {
            'id': 3,
            'type': 'meeting',
            'title': 'Architecture Review - Q1 2024',
            'author': 'Team Alpha',
            'time': '1 day ago',
            'status': 'uploaded'
        },
        {
            'id': 4,
            'type': 'pr',
            'title': 'Add Redis caching layer',
            'author': 'Alex Kumar',
            'time': '2 days ago',
            'status': 'review'
        }
    ]
    return jsonify(mock_activity)

@app.route('/api/dashboard/categories', methods=['GET'])
def get_categories():
    categories = [
        {
            'name': 'Documentation',
            'count': 456,
            'color': 'bg-blue-500',
            'icon': 'FileText',
            'type': 'documentation'
        },
        {
            'name': 'Pull Requests',
            'count': 234,
            'color': 'bg-green-500',
            'icon': 'GitPullRequest',
            'type': 'github'
        },
        {
            'name': 'Meeting Notes',
            'count': 123,
            'color': 'bg-purple-500',
            'icon': 'MessageSquare',
            'type': 'meetings'
        },
        {
            'name': 'Changelogs',
            'count': 89,
            'color': 'bg-orange-500',
            'icon': 'Activity',
            'type': 'changelogs'
        }
    ]
    return jsonify(categories)

@app.route('/api/upload', methods=['POST'])
def upload_files():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)

        metadata = {
            'id': str(uuid.uuid4()),
            'filename': filename,
            'unique_filename': unique_filename,
            'upload_date': datetime.now().isoformat(),
            'file_size': os.path.getsize(file_path),
            'file_type': file.content_type,
            'author': 'Current User',
            'description': request.form.get('description', ''),
            'tags': request.form.get('tags', '').split(',') if request.form.get('tags') else []
        }

        metadata_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{unique_filename}.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        return jsonify({
            'message': 'File uploaded successfully',
            'file_id': metadata['id'],
            'filename': filename
        })
    
    return jsonify({'error': 'Upload failed'}), 500

@app.route('/api/agent-query', methods=['POST'])
def agent_query():
    data = request.json
    query = data.get('query', '')
    if not query:
        return jsonify({"error": "Query is required"}), 400

    try:
        response = answer_query(query)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Basic health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Weekly Dashboard API'
    })


# Root endpoint
@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Weekly Dashboard API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'weekly_summary': '/api/weekly/summary',
            'weekly_stats': '/api/weekly/stats',
            'weekly_activity': '/api/weekly/activity',
            'weekly_pending': '/api/weekly/pending',
            'weekly_refresh': '/api/weekly/refresh',
            'weekly_export': '/api/weekly/export'
        }
    })

@app.route('/api/weekly', methods=['GET'])
def get_weekly_pulse():
    # Dummy data for Weekly Pulse
    data = {
        "period": "August 4 - August 9, 2025",
        "generated": "2025-08-09 11:30 AM",
        "highlights": [
            "Launched new onboarding flow for team members.",
            "API documentation updated for v2 endpoints.",
            "5 critical bugs fixed in user authentication.",
            "Frontend component library upgraded.",
            "Database migration completed successfully.",
            "Knowledge Pulse dashboard now supports real-time updates."
        ],
        "chartData": {
            "weeklyActivity": [
                {"day": "Mon", "uploads": 15, "updates": 5, "decisions": 3, "completed": 2},
                {"day": "Tue", "uploads": 10, "updates": 2, "decisions": 2, "completed": 1},
                {"day": "Wed", "uploads": 8, "updates": 3, "decisions": 1, "completed": 2},
                {"day": "Thu", "uploads": 12, "updates": 4, "decisions": 2, "completed": 3},
                {"day": "Fri", "uploads": 7, "updates": 1, "decisions": 2, "completed": 1}
            ],
            "categoryBreakdown": [
                {"name": "Documentation", "value": 50, "color": "#6366F1"},
                {"name": "PRs", "value": 30, "color": "#10B981"},
                {"name": "Meetings", "value": 10, "color": "#F59E0B"},
                {"name": "Changelogs", "value": 10, "color": "#8B5CF6"}
            ]
        },
        "pending": [
            {
                "title": "Review API Auth PR",
                "author": "Sarah Chen",
                "daysWaiting": 3,
                "reviewers": ["Mike", "Emma"],
                "priority": "high"
            },
            {
                "title": "Finalize Q2 Meeting Notes",
                "author": "Alex Kumar",
                "daysWaiting": 2,
                "reviewers": ["Sarah", "Emma"],
                "priority": "medium"
            },
            {
                "title": "Prepare Release Notes for v3.1",
                "author": "Emma Wilson",
                "daysWaiting": 1,
                "reviewers": ["Alex", "Mike"],
                "priority": "high"
            }
        ]
    }
    return jsonify({"success": True, "data": data})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

    # Start background tasks after Flask app is initialized
    from websocket_handler import start_background_tasks
    start_background_tasks()

    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
