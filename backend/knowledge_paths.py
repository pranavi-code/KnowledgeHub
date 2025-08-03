from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import json
import uuid
import random

knowledge_paths_bp = Blueprint('knowledge_paths', __name__)

# In-memory storage for knowledge paths (in production, use a database)
knowledge_paths = {}
user_progress = {}

def generate_sample_paths():
    """Generate sample knowledge paths for demonstration"""
    paths = {
        "new-developer": {
            "id": "new-developer",
            "title": "New Developer Onboarding",
            "description": "Complete guide for new developers joining the team",
            "estimated_time": "2-3 hours",
            "difficulty": "beginner",
            "category": "onboarding",
            "created_at": datetime.now().isoformat(),
            "steps": [
                {
                    "id": "step-1",
                    "title": "Project Overview",
                    "type": "document",
                    "content": "Read the project overview document to understand our architecture",
                    "resource_url": "/docs/project-overview",
                    "estimated_time": "15 minutes",
                    "required": True,
                    "order": 1
                },
                {
                    "id": "step-2",
                    "title": "API Design Introduction",
                    "type": "video",
                    "content": "Watch the API design introduction video",
                    "resource_url": "/videos/api-design-intro",
                    "estimated_time": "30 minutes",
                    "required": True,
                    "order": 2
                },
                {
                    "id": "step-3",
                    "title": "Review GitHub PR #42",
                    "type": "code_review",
                    "content": "Review the authentication service PR to understand our code review process",
                    "resource_url": "https://github.com/company/repo/pull/42",
                    "estimated_time": "45 minutes",
                    "required": True,
                    "order": 3
                },
                {
                    "id": "step-4",
                    "title": "Ask AI Assistant",
                    "type": "ai_interaction",
                    "content": "Ask the AI assistant about our deployment process",
                    "resource_url": "/ai/chat",
                    "estimated_time": "20 minutes",
                    "required": False,
                    "order": 4
                },
                {
                    "id": "step-5",
                    "title": "Complete Quiz",
                    "type": "quiz",
                    "content": "Take a quiz to test your understanding",
                    "resource_url": "/quiz/onboarding",
                    "estimated_time": "15 minutes",
                    "required": True,
                    "order": 5
                }
            ]
        },
        "api-developer": {
            "id": "api-developer",
            "title": "API Developer Path",
            "description": "Specialized path for API developers",
            "estimated_time": "4-5 hours",
            "difficulty": "intermediate",
            "category": "development",
            "created_at": datetime.now().isoformat(),
            "steps": [
                {
                    "id": "step-1",
                    "title": "API Design Principles",
                    "type": "document",
                    "content": "Study our API design principles and best practices",
                    "resource_url": "/docs/api-design-principles",
                    "estimated_time": "45 minutes",
                    "required": True,
                    "order": 1
                },
                {
                    "id": "step-2",
                    "title": "Authentication Flow",
                    "type": "interactive",
                    "content": "Complete the interactive authentication flow tutorial",
                    "resource_url": "/tutorials/auth-flow",
                    "estimated_time": "60 minutes",
                    "required": True,
                    "order": 2
                },
                {
                    "id": "step-3",
                    "title": "Code Review Practice",
                    "type": "code_review",
                    "content": "Review and provide feedback on a sample API endpoint",
                    "resource_url": "/practice/code-review",
                    "estimated_time": "30 minutes",
                    "required": True,
                    "order": 3
                }
            ]
        },
        "security-engineer": {
            "id": "security-engineer",
            "title": "Security Engineer Path",
            "description": "Comprehensive security training path",
            "estimated_time": "6-8 hours",
            "difficulty": "advanced",
            "category": "security",
            "created_at": datetime.now().isoformat(),
            "steps": [
                {
                    "id": "step-1",
                    "title": "Security Fundamentals",
                    "type": "document",
                    "content": "Review security fundamentals and our security policies",
                    "resource_url": "/docs/security-fundamentals",
                    "estimated_time": "90 minutes",
                    "required": True,
                    "order": 1
                },
                {
                    "id": "step-2",
                    "title": "Penetration Testing",
                    "type": "lab",
                    "content": "Complete hands-on penetration testing lab",
                    "resource_url": "/labs/penetration-testing",
                    "estimated_time": "120 minutes",
                    "required": True,
                    "order": 2
                },
                {
                    "id": "step-3",
                    "title": "Security Code Review",
                    "type": "code_review",
                    "content": "Perform security-focused code review",
                    "resource_url": "/security/code-review",
                    "estimated_time": "60 minutes",
                    "required": True,
                    "order": 3
                }
            ]
        }
    }
    
    # Initialize with sample data
    for path_id, path_data in paths.items():
        knowledge_paths[path_id] = path_data

# Initialize sample paths
generate_sample_paths()

