#!/usr/bin/env python3
"""
Startup script for Weekly Dashboard Backend Server
This script initializes and starts the Flask server with WebSocket support
"""

import os
import sys
from datetime import datetime

def check_dependencies():
    """Check if all required dependencies are installed"""
    required_packages = [
        'flask',
        'flask_cors', 
        'flask_socketio',
        'python_socketio',
        'eventlet'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\nPlease install missing packages:")
        print("pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies are installed")
    return True

def check_database():
    """Check if database can be initialized"""
    try:
        from data_persistence import weekly_persistence
        print("✅ Database initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

def start_server():
    """Start the Flask server"""
    try:
        from app import app, socketio
        
        print("\n🚀 Starting Weekly Dashboard Backend Server...")
        print(f"📅 Started at: {datetime.now()}")
        print("🌐 Server will be available at: http://localhost:5000")
        print("📡 WebSocket will be available at: ws://localhost:5000")
        print("\n📋 Available API Endpoints:")
        print("   GET  /api/weekly/summary    - Complete weekly dashboard data")
        print("   GET  /api/weekly/stats      - Weekly statistics only")
        print("   GET  /api/weekly/activity   - Weekly activity chart data")
        print("   GET  /api/weekly/pending    - Pending review items")
        print("   POST /api/weekly/refresh    - Force data refresh")
        print("   GET  /api/weekly/export     - Export weekly report")
        print("\n🔄 Background tasks:")
        print("   - Data updates every 5 minutes")
        print("   - WebSocket real-time updates")
        print("   - Automatic data persistence")
        print("\n⏹️  Press Ctrl+C to stop the server")
        print("="*60)
        
        # Start the server
        socketio.run(app, debug=True, host='0.0.0.0', port=5000)
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        print("👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Failed to start server: {e}")
        sys.exit(1)

def main():
    """Main function"""
    print("🔧 Weekly Dashboard Backend Server")
    print("="*40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check database
    if not check_database():
        sys.exit(1)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main() 