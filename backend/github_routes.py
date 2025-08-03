from flask import Blueprint, request, jsonify, redirect
import os
import requests
from dotenv import load_dotenv
from git import Repo
from pathlib import Path

load_dotenv()

github_bp = Blueprint("github", __name__)

# Use environment variables from .env file
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

@github_bp.route("/github/test")
def github_test():
    """Test route to check if GitHub integration is working"""
    return jsonify({
        "status": "GitHub routes are working",
        "client_id": GITHUB_CLIENT_ID,
        "frontend_url": FRONTEND_URL
    })

@github_bp.route("/github/login")
def github_login():
    if not GITHUB_CLIENT_ID:
        return jsonify({"error": "GitHub Client ID not configured"}), 500
    
    # Use the backend callback URL, not frontend
    redirect_uri = "http://localhost:5000/github/callback"
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}&scope=repo&redirect_uri={redirect_uri}"
    )
    print(f"🔗 GitHub Auth URL: {github_auth_url}")
    return redirect(github_auth_url)

@github_bp.route("/github/callback")
def github_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing code"}), 400

    print(f"📥 Received code: {code}")

    token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
        },
    )
    token_json = token_response.json()
    access_token = token_json.get("access_token")

    if not access_token:
        print(f"❌ Token error: {token_json}")
        return jsonify({"error": "Failed to get access token"}), 400

    print(f"✅ Got access token: {access_token[:10]}...")

    # Fetch repos
    repos_response = requests.get(
        "https://api.github.com/user/repos",
        headers={"Authorization": f"token {access_token}"},
    )

    repos = repos_response.json()

    # ✅ Fix: Redirect to success page with repo count and token
    redirect_url = f"{FRONTEND_URL}/github/success?count={len(repos)}&token={access_token}"
    print(f"🔁 Redirecting to: {redirect_url}")
    return redirect(redirect_url)


@github_bp.route("/github/repos")
def github_repos():
    # Get token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid authorization header"}), 401
    
    token = auth_header.split(" ")[1]
    
    try:
        # Fetch repos from GitHub API
        repos_response = requests.get(
            "https://api.github.com/user/repos",
            headers={"Authorization": f"token {token}"}
        )
        
        if repos_response.status_code != 200:
            return jsonify({"error": "Failed to fetch repositories"}), repos_response.status_code
        
        repos = repos_response.json()
        return jsonify(repos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@github_bp.route("/github/sync", methods=["POST"])
def github_sync():
    data = request.get_json()
    full_name = data.get("full_name")
    clone_url = data.get("clone_url")

    if not full_name or not clone_url:
        return jsonify({"error": "Missing data"}), 400

    clone_path = Path("synced_repos") / full_name

    try:
        if clone_path.exists():
            repo = Repo(str(clone_path))
            repo.remotes.origin.pull()
        else:
            Repo.clone_from(clone_url, str(clone_path))

        return jsonify({"message": f"Repository '{full_name}' synced successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Global (or better: session/db, but for now)
ACTIVE_REPO = {}

@github_bp.route("/github/set-active", methods=["POST"])
def set_active_repo():
    data = request.get_json()
    ACTIVE_REPO["repo"] = data
    return jsonify({"message": "Active repo set!"})

@github_bp.route("/github/get-active")
def get_active_repo():
    return jsonify(ACTIVE_REPO.get("repo", {}))

@github_bp.route("/github/repo-files")
def get_repo_files():
    # Get token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid authorization header"}), 401
    
    token = auth_header.split(" ")[1]
    
    # Get repo info from query params
    owner = request.args.get("owner")
    repo = request.args.get("repo")
    
    if not owner or not repo:
        return jsonify({"error": "Missing owner or repo parameter"}), 400
    
    try:
        # Fetch files from GitHub API
        files_response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/contents",
            headers={"Authorization": f"token {token}"}
        )
        
        if files_response.status_code != 200:
            return jsonify({"error": "Failed to fetch repository files"}), files_response.status_code
        
        files = files_response.json()
        
        # Process files to get more details
        processed_files = []
        for file in files:
            file_info = {
                "name": file["name"],
                "path": file["path"],
                "type": file["type"],  # "file" or "dir"
                "size": file.get("size", 0),
                "sha": file["sha"],
                "url": file["url"],
                "download_url": file.get("download_url"),
                "html_url": file["html_url"]
            }
            processed_files.append(file_info)
        
        return jsonify(processed_files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@github_bp.route("/github/file-content")
def get_file_content():
    # Get token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid authorization header"}), 401
    
    token = auth_header.split(" ")[1]
    
    # Get file info from query params
    owner = request.args.get("owner")
    repo = request.args.get("repo")
    path = request.args.get("path")
    
    if not owner or not repo or not path:
        return jsonify({"error": "Missing owner, repo, or path parameter"}), 400
    
    try:
        # Fetch file content from GitHub API
        content_response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/contents/{path}",
            headers={"Authorization": f"token {token}"}
        )
        
        if content_response.status_code != 200:
            return jsonify({"error": "Failed to fetch file content"}), content_response.status_code
        
        file_data = content_response.json()
        
        # Decode content if it's encoded
        import base64
        content = base64.b64decode(file_data["content"]).decode("utf-8")
        
        return jsonify({
            "name": file_data["name"],
            "path": file_data["path"],
            "content": content,
            "size": file_data["size"],
            "sha": file_data["sha"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500 