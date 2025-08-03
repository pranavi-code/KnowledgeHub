from flask import Blueprint, request, jsonify
import os
import json
from datetime import datetime

upload_bp = Blueprint('upload', __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def save_artifact_metadata(artifact):
    meta_path = os.path.join(UPLOAD_FOLDER, f"{artifact['id']}.json")
    with open(meta_path, 'w') as f:
        json.dump(artifact, f)

def load_all_artifacts():
    artifacts = []
    for fname in os.listdir(UPLOAD_FOLDER):
        if fname.endswith('.json'):
            with open(os.path.join(UPLOAD_FOLDER, fname)) as f:
                artifacts.append(json.load(f))
    return artifacts

def get_recent_uploads(limit=5):
    """Get the most recent uploads for the activity feed"""
    artifacts = load_all_artifacts()
    # Sort by timestamp (newest first) and return limited results
    sorted_artifacts = sorted(artifacts, key=lambda x: x.get('timestamp', 0), reverse=True)
    return sorted_artifacts[:limit]

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file part'}), 400
    
    # Save the file
    file.save(os.path.join(UPLOAD_FOLDER, file.filename))
    
    # Create artifact metadata
    timestamp = datetime.now().timestamp()
    artifact = {
        'id': int(timestamp * 1000),
        'title': request.form.get('title', file.filename),
        'type': request.form.get('category', 'documentation'),
        'author': request.form.get('author', 'Unknown'),
        'tags': request.form.get('tags', '').split(',') if request.form.get('tags') else [],
        'description': request.form.get('description', ''),
        'filename': file.filename,
        'date': datetime.now().strftime('%Y-%m-%d'),
        'timestamp': timestamp,
        'status': 'uploaded'
    }
    
    save_artifact_metadata(artifact)
    return jsonify({'message': 'File uploaded successfully!', 'artifact': artifact})

@upload_bp.route('/artifacts', methods=['GET'])
def get_artifacts():
    return jsonify(load_all_artifacts())

@upload_bp.route('/recent-uploads', methods=['GET'])
def get_recent_uploads_endpoint():
    """Get recent uploads for the activity feed"""
    limit = request.args.get('limit', 5, type=int)
    recent_uploads = get_recent_uploads(limit)
    
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