# from flask import Blueprint, request, jsonify, send_from_directory
# from werkzeug.utils import secure_filename
# import os
# import json
# import uuid
# from datetime import datetime
# from utils.upload_utils import save_artifact_metadata, load_all_artifacts, format_time_ago

# upload_bp = Blueprint('upload', __name__)

# @upload_bp.route('/api/upload', methods=['POST'])
# def upload_files():
#     """File upload for UploadArticrafts component"""
#     try:
#         file = request.files.get('file')
#         title = request.form.get('title', '')
#         description = request.form.get('description', '')
#         category = request.form.get('category', '')
#         tags = request.form.get('tags', '')

#         if not file or not title:
#             return jsonify({'success': False, 'error': 'File and title are required.'}), 400

#         # Get upload folder path
#         upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
#         if not os.path.exists(upload_folder):
#             os.makedirs(upload_folder)

#         filename = secure_filename(file.filename)
#         unique_filename = f"{uuid.uuid4()}_{filename}"
#         file_path = os.path.join(upload_folder, unique_filename)
#         file.save(file_path)

#         artifact_id = str(uuid.uuid4())
#         timestamp = datetime.now().timestamp()
#         metadata = {
#             'id': artifact_id,
#             'title': title,
#             'type': category,
#             'author': 'Current User',
#             'date': datetime.now().strftime('%Y-%m-%d'),
#             'timestamp': timestamp,
#             'tags': [t.strip() for t in tags.split(',') if t.strip()],
#             'description': description,
#             'filename': unique_filename,
#             'status': 'uploaded'
#         }
        
#         save_artifact_metadata(metadata)
#         return jsonify({'success': True, 'message': 'File uploaded', 'artifact': metadata})
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @upload_bp.route('/api/recent-uploads', methods=['GET'])
# def get_recent_uploads():
#     """Get recent uploads for the activity feed"""
#     try:
#         limit = request.args.get('limit', 5, type=int)
#         artifacts = load_all_artifacts()
        
#         # Sort by timestamp (newest first) and return limited results
#         sorted_artifacts = sorted(artifacts, key=lambda x: x.get('timestamp', 0), reverse=True)
#         recent_uploads = sorted_artifacts[:limit]
        
#         # Format for frontend display
#         formatted_uploads = []
#         for upload in recent_uploads:
#             formatted_uploads.append({
#                 'title': upload.get('title', 'Untitled'),
#                 'type': upload.get('type', 'documentation'),
#                 'timestamp': upload.get('timestamp', 0),
#                 'date': upload.get('date', ''),
#                 'description': upload.get('description', '')
#             })
        
#         return jsonify(formatted_uploads)
#     except Exception as e:
#         print(f"Error in recent uploads: {e}")
#         return jsonify([])

# @upload_bp.route('/uploads/<filename>')
# def uploaded_file(filename):
#     """Serve uploaded files"""
#     upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
#     return send_from_directory(upload_folder, filename)

from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import json
import uuid
from datetime import datetime

# Import external utilities
from scripts.chunk_utils import generate_chunks  # ⬅️ Make sure this exists
from scripts.build_rag_index import embed_and_store_chunks  # ⬅️ Your custom embedding + FAISS logic
from utils.upload_utils import save_artifact_metadata as save_artifact_metadata_v1, load_all_artifacts as load_all_artifacts_v1, format_time_ago

upload_bp = Blueprint('upload', __name__)

# ========== COMMON METADATA UTILITIES ==========
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
    artifacts = load_all_artifacts()
    sorted_artifacts = sorted(artifacts, key=lambda x: x.get('timestamp', 0), reverse=True)
    return sorted_artifacts[:limit]


# ========== ROUTES FROM FIRST FILE ==========
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

        save_artifact_metadata_v1(metadata)
        return jsonify({'success': True, 'message': 'File uploaded', 'artifact': metadata})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@upload_bp.route('/api/recent-uploads', methods=['GET'])
def get_recent_uploads_api():
    """Get recent uploads for the activity feed"""
    try:
        limit = request.args.get('limit', 5, type=int)
        artifacts = load_all_artifacts_v1()

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


# ========== ROUTES FROM SECOND FILE ==========
@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file part'}), 400

    # Read file content
    text = file.read().decode("utf-8", errors="ignore")

    # Generate timestamp-based unique ID
    timestamp = datetime.now().timestamp()
    artifact_id = int(timestamp * 1000)

    # Chunk and embed the content
    chunks = generate_chunks(text)
    try:
        embed_and_store_chunks(chunks, doc_id=str(artifact_id))  # Save to FAISS/indexes
    except Exception as e:
        return jsonify({'error': f'Embedding/indexing failed: {str(e)}'}), 500

    # Create metadata
    artifact = {
        'id': artifact_id,
        'title': request.form.get('title', file.filename),
        'type': request.form.get('category', 'documentation'),
        'author': request.form.get('author', 'Unknown'),
        'tags': request.form.get('tags', '').split(',') if request.form.get('tags') else [],
        'description': request.form.get('description', ''),
        'filename': file.filename,
        'date': datetime.now().strftime('%Y-%m-%d'),
        'timestamp': timestamp,
        'status': 'indexed'
    }

    save_artifact_metadata(artifact)
    return jsonify({'message': 'File uploaded and indexed successfully!', 'artifact': artifact})

@upload_bp.route('/artifacts', methods=['GET'])
def get_artifacts():
    return jsonify(load_all_artifacts())

@upload_bp.route('/recent-uploads', methods=['GET'])
def get_recent_uploads_endpoint():
    limit = request.args.get('limit', 5, type=int)
    recent_uploads = get_recent_uploads(limit)
    formatted_uploads = [{
        'title': u.get('title', 'Untitled'),
        'type': u.get('type', 'documentation'),
        'timestamp': u.get('timestamp', 0),
        'date': u.get('date', ''),
        'description': u.get('description', '')
    } for u in recent_uploads]
    return jsonify(formatted_uploads)