@knowledge_paths_bp.route('/knowledge-paths', methods=['GET'])
def get_knowledge_paths():
    """Get all available knowledge paths"""
    try:
        category = request.args.get('category')
        difficulty = request.args.get('difficulty')
        
        filtered_paths = list(knowledge_paths.values())
        
        if category:
            filtered_paths = [p for p in filtered_paths if p['category'] == category]
        
        if difficulty:
            filtered_paths = [p for p in filtered_paths if p['difficulty'] == difficulty]
        
        return jsonify({
            'success': True,
            'data': filtered_paths,
            'total': len(filtered_paths)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@knowledge_paths_bp.route('/knowledge-paths/<path_id>', methods=['GET'])
def get_knowledge_path(path_id):
    """Get a specific knowledge path by ID"""
    try:
        if path_id not in knowledge_paths:
            return jsonify({'success': False, 'error': 'Path not found'}), 404
        
        path_data = knowledge_paths[path_id]
        
        # Get user progress if user_id is provided
        user_id = request.args.get('user_id')
        progress = None
        if user_id:
            progress_key = f"{user_id}_{path_id}"
            progress = user_progress.get(progress_key, {
                'completed_steps': [],
                'current_step': 1,
                'started_at': None,
                'completed_at': None,
                'progress_percentage': 0
            })
        
        return jsonify({
            'success': True,
            'data': {
                'path': path_data,
                'progress': progress
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@knowledge_paths_bp.route('/knowledge-paths/<path_id>/progress', methods=['POST'])
def update_progress(path_id):
    """Update user progress for a knowledge path"""
    try:
        if path_id not in knowledge_paths:
            return jsonify({'success': False, 'error': 'Path not found'}), 404
        
        data = request.get_json()
        user_id = data.get('user_id')
        step_id = data.get('step_id')
        action = data.get('action')  # 'start', 'complete', 'skip'
        
        if not user_id or not step_id:
            return jsonify({'success': False, 'error': 'Missing user_id or step_id'}), 400
        
        progress_key = f"{user_id}_{path_id}"
        
        if progress_key not in user_progress:
            user_progress[progress_key] = {
                'completed_steps': [],
                'current_step': 1,
                'started_at': datetime.now().isoformat(),
                'completed_at': None,
                'progress_percentage': 0
            }
        
        progress = user_progress[progress_key]
        
        if action == 'complete':
            if step_id not in progress['completed_steps']:
                progress['completed_steps'].append(step_id)
        
        elif action == 'skip':
            if step_id not in progress['completed_steps']:
                progress['completed_steps'].append(step_id)
        
        # Calculate progress percentage
        total_steps = len(knowledge_paths[path_id]['steps'])
        completed_steps = len(progress['completed_steps'])
        progress['progress_percentage'] = int((completed_steps / total_steps) * 100)
        
        # Check if path is completed
        if progress['progress_percentage'] == 100 and not progress['completed_at']:
            progress['completed_at'] = datetime.now().isoformat()
        
        return jsonify({
            'success': True,
            'data': progress
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@knowledge_paths_bp.route('/knowledge-paths/<path_id>/progress', methods=['GET'])
def get_progress(path_id):
    """Get user progress for a knowledge path"""
    try:
        if path_id not in knowledge_paths:
            return jsonify({'success': False, 'error': 'Path not found'}), 404
        
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Missing user_id'}), 400
        
        progress_key = f"{user_id}_{path_id}"
        progress = user_progress.get(progress_key, {
            'completed_steps': [],
            'current_step': 1,
            'started_at': None,
            'completed_at': None,
            'progress_percentage': 0
        })
        
        return jsonify({
            'success': True,
            'data': progress
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@knowledge_paths_bp.route('/knowledge-paths', methods=['POST'])
def create_knowledge_path():
    """Create a new knowledge path"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'steps']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        # Generate unique ID
        path_id = str(uuid.uuid4())
        
        # Create path object
        new_path = {
            'id': path_id,
            'title': data['title'],
            'description': data['description'],
            'estimated_time': data.get('estimated_time', '1-2 hours'),
            'difficulty': data.get('difficulty', 'beginner'),
            'category': data.get('category', 'general'),
            'created_at': datetime.now().isoformat(),
            'steps': data['steps']
        }
        
        # Add to storage
        knowledge_paths[path_id] = new_path
        
        return jsonify({
            'success': True,
            'data': new_path
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@knowledge_paths_bp.route('/knowledge-paths/<path_id>', methods=['PUT'])
def update_knowledge_path(path_id):
    """Update an existing knowledge path"""
    try:
        if path_id not in knowledge_paths:
            return jsonify({'success': False, 'error': 'Path not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        for key, value in data.items():
            if key in ['title', 'description', 'estimated_time', 'difficulty', 'category', 'steps']:
                knowledge_paths[path_id][key] = value
        
        return jsonify({
            'success': True,
            'data': knowledge_paths[path_id]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@knowledge_paths_bp.route('/knowledge-paths/<path_id>', methods=['DELETE'])
def delete_knowledge_path(path_id):
    """Delete a knowledge path"""
    try:
        if path_id not in knowledge_paths:
            return jsonify({'success': False, 'error': 'Path not found'}), 404
        
        # Remove from storage
        del knowledge_paths[path_id]
        
        # Remove related progress data
        progress_keys_to_remove = [key for key in user_progress.keys() if key.endswith(f"_{path_id}")]
        for key in progress_keys_to_remove:
            del user_progress[key]
        
        return jsonify({'success': True, 'message': 'Path deleted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@knowledge_paths_bp.route('/user/progress', methods=['GET'])
def get_user_progress():
    """Get all progress for a user"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Missing user_id'}), 400
        
        user_paths = []
        for progress_key, progress in user_progress.items():
            if progress_key.startswith(f"{user_id}_"):
                path_id = progress_key.split('_', 1)[1]
                if path_id in knowledge_paths:
                    user_paths.append({
                        'path': knowledge_paths[path_id],
                        'progress': progress
                    })
        
        return jsonify({
            'success': True,
            'data': user_paths
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500 