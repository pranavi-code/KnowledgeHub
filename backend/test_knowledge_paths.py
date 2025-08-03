import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_knowledge_paths_api():
    """Test the knowledge paths API endpoints"""
    
    print("🧪 Testing Knowledge Paths API...")
    
    # Test 1: Get all knowledge paths
    print("\n1. Testing GET /api/knowledge-paths")
    try:
        response = requests.get(f"{BASE_URL}/knowledge-paths")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {len(data.get('data', []))} knowledge paths")
            for path in data.get('data', [])[:2]:  # Show first 2 paths
                print(f"   - {path.get('title')} ({path.get('difficulty')})")
        else:
            print(f"❌ Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Get user progress
    print("\n2. Testing GET /api/user/progress")
    try:
        response = requests.get(f"{BASE_URL}/user/progress?user_id=user-123")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! User progress retrieved")
            print(f"   - Progress data: {len(data.get('data', []))} entries")
        else:
            print(f"❌ Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Get specific knowledge path
    print("\n3. Testing GET /api/knowledge-paths/new-developer")
    try:
        response = requests.get(f"{BASE_URL}/knowledge-paths/new-developer")
        if response.status_code == 200:
            data = response.json()
            path = data.get('data', {})
            print(f"✅ Success! Retrieved path: {path.get('title')}")
            print(f"   - Steps: {len(path.get('steps', []))}")
            print(f"   - Estimated time: {path.get('estimated_time')}")
        else:
            print(f"❌ Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Update progress
    print("\n4. Testing POST /api/knowledge-paths/new-developer/progress")
    try:
        progress_data = {
            "user_id": "user-123",
            "completed_steps": ["step-1", "step-2"],
            "progress_percentage": 40
        }
        response = requests.post(
            f"{BASE_URL}/knowledge-paths/new-developer/progress",
            json=progress_data
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Progress updated")
            print(f"   - New progress: {data.get('data', {}).get('progress_percentage')}%")
        else:
            print(f"❌ Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_knowledge_paths_api() 