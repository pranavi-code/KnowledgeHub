#!/usr/bin/env python3
"""
Test script for onboarding functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_onboarding_endpoints():
    """Test all onboarding endpoints"""
    
    print("🧪 Testing Onboarding Functionality")
    print("=" * 50)
    
    # Test 1: Get user data
    print("\n1. Testing user data endpoint...")
    response = requests.get(f"{BASE_URL}/api/onboarding/user")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ User data retrieved successfully")
        print(f"   Found {len(data)} users")
        for user in data:
            print(f"   - {user['username']}: {len(user['phases'])} phases")
    else:
        print(f"❌ User data failed: {response.status_code}")
    
    # Test 2: Get progress
    print("\n2. Testing progress endpoint...")
    response = requests.get(f"{BASE_URL}/api/onboarding/progress")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Progress data retrieved successfully")
        if 'progress' in data:
            for progress in data['progress']:
                print(f"   - {progress['username']}: {progress['percentage']}% complete")
    else:
        print(f"❌ Progress failed: {response.status_code}")
    
    # Test 3: Get achievements
    print("\n3. Testing achievements endpoint...")
    response = requests.get(f"{BASE_URL}/api/onboarding/achievements")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Achievements retrieved successfully")
        for achievement in data:
            print(f"   - {achievement['username']}: {len(achievement['achievements'])} achievements")
    else:
        print(f"❌ Achievements failed: {response.status_code}")
    
    # Test 4: Test resource endpoint
    print("\n4. Testing resource endpoint...")
    response = requests.get(f"{BASE_URL}/api/onboarding/resources/IDE%20Setup%20Guide")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Resource URL retrieved: {data.get('url', 'N/A')}")
    else:
        print(f"❌ Resource failed: {response.status_code}")
    
    # Test 5: Test task toggle (this will modify the data)
    print("\n5. Testing task toggle...")
    response = requests.post(f"{BASE_URL}/api/onboarding/task/rakshitha/Foundation%20Setup/Install%20Development%20Tools")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Task toggle successful")
        print(f"   Task completed: {data.get('task_completed', 'N/A')}")
        print(f"   Phase completed: {data.get('phase_completed', 'N/A')}")
    else:
        print(f"❌ Task toggle failed: {response.status_code}")

if __name__ == "__main__":
    try:
        test_onboarding_endpoints()
        print("\n🎉 All onboarding tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Make sure it's running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}") 