#!/usr/bin/env python3
"""
Test script for search functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_search_endpoints():
    """Test all search endpoints"""
    
    print("🧪 Testing Search Functionality")
    print("=" * 50)
    
    # Test 1: Basic search
    print("\n1. Testing basic search...")
    response = requests.get(f"{BASE_URL}/api/search")
    if response.status_code == 200:
        results = response.json()
        print(f"✅ Basic search returned {len(results)} results")
        if results:
            print(f"   First result: {results[0]['title']}")
    else:
        print(f"❌ Basic search failed: {response.status_code}")
    
    # Test 2: Search with query
    print("\n2. Testing search with query...")
    response = requests.get(f"{BASE_URL}/api/search?q=syllabus")
    if response.status_code == 200:
        results = response.json()
        print(f"✅ Query search returned {len(results)} results")
        for result in results:
            print(f"   - {result['title']} ({result['type']})")
    else:
        print(f"❌ Query search failed: {response.status_code}")
    
    # Test 3: Search with filters
    print("\n3. Testing search with filters...")
    response = requests.get(f"{BASE_URL}/api/search?type=documentation&author=Current%20User")
    if response.status_code == 200:
        results = response.json()
        print(f"✅ Filtered search returned {len(results)} results")
        for result in results:
            print(f"   - {result['title']} by {result['author']}")
    else:
        print(f"❌ Filtered search failed: {response.status_code}")
    
    # Test 4: Get filter options
    print("\n4. Testing filter options...")
    response = requests.get(f"{BASE_URL}/api/search/filters")
    if response.status_code == 200:
        filters = response.json()
        print("✅ Filter options retrieved:")
        print(f"   Authors: {filters.get('authors', [])}")
        print(f"   Content Types: {filters.get('contentTypes', [])}")
        print(f"   Tags: {filters.get('tags', [])}")
    else:
        print(f"❌ Filter options failed: {response.status_code}")
    
    # Test 5: Search stats
    print("\n5. Testing search stats...")
    response = requests.get(f"{BASE_URL}/api/search/stats")
    if response.status_code == 200:
        stats = response.json()
        print("✅ Search stats retrieved:")
        print(f"   Total documents: {stats.get('total_documents', 0)}")
        print(f"   By type: {stats.get('by_type', {})}")
        print(f"   Recent uploads: {stats.get('recent_uploads', 0)}")
    else:
        print(f"❌ Search stats failed: {response.status_code}")
    
    # Test 6: Download functionality
    print("\n6. Testing download URLs...")
    response = requests.get(f"{BASE_URL}/api/search")
    if response.status_code == 200:
        results = response.json()
        if results:
            first_result = results[0]
            if 'download_url' in first_result:
                print(f"✅ Download URL found: {first_result['download_url']}")
                print(f"   File: {first_result.get('filename', 'Unknown')}")
            else:
                print("⚠️  No download URL in results")
    else:
        print(f"❌ Download test failed: {response.status_code}")

if __name__ == "__main__":
    try:
        test_search_endpoints()
        print("\n🎉 All tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Make sure it's running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}") 