from flask import Blueprint, jsonify, request
from data_persistence import db
from datetime import datetime, timedelta
import json

weekly_dashboard_bp = Blueprint('weekly_dashboard', __name__)

@weekly_dashboard_bp.route('/api/weekly-dashboard', methods=['GET'])
def get_weekly_dashboard():
    """Get weekly dashboard data for the current user"""
    try:
        user_id = 1  # Default user
        
        # Get current week's data
        today = datetime.now()
        week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        weekly_data = db.get_weekly_dashboard_data(user_id, week_start)
        
        # Get user info
        user = db.get_user('pranavi')  # Default user
        projects = db.get_user_projects(user_id)
        tasks = db.get_user_tasks(user_id, due_soon=True)
        
        # Calculate additional metrics
        total_projects = len(projects)
        active_projects = len([p for p in projects if p['status'] == 'active'])
        tasks_due_this_week = len(tasks)
        
        # Mock additional weekly metrics
        weekly_metrics = {
            'code_commits': 12,
            'pull_requests': 3,
            'code_reviews': 5,
            'meetings_attended': 4,
            'learning_hours': 8.5,
            'documentation_written': 2
        }
        
        return jsonify({
            'success': True,
            'weekly_data': {
                **weekly_data,
                **weekly_metrics
            },
            'user_info': user,
            'projects_summary': {
                'total_projects': total_projects,
                'active_projects': active_projects
            },
            'tasks_summary': {
                'tasks_due_this_week': tasks_due_this_week,
                'recent_tasks': tasks[:5]  # Last 5 tasks
            },
            'week_start': week_start
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_dashboard_bp.route('/api/weekly-dashboard/update', methods=['POST'])
def update_weekly_dashboard():
    """Update weekly dashboard data"""
    try:
        data = request.get_json()
        user_id = 1  # Default user
        
        today = datetime.now()
        week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        # Update the weekly data
        db.update_weekly_dashboard(user_id, week_start, data)
        
        return jsonify({
            'success': True,
            'message': 'Weekly dashboard updated successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_dashboard_bp.route('/api/weekly-dashboard/history', methods=['GET'])
def get_weekly_history():
    """Get weekly dashboard history for the last 4 weeks"""
    try:
        user_id = 1  # Default user
        
        # Generate data for the last 4 weeks
        history = []
        today = datetime.now()
        
        for i in range(4):
            week_start = (today - timedelta(days=today.weekday() + (i * 7))).strftime('%Y-%m-%d')
            week_data = db.get_weekly_dashboard_data(user_id, week_start)
            
            # Add mock data for historical weeks
            if week_data['tasks_completed'] == 0:
                week_data = {
                    'tasks_completed': max(0, 15 - (i * 3)),
                    'knowledge_items_learned': max(0, 8 - (i * 2)),
                    'time_spent_hours': max(0, 25 - (i * 5)),
                    'goals_achieved': max(0, 5 - i)
                }
            
            history.append({
                'week_start': week_start,
                'data': week_data
            })
        
        return jsonify({
            'success': True,
            'history': history
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_dashboard_bp.route('/api/weekly-dashboard/goals', methods=['GET'])
def get_weekly_goals():
    """Get weekly goals and progress"""
    try:
        user_id = 1  # Default user
        
        # Mock weekly goals
        goals = [
            {
                'id': 1,
                'title': 'Complete API documentation review',
                'category': 'Development',
                'target': 1,
                'completed': 1,
                'status': 'completed'
            },
            {
                'id': 2,
                'title': 'Implement GitHub sync feature',
                'category': 'Development',
                'target': 1,
                'completed': 0.7,
                'status': 'in_progress'
            },
            {
                'id': 3,
                'title': 'Learn React Hooks',
                'category': 'Learning',
                'target': 5,
                'completed': 3,
                'status': 'in_progress'
            },
            {
                'id': 4,
                'title': 'Code review sessions',
                'category': 'Collaboration',
                'target': 3,
                'completed': 2,
                'status': 'in_progress'
            }
        ]
        
        total_goals = len(goals)
        completed_goals = len([g for g in goals if g['status'] == 'completed'])
        in_progress_goals = len([g for g in goals if g['status'] == 'in_progress'])
        
        return jsonify({
            'success': True,
            'goals': goals,
            'summary': {
                'total_goals': total_goals,
                'completed_goals': completed_goals,
                'in_progress_goals': in_progress_goals,
                'completion_rate': (completed_goals / total_goals * 100) if total_goals > 0 else 0
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_dashboard_bp.route('/api/weekly-dashboard/activity', methods=['GET'])
def get_weekly_activity():
    """Get detailed weekly activity breakdown"""
    try:
        # Mock activity data
        activity_data = {
            'development': {
                'hours_spent': 32,
                'tasks_completed': 8,
                'commits_made': 12,
                'pull_requests': 3
            },
            'learning': {
                'hours_spent': 8.5,
                'courses_completed': 2,
                'articles_read': 5,
                'videos_watched': 3
            },
            'collaboration': {
                'meetings_attended': 4,
                'code_reviews': 5,
                'mentoring_sessions': 2,
                'team_syncs': 3
            },
            'documentation': {
                'docs_written': 2,
                'docs_updated': 3,
                'comments_added': 15,
                'readme_updates': 1
            }
        }
        
        return jsonify({
            'success': True,
            'activity': activity_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@weekly_dashboard_bp.route('/api/weekly-dashboard/insights', methods=['GET'])
def get_weekly_insights():
    """Get AI-generated insights about weekly performance"""
    try:
        # Mock insights
        insights = [
            {
                'type': 'achievement',
                'title': 'Great Progress on API Documentation',
                'description': 'You completed 100% of your documentation review goals this week. This will help the team move faster on the next sprint.',
                'icon': '📚'
            },
            {
                'type': 'improvement',
                'title': 'Increase Learning Time',
                'description': 'Your learning hours are 15% below your target. Consider dedicating more time to skill development.',
                'icon': '🎯'
            },
            {
                'type': 'suggestion',
                'title': 'More Code Reviews',
                'description': 'You\'ve been active in code reviews this week. Consider mentoring junior developers to share your expertise.',
                'icon': '👥'
            },
            {
                'type': 'trend',
                'title': 'Consistent GitHub Activity',
                'description': 'Your GitHub activity has been consistent over the past 4 weeks. Keep up the great work!',
                'icon': '📈'
            }
        ]
        
        return jsonify({
            'success': True,
            'insights': insights
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 