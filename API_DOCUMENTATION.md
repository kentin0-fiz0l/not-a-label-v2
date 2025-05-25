# Not a Label API Documentation

## Overview

The Not a Label API provides programmatic access to our music distribution platform, enabling developers to build integrations, mobile apps, and custom tools for artists and labels.

**Base URL**: `https://not-a-label.art/api`
**Version**: v1
**Authentication**: JWT Bearer tokens

## Authentication

All API requests require authentication using JWT tokens obtained through the authentication endpoints.

### Obtain Access Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "artist@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "artist@example.com",
    "name": "Artist Name",
    "role": "artist"
  }
}
```

### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Authentication | 5 requests | 15 minutes |
| Upload | 10 requests | 1 hour |
| AI Services | 20 requests | 1 hour |
| General API | 100 requests | 1 minute |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when window resets

## Tracks API

### Upload Track

```http
POST /tracks/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "file": [audio file],
  "title": "Track Title",
  "artist": "Artist Name",
  "genre": "Hip Hop",
  "tags": ["rap", "beats"],
  "isPublic": true
}
```

**Response:**
```json
{
  "id": "track_123",
  "title": "Track Title",
  "status": "processing",
  "uploadUrl": "https://upload.not-a-label.art/track_123",
  "processingJobId": "job_456"
}
```

### Get Track Details

```http
GET /tracks/{trackId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "track_123",
  "title": "Amazing Song",
  "artist": {
    "id": "artist_123",
    "name": "John Doe",
    "verified": true
  },
  "album": {
    "id": "album_123",
    "name": "First Album",
    "coverImage": "https://cdn.not-a-label.art/covers/album_123.jpg"
  },
  "genre": "Pop",
  "duration": 180.5,
  "plays": 15420,
  "likes": 892,
  "tags": ["pop", "upbeat"],
  "streamUrl": "https://stream.not-a-label.art/track_123",
  "isProtected": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T12:45:00Z"
}
```

### List User Tracks

```http
GET /tracks?page=1&limit=20&status=published
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (max: 100, default: 20)
- `status` (optional): Filter by status (`draft`, `processing`, `published`)
- `genre` (optional): Filter by genre
- `search` (optional): Search in title and artist name

### Update Track

```http
PATCH /tracks/{trackId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Updated Title",
  "description": "New description",
  "tags": ["new", "tags"]
}
```

### Delete Track

```http
DELETE /tracks/{trackId}
Authorization: Bearer {token}
```

## Analytics API

### Get Track Analytics

```http
GET /analytics/tracks/{trackId}?period=30d
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: Time period (`7d`, `30d`, `90d`, `1y`)
- `granularity`: Data granularity (`hour`, `day`, `week`, `month`)

**Response:**
```json
{
  "trackId": "track_123",
  "period": "30d",
  "metrics": {
    "plays": 15420,
    "uniqueListeners": 8934,
    "completionRate": 0.78,
    "likes": 892,
    "shares": 156,
    "comments": 89
  },
  "demographics": {
    "countries": [
      {"country": "US", "plays": 8500},
      {"country": "UK", "plays": 2100}
    ],
    "ageGroups": [
      {"range": "18-24", "percentage": 45},
      {"range": "25-34", "percentage": 35}
    ]
  },
  "timeline": [
    {"date": "2024-01-01", "plays": 450, "likes": 23},
    {"date": "2024-01-02", "plays": 523, "likes": 31}
  ]
}
```

### Get Revenue Analytics

```http
GET /analytics/revenue?period=30d
Authorization: Bearer {token}
```

**Response:**
```json
{
  "period": "30d",
  "totalRevenue": 1245.67,
  "platformFee": 62.28,
  "netRevenue": 1183.39,
  "streams": 45230,
  "averageRPM": 0.0275,
  "breakdown": {
    "streaming": 856.34,
    "downloads": 234.12,
    "merchandise": 155.21
  },
  "platforms": [
    {"name": "Spotify", "revenue": 456.78, "streams": 18500},
    {"name": "Apple Music", "revenue": 234.56, "streams": 12300}
  ]
}
```

## Recommendations API

### Get Personalized Recommendations

```http
GET /recommendations?limit=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "forYou": ["track_456", "track_789"],
  "trending": ["track_101", "track_202"],
  "newReleases": ["track_303", "track_404"],
  "basedOnListening": ["track_505", "track_606"]
}
```

### Generate AI Playlist

```http
POST /recommendations/playlist
Content-Type: application/json
Authorization: Bearer {token}

