#!/usr/bin/env python3
"""
Test script for Weekly Dashboard API
Run this script to test all endpoints and verify functionality
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000/api"
HEADERS = {"Content-Type": "application/json"}

def test_endpoint(endpoint, method="GET", data=None, params=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, params=params)
        elif method == "POST":
            response = requests.post(url, json=data, headers=HEADERS)
        
        print(f"\n{'='*60}")
        print(f"Testing: {method} {endpoint}")
        print(f"URL: {response.url}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"Response keys: {list(result.keys())}")
            
            if 'data' in result:
                data_keys = list(result['data'].keys())
                print(f"Data keys: {data_keys}")
            
            return result
        else:
            print("❌ Failed!")
            print(f"Error: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the server is running on localhost:5000")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_weekly_summary():
    """Test weekly summary endpoint"""
    print("\n" + "="*80)
    print("TESTING WEEKLY SUMMARY ENDPOINT")
    print("="*80)
    
    # Test current week
    result = test_endpoint("/weekly/summary", params={"week": "current"})
    if result and result.get('success'):
        data = result['data']
        print(f"✅ Current week period: {data.get('period')}")
        print(f"✅ Stats available: {list(data.get('stats', {}).keys())}")
        print(f"✅ Highlights count: {len(data.get('highlights', []))}")
        print(f"✅ Pending reviews count: {len(data.get('pending', []))}")
    
    # Test last week
    result = test_endpoint("/weekly/summary", params={"week": "last"})
    if result and result.get('success'):
        print(f"✅ Last week data retrieved successfully")
    
    # Test two weeks ago
    result = test_endpoint("/weekly/summary", params={"week": "twoWeeks"})
    if result and result.get('success'):
        print(f"✅ Two weeks ago data retrieved successfully")

def test_weekly_stats():
    """Test weekly stats endpoint"""
    print("\n" + "="*80)
    print("TESTING WEEKLY STATS ENDPOINT")
    print("="*80)
    
    result = test_endpoint("/weekly/stats", params={"week": "current"})
    if result and result.get('success'):
        stats = result['stats']
        print(f"✅ Stats retrieved: {list(stats.keys())}")
        for stat_name, value in stats.items():
            print(f"   {stat_name}: {value}")

def test_weekly_activity():
    """Test weekly activity endpoint"""
    print("\n" + "="*80)
    print("TESTING WEEKLY ACTIVITY ENDPOINT")
    print("="*80)
    
    result = test_endpoint("/weekly/activity", params={"week": "current"})
    if result and result.get('success'):
        activity = result['activity']
        print(f"✅ Activity data retrieved: {len(activity)} days")
        for day in activity:
            print(f"   {day['day']}: Uploads={day['uploads']}, Updates={day['updates']}, Decisions={day['decisions']}, Completed={day['completed']}")

def test_pending_reviews():
    """Test pending reviews endpoint"""
    print("\n" + "="*80)
    print("TESTING PENDING REVIEWS ENDPOINT")
    print("="*80)
    
    result = test_endpoint("/weekly/pending", params={"week": "current"})
    if result and result.get('success'):
        pending = result['pending']
        print(f"✅ Pending reviews retrieved: {len(pending)} items")
        for item in pending:
            print(f"   {item['title']} (Priority: {item['priority']}, Waiting: {item['daysWaiting']} days)")

def test_refresh_endpoint():
    """Test refresh endpoint"""
    print("\n" + "="*80)
    print("TESTING REFRESH ENDPOINT")
    print("="*80)
    
    result = test_endpoint("/weekly/refresh", method="POST", data={"week": "current"})
    if result and result.get('success'):
        print(f"✅ Data refreshed successfully")
        print(f"✅ Message: {result.get('message')}")

def test_export_endpoint():
    """Test export endpoint"""
    print("\n" + "="*80)
    print("TESTING EXPORT ENDPOINT")
    print("="*80)
    
    result = test_endpoint("/weekly/export", params={"week": "current"})
    if result and result.get('success'):
        print(f"✅ Export data retrieved successfully")
        print(f"✅ Export date: {result.get('export_date')}")
        print(f"✅ Week period: {result.get('week_period')}")

def test_error_handling():
    """Test error handling"""
    print("\n" + "="*80)
    print("TESTING ERROR HANDLING")
    print("="*80)
    
    # Test invalid week parameter
    result = test_endpoint("/weekly/summary", params={"week": "invalid"})
    if result:
        print("✅ Invalid week parameter handled gracefully")

def test_data_consistency():
    """Test data consistency across endpoints"""
    print("\n" + "="*80)
    print("TESTING DATA CONSISTENCY")
    print("="*80)
    
    # Get summary data
    summary = test_endpoint("/weekly/summary", params={"week": "current"})
    if not summary or not summary.get('success'):
        return
    
    # Get stats data
    stats = test_endpoint("/weekly/stats", params={"week": "current"})
    if not stats or not stats.get('success'):
        return
    
    # Compare stats
    summary_stats = summary['data']['stats']
    stats_data = stats['stats']
    
    if summary_stats == stats_data:
        print("✅ Stats consistency: PASSED")
    else:
        print("❌ Stats consistency: FAILED")
        print(f"Summary stats: {summary_stats}")
        print(f"Stats endpoint: {stats_data}")

def run_all_tests():
    """Run all tests"""
    print("🚀 Starting Weekly Dashboard API Tests")
    print(f"📅 Test started at: {datetime.now()}")
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/weekly/summary")
        if response.status_code != 200:
            print("❌ Server is not responding correctly")
            return
    except:
        print("❌ Cannot connect to server. Make sure it's running on localhost:5000")
        return
    
    print("✅ Server is running and responding")
    
    # Run all tests
    test_weekly_summary()
    test_weekly_stats()
    test_weekly_activity()
    test_pending_reviews()
    test_refresh_endpoint()
    test_export_endpoint()
    test_error_handling()
    test_data_consistency()
    
    print("\n" + "="*80)
    print("🎉 ALL TESTS COMPLETED")
    print("="*80)

if __name__ == "__main__":
    run_all_tests() 