from flask import Blueprint, request, jsonify, send_from_directory
from datetime import datetime, timedelta
import os
import json
import glob
from pathlib import Path

search_filter_bp = Blueprint('search_filter', __name__)

def load_all_documents():
    """Load all documents from uploads folder and their metadata"""
    documents = []
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    
    # Load all JSON metadata files
    json_files = glob.glob(os.path.join(uploads_dir, '*.json'))
    for json_file in json_files:
        try:
            with open(json_file, 'r') as f:
                metadata = json.load(f)
                if isinstance(metadata, dict):
                    # Add file path and size information
                    if 'filename' in metadata:
                        file_path = os.path.join(uploads_dir, metadata['filename'])
                        if os.path.exists(file_path):
                            metadata['file_path'] = file_path
                            metadata['file_size'] = os.path.getsize(file_path)
                            metadata['download_url'] = f'/api/download/{metadata["filename"]}'
                            metadata['view_url'] = f'/api/view/{metadata["filename"]}'
                            documents.append(metadata)
        except Exception as e:
            print(f"Error loading {json_file}: {e}")
    
    # Load documents from subdirectories (like rakku/)
    subdirs = [d for d in os.listdir(uploads_dir) if os.path.isdir(os.path.join(uploads_dir, d))]
    for subdir in subdirs:
        subdir_path = os.path.join(uploads_dir, subdir)
        meta_file = os.path.join(subdir_path, 'meta_data.json')
        if os.path.exists(meta_file):
            try:
                with open(meta_file, 'r') as f:
                    subdir_metadata = json.load(f)
                    if isinstance(subdir_metadata, list):
                        for item in subdir_metadata:
                            if 'files' in item and item['files']:
                                for filename in item['files']:
                                    file_path = os.path.join(subdir_path, filename)
                                    if os.path.exists(file_path):
                                        doc = {
                                            'id': f"{subdir}_{filename}",
                                            'title': item.get('title', filename),
                                            'type': item.get('category', 'documentation').lower(),
                                            'author': item.get('username', 'Unknown'),
                                            'date': item.get('timestamp', datetime.now().isoformat())[:10],
                                            'tags': item.get('tags', []),
                                            'views': 0,
                                            'description': item.get('description', ''),
                                            'lastModified': 'recent',
                                            'size': f"{os.path.getsize(file_path) / 1024:.1f} KB",
                                            'status': 'uploaded',
                                            'file_path': file_path,
                                            'file_size': os.path.getsize(file_path),
                                            'download_url': f'/api/download/{subdir}/{filename}',
                                            'view_url': f'/api/view/{subdir}/{filename}',
                                            'filename': filename
                                        }
                                        documents.append(doc)
            except Exception as e:
                print(f"Error loading {meta_file}: {e}")
    
    return documents

