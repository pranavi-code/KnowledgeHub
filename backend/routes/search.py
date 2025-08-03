from flask import Blueprint, request, jsonify
from utils.upload_utils import load_all_artifacts

search_bp = Blueprint('search', __name__)

@search_bp.route('/api/search', methods=['GET'])
def advanced_search():
    """Advanced search matching your SearchFilter component exactly"""
    query = request.args.get('q', '').lower()
    content_type = request.args.getlist('type')
    authors = request.args.getlist('author')
    tags = request.args.getlist('tags')
    priority = request.args.get('priority', '')
    sort_by = request.args.get('sortBy', 'relevance')

    # Use artifacts from uploads instead of search_data
    artifacts = load_all_artifacts()
    results = artifacts.copy()

    # Apply filters
    if query:
        results = [r for r in results if 
                  query in r.get('title', '').lower() or 
                  query in r.get('description', '').lower() or
                  any(query in tag.lower() for tag in r.get('tags', []))]

    if content_type:
        results = [r for r in results if r.get('type') in content_type]

    if authors:
        results = [r for r in results if r.get('author') in authors]

    if tags:
        results = [r for r in results if any(tag in r.get('tags', []) for tag in tags)]

    if priority:
        results = [r for r in results if r.get('priority') == priority]

    # Sort results
    if sort_by == 'date':
        results.sort(key=lambda x: x.get('date', ''), reverse=True)
    elif sort_by == 'views':
        results.sort(key=lambda x: x.get('views', 0), reverse=True)
    elif sort_by == 'title':
        results.sort(key=lambda x: x.get('title', ''))

    return jsonify(results) 