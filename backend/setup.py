#!/usr/bin/env python3
"""
Setup script for Knowledge Transfer Platform Backend
"""

import os
import sys
import subprocess

def create_directories():
    """Create necessary directories"""
    directories = ['uploads', 'logs', 'data']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def install_dependencies():
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
    print("✓ Dependencies installed")

def setup_environment():
    """Setup environment file"""
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write("""GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key_here_change_in_production
""")
        print("✓ Created .env file - Please update with your actual API keys")
    else:
        print("✓ .env file already exists")

def main():
    """Main setup function"""
    print("Setting up Knowledge Transfer Platform Backend...")
    
    create_directories()
    install_dependencies()
    setup_environment()
    
    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Update .env file with your actual Gemini API key")
    print("2. Run: python app.py")
    print("3. Your backend will be available at http://localhost:5000")

if __name__ == "__main__":
    main()
