import os
import json
from datetime import datetime

def get_upload_folder():
    """Get the upload folder path"""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')

def save_artifact_metadata(artifact):
    """Save artifact metadata to JSON file"""
    upload_folder = get_upload_folder()
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    meta_path = os.path.join(upload_folder, f"{artifact['id']}.json")
    with open(meta_path, 'w') as f:
        json.dump(artifact, f)

def load_all_artifacts():
    """Load all artifacts from JSON files"""
    upload_folder = get_upload_folder()
    if not os.path.exists(upload_folder):
        return []
    
    artifacts = []
    for fname in os.listdir(upload_folder):
        if fname.endswith('.json'):
            try:
                with open(os.path.join(upload_folder, fname)) as f:
                    artifacts.append(json.load(f))
            except Exception as e:
                print(f"Error loading artifact {fname}: {e}")
    return artifacts

def format_time_ago(timestamp):
    """Format timestamp to relative time"""
    if not timestamp:
        return 'Unknown'
    
    now = datetime.now()
    upload_time = datetime.fromtimestamp(timestamp)
    diff = now - upload_time
    
    if diff.days > 0:
        return f"{diff.days} days ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hours ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minutes ago"
    else:
        return "Just now" 