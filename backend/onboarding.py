from flask import Blueprint, jsonify
import json
from utils.progress_calculator import calculate_progress

onboarding_bp = Blueprint('onboarding', __name__)

@onboarding_bp.route('/onboarding/progress', methods=['GET'])
def get_progress():
    with open('data/onboarding_tasks.json') as f:
        data = json.load(f)
    return jsonify(calculate_progress(data))

@onboarding_bp.route('/onboarding/phases', methods=['GET'])
def get_phases():
    with open('data/onboarding_tasks.json') as f:
        data = json.load(f)
    return jsonify(data['users'])

@onboarding_bp.route('/onboarding/user', methods=['GET'])
def get_user_data():
    with open('data/onboarding_tasks.json') as f:
        data = json.load(f)
    return jsonify(data['users'])

@onboarding_bp.route('/onboarding/achievements', methods=['GET'])
def get_achievements():
    # Mock achievements data
    achievements = [
        {
            "username": "rakshitha",
            "achievements": [
                "First Phase Complete",
                "Architecture Master",
                "Quick Learner"
            ]
        },
        {
            "username": "roopika", 
            "achievements": [
                "Foundation Expert",
                "Team Player",
                "Fast Tracker"
            ]
        }
    ]
    return jsonify(achievements)

@onboarding_bp.route('/onboarding/task/<username>/<phase_name>/<task_name>', methods=['POST'])
def toggle_task(username, phase_name, task_name):
    """Toggle task completion status"""
    try:
        with open('data/onboarding_tasks.json', 'r') as f:
            data = json.load(f)
        
        # Find the user
        user = None
        for u in data['users']:
            if u['username'] == username:
                user = u
                break
        
        if not user or phase_name not in user['phases']:
            return jsonify({'error': 'User or phase not found'}), 404
        
        phase = user['phases'][phase_name]
        if task_name not in phase['tasks']:
            return jsonify({'error': 'Task not found'}), 404
        
        # Toggle task completion
        task = phase['tasks'][task_name]
        task['completed'] = not task['completed']
        
        # Check if all tasks in phase are completed
        all_tasks_completed = all(task['completed'] for task in phase['tasks'].values())
        phase['completed'] = all_tasks_completed
        
        # Save updated data
        with open('data/onboarding_tasks.json', 'w') as f:
            json.dump(data, f, indent=2)
        
        return jsonify({
            'task_completed': task['completed'],
            'phase_completed': phase['completed']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@onboarding_bp.route('/onboarding/resources/<resource_name>', methods=['GET'])
def get_resource(resource_name):
    """Get resource URL for a given resource name"""
    # Mock resource URLs
    resource_urls = {
        "IDE Setup Guide": "https://docs.example.com/ide-setup",
        "Git Configuration": "https://docs.example.com/git-config",
        "Repository Access": "https://docs.example.com/repo-access",
        "SSH Key Setup": "https://docs.example.com/ssh-setup",
        "Slack Invite": "https://docs.example.com/slack",
        "Team Calendar": "https://docs.example.com/calendar",
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
        "Branch Strategy": "https://docs.example.com/branching",
        "Review Guidelines": "https://docs.example.com/reviews",
        "PR Templates": "https://docs.example.com/pr-templates",
        "Deployment Guide": "https://docs.example.com/deployment",
        "Environment Docs": "https://docs.example.com/environments",
        "Issue Tracker": "https://docs.example.com/issues",
        "Task Board": "https://docs.example.com/tasks",
        "Development Guide": "https://docs.example.com/development",
        "Code Examples": "https://docs.example.com/examples",
        "PR Guidelines": "https://docs.example.com/pr-guidelines",
        "Review Checklist": "https://docs.example.com/checklist"
    }
    
    url = resource_urls.get(resource_name, f"https://docs.example.com/{resource_name.lower().replace(' ', '-')}")
    return jsonify({'url': url})