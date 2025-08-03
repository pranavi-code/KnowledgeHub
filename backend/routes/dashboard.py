from flask import Blueprint, request, jsonify
from datetime import datetime
import random
from utils.upload_utils import load_all_artifacts, format_time_ago

dashboard_bp = Blueprint('dashboard', __name__)

def get_dashboard_stats():
    """Get dynamic dashboard statistics"""
    artifacts = load_all_artifacts()
    
    # Calculate stats based on actual data only
    total_docs = len([a for a in artifacts if a.get('type') == 'documentation'])
    total_prs = len([a for a in artifacts if a.get('type') == 'github'])
    total_meetings = len([a for a in artifacts if a.get('type') == 'meetings'])
    total_changelogs = len([a for a in artifacts if a.get('type') == 'changelogs'])
    total_architecture = len([a for a in artifacts if a.get('type') == 'architecture'])
    total_code = len([a for a in artifacts if a.get('type') == 'code'])
    
    # Use only real data - no dummy base numbers
    total_documents = total_docs  # Just actual documentation uploads
    active_prs = total_prs  # Just actual GitHub activity uploads
    team_members = 45  # Fixed for now
    knowledge_score = 94  # Fixed for now
    
    # Calculate changes (dummy data for now)
    doc_change = random.randint(8, 15)
    pr_change = random.randint(1, 5)
    member_change = random.randint(3, 7)
    score_change = random.randint(1, 3)
    
    return {
        'stats': [
            {
                'label': 'Total Documents', 
                'value': f"{total_documents:,}", 
                'change': f"+{doc_change}%", 
                'icon': 'FileText', 
                'color': 'blue'
            },
            {
                'label': 'Active PRs', 
                'value': str(active_prs), 
                'change': f"+{pr_change}", 
                'icon': 'GitPullRequest', 
                'color': 'green'
            },
            {
                'label': 'Team Members', 
                'value': str(team_members), 
                'change': f"+{member_change}", 
                'icon': 'Users', 
                'color': 'purple'
            },
            {
                'label': 'Knowledge Score', 
                'value': f"{knowledge_score}%", 
                'change': f"+{score_change}%", 
                'icon': 'TrendingUp', 
                'color': 'orange'
            }
        ],
        'categories': [
            {
                'name': 'Documentation', 
                'count': total_docs,  # Just actual documentation uploads
                'icon': 'BookOpen', 
                'color': 'bg-blue-500',
                'type': 'documentation'
            },
            {
                'name': 'Pull Requests', 
                'count': total_prs,  # Just actual GitHub activity uploads
                'icon': 'GitPullRequest', 
                'color': 'bg-green-500',
                'type': 'github'
            },
            {
                'name': 'Meeting Notes', 
                'count': total_meetings,  # Just actual meeting notes uploads
                'icon': 'MessageSquare', 
                'color': 'bg-purple-500',
                'type': 'meetings'
            },
            {
                'name': 'Changelogs', 
                'count': total_changelogs,  # Just actual changelog uploads
                'icon': 'Activity', 
                'color': 'bg-orange-500',
                'type': 'changelogs'
            }
        ]
    }

@dashboard_bp.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    stats_data = get_dashboard_stats()
    return jsonify(stats_data)

@dashboard_bp.route('/api/dashboard/activity', methods=['GET'])
def get_dashboard_activity():
    """Recent activity for dashboard (from uploads metadata)"""
    try:
        artifacts = load_all_artifacts()
        # Sort by timestamp (newest first)
        sorted_artifacts = sorted(artifacts, key=lambda x: x.get('timestamp', 0), reverse=True)
        
        # Format for dashboard display
        formatted_activity = []
        for artifact in sorted_artifacts[:10]:  # Show last 10
            formatted_activity.append({
                'id': artifact.get('id', ''),
                'title': artifact.get('title', 'Untitled'),
                'type': artifact.get('type', 'documentation'),
                'author': artifact.get('author', 'Unknown'),
                'time': format_time_ago(artifact.get('timestamp', 0)),
                'status': artifact.get('status', 'uploaded'),
                'description': artifact.get('description', '')
            })
        
        return jsonify(formatted_activity)
    except Exception as e:
        print(f"Error in dashboard activity: {e}")
        return jsonify([])

@dashboard_bp.route('/api/dashboard/all-uploads', methods=['GET'])
def get_all_uploads():
    """Get all uploads for the 'View All' functionality"""
    try:
        artifacts = load_all_artifacts()
        # Sort by timestamp (newest first)
        sorted_artifacts = sorted(artifacts, key=lambda x: x.get('timestamp', 0), reverse=True)
        
        # Format for display
        formatted_uploads = []
        for artifact in sorted_artifacts:
            formatted_uploads.append({
                'id': artifact.get('id', ''),
                'title': artifact.get('title', 'Untitled'),
                'type': artifact.get('type', 'documentation'),
                'author': artifact.get('author', 'Unknown'),
                'time': format_time_ago(artifact.get('timestamp', 0)),
                'status': artifact.get('status', 'uploaded'),
                'description': artifact.get('description', ''),
                'tags': artifact.get('tags', []),
                'filename': artifact.get('filename', ''),
                'date': artifact.get('date', '')
            })
        
        return jsonify(formatted_uploads)
    except Exception as e:
        print(f"Error in all uploads: {e}")
        return jsonify([]) 