from flask import Blueprint, jsonify
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/api/health', methods=['GET'])
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