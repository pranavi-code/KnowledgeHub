# Weekly Dashboard API Documentation

## Overview
The Weekly Dashboard API provides comprehensive endpoints for managing and retrieving weekly knowledge pulse data with real-time updates via WebSocket connections.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, the API doesn't require authentication. In production, implement proper authentication mechanisms.

## Endpoints

### 1. Get Weekly Summary
**GET** `/weekly/summary`

Retrieves the complete weekly dashboard data for a specific week.

**Query Parameters:**
- `week` (string, optional): Week type - `current`, `last`, or `twoWeeks`. Default: `current`

**Example Request:**
```bash
curl "http://localhost:5000/api/weekly/summary?week=current"
```

**Response:**
```json
{
  "success": true,
  "data": {
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
      "New microservices architecture approved",
      "Q1 2025 roadmap finalized"
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
  },
  "week_type": "current",
  "week_start": "2024-12-16"
}
```

### 2. Get Weekly Statistics
**GET** `/weekly/stats`

Retrieves only the statistics for a specific week.

**Query Parameters:**
- `week` (string, optional): Week type - `current`, `last`, or `twoWeeks`. Default: `current`

**Example Request:**
```bash
curl "http://localhost:5000/api/weekly/stats?week=current"
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "newUploads": 28,
    "updates": 45,
    "decisions": 12,
    "completedTasks": 67,
    "contributors": 23,
    "pendingReviews": 19
  }
}
```

### 3. Get Weekly Activity
**GET** `/weekly/activity`

Retrieves the weekly activity chart data.

**Query Parameters:**
- `week` (string, optional): Week type - `current`, `last`, or `twoWeeks`. Default: `current`

**Example Request:**
```bash
curl "http://localhost:5000/api/weekly/activity?week=current"
```

**Response:**
```json
{
  "success": true,
  "activity": [
    {
      "day": "Mon",
      "date": "2024-12-16",
      "uploads": 4,
      "updates": 8,
      "decisions": 2,
      "completed": 12
    },
    ...
  ]
}
```

### 4. Get Pending Reviews
**GET** `/weekly/pending`

Retrieves pending review items for a specific week.

**Query Parameters:**
- `week` (string, optional): Week type - `current`, `last`, or `twoWeeks`. Default: `current`

**Example Request:**
```bash
curl "http://localhost:5000/api/weekly/pending?week=current"
```

**Response:**
```json
{
  "success": true,
  "pending": [
    {
      "id": "uuid-string",
      "title": "Payment Integration Documentation",
      "author": "Emma Thompson",
      "daysWaiting": 3,
      "reviewers": ["John Doe", "Sarah Chen"],
      "priority": "high"
    }
  ]
}
```

### 5. Refresh Weekly Data
**POST** `/weekly/refresh`

Forces a refresh of the weekly data by regenerating it.

**Request Body:**
```json
{
  "week": "current"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/weekly/refresh" \
  -H "Content-Type: application/json" \
  -d '{"week": "current"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Weekly data refreshed successfully",
  "data": {
    // Complete weekly data object
  }
}
```

### 6. Export Weekly Report
**GET** `/weekly/export`

Exports the weekly report as JSON for download or external processing.

**Query Parameters:**
- `week` (string, optional): Week type - `current`, `last`, or `twoWeeks`. Default: `current`

**Example Request:**
```bash
curl "http://localhost:5000/api/weekly/export?week=current"
```

**Response:**
```json
{
  "success": true,
  "export_data": {
    // Complete weekly data object
  },
  "export_date": "2024-12-23T09:00:00",
  "week_period": "Dec 16 - Dec 22, 2024"
}
```

## WebSocket Events

### Connection
Connect to the WebSocket server:
```javascript
const socket = io('http://localhost:5000');
```

### Events

#### Client to Server Events

1. **subscribe_weekly_updates**
   ```javascript
   socket.emit('subscribe_weekly_updates', { week: 'current' });
   ```

2. **unsubscribe_weekly_updates**
   ```javascript
   socket.emit('unsubscribe_weekly_updates', { week: 'current' });
   ```

3. **request_weekly_refresh**
   ```javascript
   socket.emit('request_weekly_refresh', { week: 'current' });
   ```

#### Server to Client Events

1. **connected**
   ```javascript
   socket.on('connected', (data) => {
     console.log('Connected:', data);
   });
   ```

2. **weekly_data_update**
   ```javascript
   socket.on('weekly_data_update', (data) => {
     console.log('Weekly data updated:', data);
   });
   ```

3. **weekly_data_refreshed**
   ```javascript
   socket.on('weekly_data_refreshed', (data) => {
     console.log('Weekly data refreshed:', data);
   });
   ```

## Data Models

### Weekly Data Structure
```typescript
interface WeeklyData {
  period: string;
  generated: string;
  stats: {
    newUploads: number;
    updates: number;
    decisions: number;
    completedTasks: number;
    contributors: number;
    pendingReviews: number;
  };
  highlights: string[];
  uploads: Upload[];
  updates: Update[];
  decisions: Decision[];
  completed: CompletedTask[];
  pending: PendingReview[];
  chartData: {
    weeklyActivity: ActivityData[];
    categoryBreakdown: CategoryData[];
    impactDistribution: ImpactData[];
  };
}
```

### Upload
```typescript
interface Upload {
  id: string;
  title: string;
  type: string;
  author: string;
  date: string;
  category: string;
  views: number;
  status: string;
}
```

### Pending Review
```typescript
interface PendingReview {
  id: string;
  title: string;
  author: string;
  daysWaiting: number;
  reviewers: string[];
  priority: 'high' | 'medium' | 'low';
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## CORS

CORS is enabled for all origins. In production, configure CORS to allow only specific domains.

## Database

The API uses SQLite for data persistence with the following tables:
- `weekly_data`: Main weekly data storage
- `weekly_stats`: Aggregated statistics
- `weekly_activity`: Daily activity tracking

## Background Tasks

The system includes background tasks that:
- Update current week data every 5 minutes
- Clean up old data (older than 90 days)
- Broadcast real-time updates to connected clients

## Development Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python app.py
   ```

3. The server will start on `http://localhost:5000`

## Production Considerations

1. **Database**: Replace SQLite with PostgreSQL or MySQL for production
2. **Authentication**: Implement proper authentication and authorization
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **CORS**: Configure CORS for specific domains
5. **Logging**: Implement proper logging and monitoring
6. **Caching**: Add Redis for caching frequently accessed data
7. **Load Balancing**: Use a load balancer for high availability
8. **SSL/TLS**: Enable HTTPS in production 