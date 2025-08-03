# Weekly Dashboard Backend Implementation

## Overview
This backend implementation provides a comprehensive API for the Weekly Dashboard component with real-time updates, data persistence, and dynamic data generation.

## Features

### ✅ Core Features
- **Dynamic Data Generation**: Automatically generates realistic weekly dashboard data
- **Real-time Updates**: WebSocket support for live data updates
- **Data Persistence**: SQLite database for storing weekly data
- **Multiple Week Views**: Support for current, last, and two weeks ago
- **Comprehensive API**: 6 main endpoints for different data needs
- **Background Tasks**: Automatic data updates every 5 minutes

### ✅ API Endpoints
1. **GET** `/api/weekly/summary` - Complete weekly dashboard data
2. **GET** `/api/weekly/stats` - Weekly statistics only
3. **GET** `/api/weekly/activity` - Weekly activity chart data
4. **GET** `/api/weekly/pending` - Pending review items
5. **POST** `/api/weekly/refresh` - Force data refresh
6. **GET** `/api/weekly/export` - Export weekly report

### ✅ WebSocket Events
- Real-time data updates
- Manual refresh requests
- Subscription management

## File Structure

```
backend/
├── app.py                    # Main Flask application
├── weekly_dashboard.py       # Weekly dashboard blueprint
├── websocket_handler.py      # WebSocket event handlers
├── data_persistence.py       # Database persistence layer
├── test_weekly_api.py        # API testing script
├── WEEKLY_API_DOCS.md        # Complete API documentation
├── WEEKLY_BACKEND_README.md  # This file
├── requirements.txt          # Python dependencies
└── weekly_data.db           # SQLite database (auto-created)
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python app.py
```

The server will start on `http://localhost:5000`

### 3. Test the API
```bash
python test_weekly_api.py
```

## API Usage Examples

### Get Weekly Summary
```bash
curl "http://localhost:5000/api/weekly/summary?week=current"
```

### Get Weekly Statistics
```bash
curl "http://localhost:5000/api/weekly/stats?week=current"
```

### Refresh Data
```bash
curl -X POST "http://localhost:5000/api/weekly/refresh" \
  -H "Content-Type: application/json" \
  -d '{"week": "current"}'
```

### Export Report
```bash
curl "http://localhost:5000/api/weekly/export?week=current"
```

## WebSocket Integration

### Connect to WebSocket
```javascript
const socket = io('http://localhost:5000');

// Subscribe to updates
socket.emit('subscribe_weekly_updates', { week: 'current' });

// Listen for updates
socket.on('weekly_data_update', (data) => {
  console.log('Data updated:', data);
});

// Request manual refresh
socket.emit('request_weekly_refresh', { week: 'current' });
```

## Data Structure

### Weekly Data Object
```json
{
  "period": "Dec 16 - Dec 22, 2024",
  "generated": "2024-12-23 09:00 AM",
  "stats": {
    "newUploads": 28,
    "updates": 45,
    "decisions": 12,
    "completedTasks": 67,
    "contributors": 23,
    "pendingReviews": 19
  },
  "highlights": [
    "Major API documentation overhaul completed",
    "New microservices architecture approved"
  ],
  "uploads": [...],
  "updates": [...],
  "decisions": [...],
  "completed": [...],
  "pending": [...],
  "chartData": {
    "weeklyActivity": [...],
    "categoryBreakdown": [...],
    "impactDistribution": [...]
  }
}
```

## Database Schema

### Tables
1. **weekly_data**: Main weekly data storage
2. **weekly_stats**: Aggregated statistics
3. **weekly_activity**: Daily activity tracking

### Sample Queries
```sql
-- Get all weekly data
SELECT * FROM weekly_data WHERE week_type = 'current';

-- Get stats for a specific week
SELECT stat_name, stat_value FROM weekly_stats 
WHERE week_start_date = '2024-12-16';

-- Get activity for a week
SELECT day_name, uploads, updates, decisions, completed 
FROM weekly_activity 
WHERE week_start_date = '2024-12-16'
ORDER BY day_date;
```

## Dynamic Updates

### Automatic Updates
- Current week data updates every 5 minutes
- Background task runs continuously
- WebSocket broadcasts to all connected clients

### Manual Updates
- POST to `/api/weekly/refresh` endpoint
- WebSocket `request_weekly_refresh` event
- Regenerates all data for the specified week

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Performance Features

### Caching
- In-memory cache for frequently accessed data
- Database persistence for data durability
- Automatic cache invalidation on updates

### Background Processing
- Asynchronous data generation
- Non-blocking WebSocket operations
- Thread-safe data access

## Security Considerations

### Current Implementation
- CORS enabled for development
- No authentication (development only)
- Input validation on all endpoints

### Production Recommendations
1. **Authentication**: Implement JWT or session-based auth
2. **Rate Limiting**: Add request rate limiting
3. **CORS**: Configure for specific domains only
4. **HTTPS**: Enable SSL/TLS
5. **Input Sanitization**: Add comprehensive input validation
6. **Database Security**: Use connection pooling and prepared statements

## Monitoring & Logging

### Current Logging
- Connection/disconnection events
- Data refresh events
- Error logging for debugging

### Production Monitoring
1. **Application Metrics**: Request rates, response times
2. **Database Metrics**: Query performance, connection usage
3. **WebSocket Metrics**: Connection count, message rates
4. **Error Tracking**: Comprehensive error logging and alerting

## Development Workflow

### Adding New Features
1. Create new endpoint in `weekly_dashboard.py`
2. Add corresponding WebSocket event if needed
3. Update database schema if required
4. Add tests to `test_weekly_api.py`
5. Update documentation

### Testing
```bash
# Run all tests
python test_weekly_api.py

# Test specific endpoint
curl "http://localhost:5000/api/weekly/summary?week=current"
```

### Database Management
```bash
# Database is auto-created on first run
# Manual cleanup (if needed):
python -c "from data_persistence import weekly_persistence; weekly_persistence.cleanup_old_data()"
```

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 5000 is available
   - Verify all dependencies are installed
   - Check Python version (3.7+ required)

2. **WebSocket connection fails**
   - Ensure Flask-SocketIO is installed
   - Check CORS configuration
   - Verify client-side Socket.IO version

3. **Database errors**
   - Check file permissions for database file
   - Verify SQLite is available
   - Check database file integrity

4. **Data not updating**
   - Check background task is running
   - Verify WebSocket connections
   - Check server logs for errors

### Debug Mode
```bash
# Run with debug logging
FLASK_DEBUG=1 python app.py
```

## Production Deployment

### Environment Setup
```bash
# Install production dependencies
pip install gunicorn eventlet

# Set environment variables
export FLASK_ENV=production
export DATABASE_URL=postgresql://user:pass@host/db
```

### Using Gunicorn
```bash
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "--bind", "0.0.0.0:5000", "app:app"]
```

## Contributing

### Code Style
- Follow PEP 8 guidelines
- Add docstrings to all functions
- Include type hints where possible
- Write tests for new features

### Pull Request Process
1. Create feature branch
2. Implement changes
3. Add/update tests
4. Update documentation
5. Submit pull request

## License
This implementation is part of the ToolKit project.

## Support
For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Run the test suite
4. Check server logs for errors 