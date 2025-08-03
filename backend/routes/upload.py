from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import json
import uuid
from datetime import datetime
from utils.upload_utils import save_artifact_metadata, load_all_artifacts, format_time_ago

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/api/upload', methods=['POST'])
def upload_files():
    """File upload for UploadArticrafts component"""
    try:
        file = request.files.get('file')
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        category = request.form.get('category', '')
        tags = request.form.get('tags', '')

        if not file or not title:
            return jsonify({'success': False, 'error': 'File and title are required.'}), 400

        # Get upload folder path
        upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)

        artifact_id = str(uuid.uuid4())
        timestamp = datetime.now().timestamp()
        metadata = {
            'id': artifact_id,
            'title': title,
            'type': category,
            'author': 'Current User',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'timestamp': timestamp,
            'tags': [t.strip() for t in tags.split(',') if t.strip()],
            'description': description,
            'filename': unique_filename,
            'status': 'uploaded'
        }
        
        save_artifact_metadata(metadata)
        return jsonify({'success': True, 'message': 'File uploaded', 'artifact': metadata})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@upload_bp.route('/api/recent-uploads', methods=['GET'])
def get_recent_uploads():
    """Get recent uploads for the activity feed"""
    try:
        limit = request.args.get('limit', 5, type=int)
        artifacts = load_all_artifacts()
        
        # Sort by timestamp (newest first) and return limited results
        sorted_artifacts = sorted(artifacts, key=lambda x: x.get('timestamp', 0), reverse=True)
        recent_uploads = sorted_artifacts[:limit]
        
        # Format for frontend display
        formatted_uploads = []
        for upload in recent_uploads:
            formatted_uploads.append({
                'title': upload.get('title', 'Untitled'),
                'type': upload.get('type', 'documentation'),
                'timestamp': upload.get('timestamp', 0),
                'date': upload.get('date', ''),
                'description': upload.get('description', '')
            })
        
        return jsonify(formatted_uploads)
    except Exception as e:
        print(f"Error in recent uploads: {e}")
        return jsonify([])

@upload_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    return send_from_directory(upload_folder, filename)