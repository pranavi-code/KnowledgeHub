from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random
import json
import uuid
from collections import defaultdict
from data_persistence import weekly_persistence

weekly_bp = Blueprint('weekly', __name__)

# In-memory storage for weekly data (in production, use a database)
weekly_data_store = {}

def generate_weekly_data(week_start_date):
    """Generate comprehensive weekly dashboard data"""
    week_end_date = week_start_date + timedelta(days=6)
    
    # Generate realistic stats
    stats = {
        'newUploads': random.randint(20, 40),
        'updates': random.randint(30, 60),
        'decisions': random.randint(8, 20),
        'completedTasks': random.randint(50, 80),
        'contributors': random.randint(15, 30),
        'pendingReviews': random.randint(10, 25)
    }
    
    # Generate weekly activity chart data
    weekly_activity = []
    for i in range(7):
        day_date = week_start_date + timedelta(days=i)
        weekly_activity.append({
            'day': day_date.strftime('%a'),
            'date': day_date.strftime('%Y-%m-%d'),
            'uploads': random.randint(1, 10),
            'updates': random.randint(2, 15),
            'decisions': random.randint(0, 5),
            'completed': random.randint(5, 20)
        })
    
    # Generate category breakdown
    categories = ['Documentation', 'Code Changes', 'Architecture', 'Security', 'Testing', 'DevOps']
    category_breakdown = []
    total_percentage = 0
    for i, category in enumerate(categories[:-1]):  # Leave last one for remainder
        percentage = random.randint(10, 30)
        if total_percentage + percentage <= 90:
            category_breakdown.append({
                'name': category,
                'value': percentage,
                'color': f'#{random.randint(0, 0xFFFFFF):06x}'
            })
            total_percentage += percentage
    
    # Add remaining percentage to last category
    remaining = 100 - total_percentage
    category_breakdown.append({
        'name': categories[-1],
        'value': remaining,
        'color': f'#{random.randint(0, 0xFFFFFF):06x}'
    })
    
    # Generate impact distribution
    impact_distribution = [
        {'impact': 'High', 'count': random.randint(10, 20)},
        {'impact': 'Medium', 'count': random.randint(25, 40)},
        {'impact': 'Low', 'count': random.randint(15, 30)}
    ]
    
    # Generate uploads data
    upload_types = ['documentation', 'schema', 'api', 'design', 'research']
    upload_categories = ['Architecture', 'Security', 'Database', 'Frontend', 'Backend', 'DevOps']
    upload_statuses = ['trending', 'new', 'critical', 'updated']
    
    uploads = []
    for i in range(random.randint(3, 8)):
        uploads.append({
            'id': str(uuid.uuid4()),
            'title': f'Sample Upload {i+1}',
            'type': random.choice(upload_types),
            'author': f'Author {i+1}',
            'date': (week_start_date + timedelta(days=random.randint(0, 6))).strftime('%b %d'),
            'category': random.choice(upload_categories),
            'views': random.randint(50, 500),
            'status': random.choice(upload_statuses)
        })
    
    # Generate updates data
    updates = []
    for i in range(random.randint(2, 6)):
        updates.append({
            'id': str(uuid.uuid4()),
            'title': f'Update {i+1}',
            'author': f'Author {i+1}',
            'changes': f'Updated {random.choice(["API", "Documentation", "Schema", "Configuration"])}',
            'date': (week_start_date + timedelta(days=random.randint(0, 6))).strftime('%b %d'),
            'impact': random.choice(['high', 'medium', 'low'])
        })
    
    # Generate decisions data
    decisions = []
    for i in range(random.randint(1, 4)):
        decisions.append({
            'id': str(uuid.uuid4()),
            'title': f'Decision {i+1}',
            'decisionMaker': f'Team {i+1}',
            'date': (week_start_date + timedelta(days=random.randint(0, 6))).strftime('%b %d'),
            'impact': random.choice(['high', 'medium', 'low']),
            'reasoning': f'Reasoning for decision {i+1}'
        })
    
    # Generate completed tasks
    completed = []
    for i in range(random.randint(3, 8)):
        completed.append({
            'id': str(uuid.uuid4()),
            'title': f'Completed Task {i+1}',
            'type': random.choice(['feature', 'bug', 'improvement']),
            'assignee': f'Assignee {i+1}',
            'completedDate': (week_start_date + timedelta(days=random.randint(0, 6))).strftime('%b %d'),
            'pr': f'#{random.randint(1000, 9999)}'
        })
    
    # Generate pending reviews
    pending = []
    for i in range(random.randint(2, 6)):
        pending.append({
            'id': str(uuid.uuid4()),
            'title': f'Pending Review {i+1}',
            'author': f'Author {i+1}',
            'daysWaiting': random.randint(1, 7),
            'reviewers': [f'Reviewer {j+1}' for j in range(random.randint(1, 3))],
            'priority': random.choice(['high', 'medium', 'low'])
        })
    
    # Generate highlights
    highlights = [
        'Major API documentation overhaul completed',
        'New microservices architecture approved',
        'Q1 2025 roadmap finalized',
        'Security audit passed successfully',
        'Performance optimization implemented'
    ]
    
    return {
        'period': f"{week_start_date.strftime('%b %d')} - {week_end_date.strftime('%b %d, %Y')}",
        'generated': datetime.now().strftime('%Y-%m-%d %I:%M %p'),
        'stats': stats,
        'highlights': random.sample(highlights, random.randint(2, 4)),
        'uploads': uploads,
        'updates': updates,
        'decisions': decisions,
        'completed': completed,
        'pending': pending,
        'chartData': {
            'weeklyActivity': weekly_activity,
            'categoryBreakdown': category_breakdown,
            'impactDistribution': impact_distribution
        }
    }

