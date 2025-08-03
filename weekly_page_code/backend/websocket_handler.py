from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request, current_app
from datetime import datetime, timedelta
import json
import threading
import time
from weekly_dashboard import weekly_data_store, generate_weekly_data

# Initialize SocketIO
socketio = SocketIO(cors_allowed_origins="*")

# Store connected clients
connected_clients = {}

@socketio.on('connect')
def handle_connect(auth=None):
    """Handle client connection"""
    client_id = request.sid
    connected_clients[client_id] = {
        'connected_at': datetime.now(),
        'subscribed_weeks': set()
    }
    print(f"Client connected: {client_id}")
    emit('connected', {'status': 'connected', 'client_id': client_id})

@socketio.on('disconnect')
def handle_disconnect(auth=None):
    """Handle client disconnection"""
    client_id = request.sid
    if client_id in connected_clients:
        del connected_clients[client_id]
    print(f"Client disconnected: {client_id}")

@socketio.on('subscribe_weekly_updates')
def handle_subscribe_weekly(data):
    """Subscribe to weekly dashboard updates"""
    client_id = request.sid
    week_type = data.get('week', 'current')
    
    if client_id in connected_clients:
        connected_clients[client_id]['subscribed_weeks'].add(week_type)
        join_room(f'weekly_{week_type}')
        
        # Send initial data
        today = datetime.now()
        if week_type == 'current':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
        elif week_type == 'last':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 7)
        elif week_type == 'twoWeeks':
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 14)
        else:
            week_start = today - timedelta(days=today.weekday())
        
        week_key = week_start.strftime('%Y-%m-%d')
        if week_key not in weekly_data_store:
            weekly_data_store[week_key] = generate_weekly_data(week_start)
        
        emit('weekly_data_update', {
            'week_type': week_type,
            'data': weekly_data_store[week_key]
        })
        
        print(f"Client {client_id} subscribed to {week_type} updates")

@socketio.on('unsubscribe_weekly_updates')
def handle_unsubscribe_weekly(data):
    """Unsubscribe from weekly dashboard updates"""
    client_id = request.sid
    week_type = data.get('week', 'current')
    
    if client_id in connected_clients:
        connected_clients[client_id]['subscribed_weeks'].discard(week_type)
        leave_room(f'weekly_{week_type}')
        print(f"Client {client_id} unsubscribed from {week_type} updates")

@socketio.on('request_weekly_refresh')
def handle_weekly_refresh(data):
    """Handle manual refresh request"""
    client_id = request.sid
    week_type = data.get('week', 'current')
    
    today = datetime.now()
    if week_type == 'current':
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday)
    elif week_type == 'last':
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday + 7)
    elif week_type == 'twoWeeks':
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday + 14)
    else:
        week_start = today - timedelta(days=today.weekday())
    
    week_key = week_start.strftime('%Y-%m-%d')
    weekly_data_store[week_key] = generate_weekly_data(week_start)
    
    # Broadcast to all subscribers
    socketio.emit('weekly_data_refreshed', {
        'week_type': week_type,
        'data': weekly_data_store[week_key],
        'refreshed_at': datetime.now().isoformat()
    }, room=f'weekly_{week_type}')
    
    print(f"Weekly data refreshed for {week_type}")

def broadcast_weekly_updates():
    """Background task to broadcast periodic updates"""
    while True:
        try:
            # Update current week data every 5 minutes
            today = datetime.now()
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
            week_key = week_start.strftime('%Y-%m-%d')
            
            # Regenerate current week data
            weekly_data_store[week_key] = generate_weekly_data(week_start)
            
            # Broadcast to current week subscribers using Flask app context
            try:
                with current_app.app_context():
                    socketio.emit('weekly_data_update', {
                        'week_type': 'current',
                        'data': weekly_data_store[week_key],
                        'updated_at': datetime.now().isoformat()
                    }, room='weekly_current')
                print(f"Broadcasted weekly update for current week at {datetime.now()}")
            except RuntimeError:
                # App context not available, skip this update
                print("App context not available, skipping broadcast")
            
        except Exception as e:
            print(f"Error in broadcast_weekly_updates: {e}")
        
        # Wait 5 minutes before next update
        time.sleep(300)

def start_background_tasks():
    """Start background tasks for real-time updates"""
    update_thread = threading.Thread(target=broadcast_weekly_updates, daemon=True)
    update_thread.start()
    print("Background weekly update task started")

# Background tasks will be started when the Flask app is initialized
# This prevents the 'NoneType' object has no attribute 'emit' error 