{
  "prompt": "Upbeat songs for a morning workout",
  "trackCount": 20,
  "genres": ["pop", "electronic"]
}
```

**Response:**
```json
{
  "name": "Morning Workout Energy",
  "description": "High-energy tracks to power your morning routine",
  "tracks": ["track_123", "track_456", "track_789"],
  "totalDuration": 3600
}
```

## Collaboration API

### List Collaborations

```http
GET /collaborations?type=feature&status=open
Authorization: Bearer {token}
```

**Query Parameters:**
- `type`: Collaboration type (`feature`, `production`, `writing`, `remix`)
- `status`: Status (`open`, `in_progress`, `completed`)
- `genre`: Filter by genre
- `budget_min`: Minimum budget
- `budget_max`: Maximum budget

### Create Collaboration

```http
POST /collaborations
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Looking for vocalist",
  "description": "Need a female vocalist for R&B track",
  "type": "feature",
  "genre": "R&B",
  "budget": 500,
  "deadline": "2024-02-15T00:00:00Z",
  "requirements": ["female voice", "R&B experience"]
}
```

### Apply to Collaboration

```http
POST /collaborations/{collaborationId}/apply
Content-Type: application/json
Authorization: Bearer {token}

{
  "message": "I'd love to work on this track with you",
  "portfolio": ["track_123", "track_456"],
  "rate": 400
}
```

## Distribution API

### Submit for Distribution

```http
POST /distribution/submit
Content-Type: application/json
Authorization: Bearer {token}

{
  "trackIds": ["track_123", "track_456"],
  "platforms": ["spotify", "apple-music", "youtube-music"],
  "releaseDate": "2024-02-01T00:00:00Z",
  "metadata": {
    "isrc": "USSM12345678",
    "explicit": false,
    "copyrightOwner": "Artist Name"
  }
}
```

### Get Distribution Status

```http
GET /distribution/{submissionId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "dist_123",
  "status": "processing",
  "tracks": ["track_123", "track_456"],
  "platforms": {
    "spotify": {
      "status": "approved",
      "url": "https://open.spotify.com/track/..."
    },
    "apple-music": {
      "status": "pending",
      "estimatedLiveDate": "2024-02-01T00:00:00Z"
    }
  },
  "submittedAt": "2024-01-15T10:00:00Z"
}
```

## Subscription API

### Get Subscription Status

```http
GET /subscription
Authorization: Bearer {token}
```

**Response:**
```json
{
  "planId": "artist",
  "status": "active",
  "currentPeriodEnd": "2024-02-15T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "usage": {
    "tracksUploaded": 12,
    "tracksLimit": -1,
    "storageUsed": 2147483648,
    "storageLimit": 10737418240
  }
}
```

### Create Checkout Session

```http
POST /subscription/checkout
Content-Type: application/json
Authorization: Bearer {token}

{
  "planId": "pro",
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

## Webhooks

You can configure webhooks to receive real-time notifications about events in your account.

### Events

- `track.uploaded` - Track successfully uploaded
- `track.processed` - Track processing completed
- `track.distributed` - Track distributed to platforms
- `subscription.updated` - Subscription status changed
- `payment.succeeded` - Payment processed successfully
- `collaboration.created` - New collaboration request

### Webhook Payload

```json
{
  "id": "evt_123",
  "type": "track.uploaded",
  "data": {
    "trackId": "track_123",
    "userId": "user_456",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Error Handling

The API uses conventional HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

Error responses include details:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is missing required parameters",
    "details": {
      "field": "title",
      "reason": "This field is required"
    }
  }
}
```

## SDKs

Official SDKs are available for popular languages:

### JavaScript/Node.js

```bash
npm install @not-a-label/sdk
```

```javascript
import { NotALabelClient } from '@not-a-label/sdk';

const client = new NotALabelClient({
  apiKey: 'your_api_key',
  environment: 'production' // or 'sandbox'
});

// Upload a track
const track = await client.tracks.upload({
  file: audioFile,
  title: 'My Song',
  artist: 'Artist Name'
});
```

### Python

```bash
pip install not-a-label-sdk
```

```python
from not_a_label import Client

client = Client(api_key='your_api_key')

# Get analytics
analytics = client.analytics.get_track_analytics('track_123', period='30d')
```

## Support

- **Documentation**: https://docs.not-a-label.art
- **API Status**: https://status.not-a-label.art
- **Support**: support@not-a-label.art
- **Discord**: https://discord.gg/not-a-label