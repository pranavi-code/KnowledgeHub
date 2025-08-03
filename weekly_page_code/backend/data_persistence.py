import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import sqlite3
from contextlib import contextmanager

class WeeklyDataPersistence:
    """Data persistence layer for weekly dashboard data"""
    
    def __init__(self, db_path: str = "weekly_data.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Create weekly_data table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS weekly_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    week_start_date TEXT NOT NULL,
                    week_type TEXT NOT NULL,
                    data_json TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(week_start_date, week_type)
                )
            ''')
            
            # Create weekly_stats table for aggregated statistics
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS weekly_stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    week_start_date TEXT NOT NULL,
                    stat_name TEXT NOT NULL,
                    stat_value INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(week_start_date, stat_name)
                )
            ''')
            
            # Create weekly_activity table for activity tracking
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS weekly_activity (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    week_start_date TEXT NOT NULL,
                    day_name TEXT NOT NULL,
                    day_date TEXT NOT NULL,
                    uploads INTEGER DEFAULT 0,
                    updates INTEGER DEFAULT 0,
                    decisions INTEGER DEFAULT 0,
                    completed INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(week_start_date, day_date)
                )
            ''')
            
            conn.commit()
    
    @contextmanager
    def get_connection(self):
        """Get database connection with context manager"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable row factory for dict-like access
        try:
            yield conn
        finally:
            conn.close()
    
    def save_weekly_data(self, week_start_date: str, week_type: str, data: Dict[str, Any]) -> bool:
        """Save weekly data to database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Save main weekly data
                cursor.execute('''
                    INSERT OR REPLACE INTO weekly_data 
                    (week_start_date, week_type, data_json, updated_at)
                    VALUES (?, ?, ?, ?)
                ''', (
                    week_start_date,
                    week_type,
                    json.dumps(data),
                    datetime.now().isoformat()
                ))
                
                # Save aggregated stats
                if 'stats' in data:
                    for stat_name, stat_value in data['stats'].items():
                        cursor.execute('''
                            INSERT OR REPLACE INTO weekly_stats 
                            (week_start_date, stat_name, stat_value)
                            VALUES (?, ?, ?)
                        ''', (week_start_date, stat_name, stat_value))
                
                # Save activity data
                if 'chartData' in data and 'weeklyActivity' in data['chartData']:
                    for activity in data['chartData']['weeklyActivity']:
                        cursor.execute('''
                            INSERT OR REPLACE INTO weekly_activity 
                            (week_start_date, day_name, day_date, uploads, updates, decisions, completed)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            week_start_date,
                            activity['day'],
                            activity['date'],
                            activity['uploads'],
                            activity['updates'],
                            activity['decisions'],
                            activity['completed']
                        ))
                
                conn.commit()
                return True
                
        except Exception as e:
            print(f"Error saving weekly data: {e}")
            return False
    
    def get_weekly_data(self, week_start_date: str, week_type: str) -> Optional[Dict[str, Any]]:
        """Retrieve weekly data from database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT data_json FROM weekly_data 
                    WHERE week_start_date = ? AND week_type = ?
                ''', (week_start_date, week_type))
                
                result = cursor.fetchone()
                if result:
                    return json.loads(result['data_json'])
                return None
                
        except Exception as e:
            print(f"Error retrieving weekly data: {e}")
            return None
    
    def get_weekly_stats(self, week_start_date: str) -> Dict[str, int]:
        """Get aggregated weekly statistics"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT stat_name, stat_value FROM weekly_stats 
                    WHERE week_start_date = ?
                ''', (week_start_date,))
                
                stats = {}
                for row in cursor.fetchall():
                    stats[row['stat_name']] = row['stat_value']
                
                return stats
                
        except Exception as e:
            print(f"Error retrieving weekly stats: {e}")
            return {}
    
    def get_weekly_activity(self, week_start_date: str) -> list:
        """Get weekly activity data"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT day_name, day_date, uploads, updates, decisions, completed 
                    FROM weekly_activity 
                    WHERE week_start_date = ?
                    ORDER BY day_date
                ''', (week_start_date,))
                
                activity = []
                for row in cursor.fetchall():
                    activity.append({
                        'day': row['day_name'],
                        'date': row['day_date'],
                        'uploads': row['uploads'],
                        'updates': row['updates'],
                        'decisions': row['decisions'],
                        'completed': row['completed']
                    })
                
                return activity
                
        except Exception as e:
            print(f"Error retrieving weekly activity: {e}")
            return []
    
    def get_recent_weeks(self, limit: int = 10) -> list:
        """Get list of recent weeks with data"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT DISTINCT week_start_date, week_type, created_at 
                    FROM weekly_data 
                    ORDER BY created_at DESC 
                    LIMIT ?
                ''', (limit,))
                
                weeks = []
                for row in cursor.fetchall():
                    weeks.append({
                        'week_start_date': row['week_start_date'],
                        'week_type': row['week_type'],
                        'created_at': row['created_at']
                    })
                
                return weeks
                
        except Exception as e:
            print(f"Error retrieving recent weeks: {e}")
            return []
    
    def delete_weekly_data(self, week_start_date: str, week_type: str) -> bool:
        """Delete weekly data from database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    DELETE FROM weekly_data 
                    WHERE week_start_date = ? AND week_type = ?
                ''', (week_start_date, week_type))
                
                cursor.execute('''
                    DELETE FROM weekly_stats 
                    WHERE week_start_date = ?
                ''', (week_start_date,))
                
                cursor.execute('''
                    DELETE FROM weekly_activity 
                    WHERE week_start_date = ?
                ''', (week_start_date,))
                
                conn.commit()
                return True
                
        except Exception as e:
            print(f"Error deleting weekly data: {e}")
            return False
    
    def cleanup_old_data(self, days_to_keep: int = 90) -> int:
        """Clean up old weekly data"""
        try:
            cutoff_date = (datetime.now() - timedelta(days=days_to_keep)).strftime('%Y-%m-%d')
            
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    DELETE FROM weekly_data 
                    WHERE week_start_date < ?
                ''', (cutoff_date,))
                
                cursor.execute('''
                    DELETE FROM weekly_stats 
                    WHERE week_start_date < ?
                ''', (cutoff_date,))
                
                cursor.execute('''
                    DELETE FROM weekly_activity 
                    WHERE week_start_date < ?
                ''', (cutoff_date,))
                
                deleted_count = cursor.rowcount
                conn.commit()
                return deleted_count
                
        except Exception as e:
            print(f"Error cleaning up old data: {e}")
            return 0

# Global instance for use across the application
weekly_persistence = WeeklyDataPersistence() 