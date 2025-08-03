from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime, timedelta

# Import weekly dashboard blueprint
from weekly_dashboard import weekly_bp
from websocket_handler import socketio

app = Flask(__name__)
CORS(app)

# Register weekly dashboard blueprint
app.register_blueprint(weekly_bp, url_prefix='/api')

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
    socketio.init_app(app)

    # Start background tasks after Flask app is initialized
    from websocket_handler import start_background_tasks
    start_background_tasks()

    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
