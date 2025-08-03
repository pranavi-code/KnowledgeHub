from flask import Blueprint, jsonify, request
import json
import os
from utils.progress_calculator import calculate_progress

onboarding_bp = Blueprint('onboarding', __name__)

def load_onboarding_data():
    """Load onboarding data from JSON file"""
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'onboarding_tasks.json')
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"users": []}

def save_onboarding_data(data):
    """Save onboarding data to JSON file"""
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'onboarding_tasks.json')
    with open(data_path, 'w') as f:
        json.dump(data, f, indent=2)

@onboarding_bp.route('/api/onboarding/progress', methods=['GET'])
def get_progress():
    """Get progress for all users"""
    try:
        data = load_onboarding_data()
        return jsonify(calculate_progress(data))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@onboarding_bp.route('/api/onboarding/user', methods=['GET'])
def get_user_data():
    """Get all user data"""
    try:
        data = load_onboarding_data()
        return jsonify(data['users'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@onboarding_bp.route('/api/onboarding/user/<username>', methods=['GET'])
def get_user_by_username(username):
    """Get specific user data by username"""
    try:
        data = load_onboarding_data()
        user = next((u for u in data['users'] if u['username'] == username), None)
        if user:
            return jsonify(user)
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@onboarding_bp.route('/api/onboarding/task/<username>/<phase>/<task>', methods=['POST'])
def toggle_task_completion(username, phase, task):
    """Toggle task completion status"""
    try:
        data = load_onboarding_data()
        user = next((u for u in data['users'] if u['username'] == username), None)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if phase not in user['phases']:
            return jsonify({'error': 'Phase not found'}), 404
        
        if task not in user['phases'][phase]['tasks']:
            return jsonify({'error': 'Task not found'}), 404
        
        # Toggle task completion
        current_status = user['phases'][phase]['tasks'][task]['completed']
        user['phases'][phase]['tasks'][task]['completed'] = not current_status
        
        # Update phase completion status
        all_tasks_completed = all(task_data['completed'] for task_data in user['phases'][phase]['tasks'].values())
        user['phases'][phase]['completed'] = all_tasks_completed
        
        # Save updated data
        save_onboarding_data(data)
        
        return jsonify({
            'success': True,
            'task_completed': user['phases'][phase]['tasks'][task]['completed'],
            'phase_completed': user['phases'][phase]['completed']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@onboarding_bp.route('/api/onboarding/achievements', methods=['GET'])
def get_achievements():
    """Get achievements for users"""
    try:
        data = load_onboarding_data()
        achievements = []
        
        for user in data['users']:
            completed_phases = [phase_name for phase_name, phase_data in user['phases'].items() if phase_data['completed']]
            user_achievements = []
            
            if len(completed_phases) >= 1:
                user_achievements.append("First Steps - Completed initial setup")
            if len(completed_phases) >= 2:
                user_achievements.append("Explorer - Completed multiple phases")
            if len(completed_phases) >= 3:
                user_achievements.append("Contributor - Ready for active development")
            if len(completed_phases) >= 4:
                user_achievements.append("Team Player - Almost fully onboarded")
            if len(completed_phases) == 5:
                user_achievements.append("Fully Onboarded - Welcome to the team!")
            
            achievements.append({
                "username": user["username"],
                "achievements": user_achievements
            })
        
        return jsonify(achievements)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@onboarding_bp.route('/api/onboarding/phases', methods=['GET'])
def get_phases():
    """Get all available phases"""
    try:
        data = load_onboarding_data()
        if data['users'] and len(data['users']) > 0:
            # Return phases from first user as template
            phases = list(data['users'][0]['phases'].keys())
            return jsonify({'phases': phases})
        return jsonify({'phases': []})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@onboarding_bp.route('/api/onboarding/tasks/<username>/<phase>', methods=['GET'])
def get_phase_tasks(username, phase):
    """Get tasks for a specific phase and user"""
    try:
        data = load_onboarding_data()
        user = next((u for u in data['users'] if u['username'] == username), None)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if phase not in user['phases']:
            return jsonify({'error': 'Phase not found'}), 404
        
        return jsonify(user['phases'][phase])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@onboarding_bp.route('/api/onboarding/resources/<resource_name>', methods=['GET'])
def get_resource(resource_name):
    """Get resource information"""
    try:
        # Define resource URLs (you can customize these)
        resource_urls = {
            "IDE Setup Guide": "https://docs.example.com/ide-setup",
            "Git Configuration": "https://docs.example.com/git-config",
            "Repository Access": "https://docs.example.com/repo-access",
            "SSH Key Setup": "https://docs.example.com/ssh-setup",
            "Slack Invite": "https://docs.example.com/slack-invite",
            "Team Calendar": "https://docs.example.com/team-calendar",
            "Architecture Docs": "https://docs.example.com/architecture",
            "System Diagrams": "https://docs.example.com/diagrams",
            "Data Flow Diagrams": "https://docs.example.com/data-flow",
            "API Documentation": "https://docs.example.com/api",
            "Style Guide": "https://docs.example.com/style-guide",
            "Best Practices": "https://docs.example.com/best-practices",
            "Project Map": "https://docs.example.com/project-map",
            "README Files": "https://docs.example.com/readme",
            "Component Docs": "https://docs.example.com/components",
            "Code Comments": "https://docs.example.com/comments",
            "Test Guide": "https://docs.example.com/testing",
            "Coverage Reports": "https://docs.example.com/coverage",
            "Git Guide": "https://docs.example.com/git-guide",
            "Branch Strategy": "https://docs.example.com/branch-strategy",
            "Review Guidelines": "https://docs.example.com/review-guidelines",
            "PR Templates": "https://docs.example.com/pr-templates",
            "Deployment Guide": "https://docs.example.com/deployment",
            "Environment Docs": "https://docs.example.com/environment",
            "Issue Tracker": "https://docs.example.com/issues",
            "Task Board": "https://docs.example.com/tasks",
            "Development Guide": "https://docs.example.com/development",
            "Code Examples": "https://docs.example.com/examples",
            "PR Guidelines": "https://docs.example.com/pr-guidelines",
            "Review Checklist": "https://docs.example.com/review-checklist"
        }
        
        if resource_name in resource_urls:
            return jsonify({
                'name': resource_name,
                'url': resource_urls[resource_name],
                'description': f'Resource guide for {resource_name}'
            })
        else:
            return jsonify({'error': 'Resource not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500 