def validate_artifact_data(data):
    required_fields = ["title", "content", "type", "author"]
    return all(field in data for field in required_fields)

def format_artifact_response(artifact):
    return {
        "title": artifact.get("title"),
        "content": artifact.get("content"),
        "type": artifact.get("type"),
        "author": artifact.get("author"),
        "tags": artifact.get("tags", []),
        "created_at": artifact.get("created_at", "")
    }