@weekly_bp.route('/api/weekly/summary', methods=['GET'])
def get_weekly_summary():
    """Get weekly dashboard summary"""
    try:
        # Get week parameter from query string
        week_type = request.args.get('week', 'current')
        
        # Calculate week start date based on type
        today = datetime.now()
        if week_type == 'current':
            # Start of current week (Monday)
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
        elif week_type == 'last':
            # Start of last week
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 7)
        elif week_type == 'twoWeeks':
            # Start of two weeks ago
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 14)
        else:
            week_start = today - timedelta(days=today.weekday())
        
        # Generate or retrieve weekly data
        week_key = week_start.strftime('%Y-%m-%d')
        
        # Try to get from database first
        stored_data = weekly_persistence.get_weekly_data(week_key, week_type)
        
        if stored_data:
            data = stored_data
        else:
            # Generate new data and store it
            data = generate_weekly_data(week_start)
            weekly_persistence.save_weekly_data(week_key, week_type, data)
            weekly_data_store[week_key] = data
        
        return jsonify({
            'success': True,
            'data': data,
            'week_type': week_type,
            'week_start': week_start.strftime('%Y-%m-%d')
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_bp.route('/api/weekly/stats', methods=['GET'])
def get_weekly_stats():
    """Get weekly statistics only"""
    try:
        week_type = request.args.get('week', 'current')
        today = datetime.now()
        
        if week_type == 'current':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
        elif week_type == 'last':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 7)
        elif week_type == 'twoWeeks':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 14)
        else:
            week_start = today - timedelta(days=today.weekday())
        
        week_key = week_start.strftime('%Y-%m-%d')
        if week_key not in weekly_data_store:
            weekly_data_store[week_key] = generate_weekly_data(week_start)
        
        return jsonify({
            'success': True,
            'stats': weekly_data_store[week_key]['stats']
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_bp.route('/api/weekly/activity', methods=['GET'])
def get_weekly_activity():
    """Get weekly activity chart data"""
    try:
        week_type = request.args.get('week', 'current')
        today = datetime.now()
        
        if week_type == 'current':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
        elif week_type == 'last':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 7)
        elif week_type == 'twoWeeks':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 14)
        else:
            week_start = today - timedelta(days=today.weekday())
        
        week_key = week_start.strftime('%Y-%m-%d')
        if week_key not in weekly_data_store:
            weekly_data_store[week_key] = generate_weekly_data(week_start)
        
        return jsonify({
            'success': True,
            'activity': weekly_data_store[week_key]['chartData']['weeklyActivity']
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_bp.route('/api/weekly/pending', methods=['GET'])
def get_pending_reviews():
    """Get pending reviews"""
    try:
        week_type = request.args.get('week', 'current')
        today = datetime.now()
        
        if week_type == 'current':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
        elif week_type == 'last':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 7)
        elif week_type == 'twoWeeks':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 14)
        else:
            week_start = today - timedelta(days=today.weekday())
        
        week_key = week_start.strftime('%Y-%m-%d')
        if week_key not in weekly_data_store:
            weekly_data_store[week_key] = generate_weekly_data(week_start)
        
        return jsonify({
            'success': True,
            'pending': weekly_data_store[week_key]['pending']
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_bp.route('/api/weekly/refresh', methods=['POST'])
def refresh_weekly_data():
    """Force refresh weekly data (regenerate)"""
    try:
        week_type = request.json.get('week', 'current')
        today = datetime.now()
        
        if week_type == 'current':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
        elif week_type == 'last':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 7)
        elif week_type == 'twoWeeks':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 14)
        else:
            week_start = today - timedelta(days=today.weekday())
        
        week_key = week_start.strftime('%Y-%m-%d')
        weekly_data_store[week_key] = generate_weekly_data(week_start)
        
        return jsonify({
            'success': True,
            'message': 'Weekly data refreshed successfully',
            'data': weekly_data_store[week_key]
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_bp.route('/api/weekly/export', methods=['GET'])
def export_weekly_report():
    """Export weekly report as JSON"""
    try:
        week_type = request.args.get('week', 'current')
        today = datetime.now()
        
        if week_type == 'current':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
        elif week_type == 'last':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 7)
        elif week_type == 'twoWeeks':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 14)
        else:
            week_start = today - timedelta(days=today.weekday())
        
        week_key = week_start.strftime('%Y-%m-%d')
        if week_key not in weekly_data_store:
            weekly_data_store[week_key] = generate_weekly_data(week_start)
        
        return jsonify({
            'success': True,
            'export_data': weekly_data_store[week_key],
            'export_date': datetime.now().isoformat(),
            'week_period': weekly_data_store[week_key]['period']
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 