def filter_by_date_range(documents, date_range):
    """Filter documents by date range"""
    if not date_range:
        return documents
    
    today = datetime.now()
    
    if date_range == 'today':
        start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
    elif date_range == 'this_week':
        start_date = today - timedelta(days=today.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif date_range == 'this_month':
        start_date = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif date_range == 'this_quarter':
        quarter = (today.month - 1) // 3
        start_date = today.replace(month=quarter * 3 + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
    elif date_range == 'this_year':
        start_date = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        return documents
    
    filtered = []
    for doc in documents:
        try:
            doc_date = datetime.strptime(doc['date'], '%Y-%m-%d')
            if doc_date >= start_date:
                filtered.append(doc)
        except:
            # If date parsing fails, include the document
            filtered.append(doc)
    
    return filtered

def filter_results(documents, filters, search_query, sort_by):
    """Apply all filters to documents"""
    filtered = documents.copy()

    # Text search
    if search_query:
        q = search_query.lower()
        filtered = [
            item for item in filtered
            if q in item.get('title', '').lower()
            or q in item.get('description', '').lower()
            or any(q in tag.lower() for tag in item.get('tags', []))
        ]

    # Content type filter
    if filters.get('contentType'):
        filtered = [item for item in filtered if item.get('type', '') in filters['contentType']]

    # Author filter
    if filters.get('author'):
        filtered = [item for item in filtered if item.get('author', '') in filters['author']]

    # Tags filter
    if filters.get('tags'):
        filtered = [
            item for item in filtered
            if any(tag in item.get('tags', []) for tag in filters['tags'])
        ]

    # Date range filter
    if filters.get('dateRange'):
        filtered = filter_by_date_range(filtered, filters['dateRange'])

    # Sort results
    if sort_by == 'date':
        filtered.sort(key=lambda x: x.get('date', ''), reverse=True)
    elif sort_by == 'views':
        filtered.sort(key=lambda x: x.get('views', 0), reverse=True)
    elif sort_by == 'title':
        filtered.sort(key=lambda x: x.get('title', ''))
    # Default: relevance (no specific sorting)

    return filtered

@search_filter_bp.route('/api/search', methods=['GET'])
def search():
    """Advanced search endpoint with all filters"""
    query = request.args.get('q', '')
    content_type = request.args.getlist('type')
    author = request.args.getlist('author')
    tags = request.args.getlist('tags')
    date_range = request.args.get('dateRange', '')
    sort_by = request.args.get('sortBy', 'relevance')

    # Load all documents
    all_documents = load_all_documents()

    # Prepare filters
    filters = {
        'contentType': content_type,
        'author': author,
        'tags': tags,
        'dateRange': date_range
    }

    # Apply filters
    results = filter_results(all_documents, filters, query, sort_by)

    return jsonify(results)

@search_filter_bp.route('/api/search/filters', methods=['GET'])
def get_search_filters():
    """Get available filter options based on existing documents"""
    documents = load_all_documents()
    
    # Extract unique values for filters
    content_types = list(set(doc.get('type', '') for doc in documents if doc.get('type')))
    authors = list(set(doc.get('author', '') for doc in documents if doc.get('author')))
    all_tags = []
    for doc in documents:
        all_tags.extend(doc.get('tags', []))
    tags = list(set(all_tags))
    
    return jsonify({
        'contentTypes': content_types,
        'authors': authors,
        'tags': tags
    })

@search_filter_bp.route('/api/download/<path:filename>', methods=['GET'])
def download_file(filename):
    """Download a file from uploads folder"""
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    file_path = os.path.join(uploads_dir, filename)
    
    if os.path.exists(file_path):
        return send_from_directory(uploads_dir, filename, as_attachment=True)
    else:
        return jsonify({'error': 'File not found'}), 404

@search_filter_bp.route('/api/download/<subdir>/<path:filename>', methods=['GET'])
def download_file_from_subdir(subdir, filename):
    """Download a file from subdirectory in uploads folder"""
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    file_path = os.path.join(uploads_dir, subdir, filename)
    
    if os.path.exists(file_path):
        return send_from_directory(os.path.join(uploads_dir, subdir), filename, as_attachment=True)
    else:
        return jsonify({'error': 'File not found'}), 404

@search_filter_bp.route('/api/view/<path:filename>', methods=['GET'])
def view_file(filename):
    """View a file in browser (for PDFs)"""
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    file_path = os.path.join(uploads_dir, filename)
    
    if os.path.exists(file_path):
        return send_from_directory(uploads_dir, filename)
    else:
        return jsonify({'error': 'File not found'}), 404

@search_filter_bp.route('/api/view/<subdir>/<path:filename>', methods=['GET'])
def view_file_from_subdir(subdir, filename):
    """View a file from subdirectory in browser"""
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    file_path = os.path.join(uploads_dir, subdir, filename)
    
    if os.path.exists(file_path):
        return send_from_directory(os.path.join(uploads_dir, subdir), filename)
    else:
        return jsonify({'error': 'File not found'}), 404

@search_filter_bp.route('/api/search/stats', methods=['GET'])
def get_search_stats():
    """Get search statistics"""
    documents = load_all_documents()
    
    stats = {
        'total_documents': len(documents),
        'by_type': {},
        'by_author': {},
        'recent_uploads': 0
    }
    
    # Count by type
    for doc in documents:
        doc_type = doc.get('type', 'unknown')
        stats['by_type'][doc_type] = stats['by_type'].get(doc_type, 0) + 1
        
        # Count by author
        author = doc.get('author', 'Unknown')
        stats['by_author'][author] = stats['by_author'].get(author, 0) + 1
        
        # Count recent uploads (last 7 days)
        try:
            doc_date = datetime.strptime(doc.get('date', ''), '%Y-%m-%d')
            if (datetime.now() - doc_date).days <= 7:
                stats['recent_uploads'] += 1
        except:
            pass
    
    return jsonify(stats) 