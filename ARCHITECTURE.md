# Not a Label V2 - Architecture Documentation

## Overview

Not a Label V2 is built as a modern, scalable platform using microservices architecture. The platform empowers independent musicians with AI-powered tools, analytics, and distribution capabilities.

## Technology Stack

### Frontend
- **Framework**: Next.js 15.3.2 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion

### Backend
- **Architecture**: Microservices with API Gateway pattern
- **Language**: TypeScript/Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT tokens
- **Message Queue**: Redis Pub/Sub (future: RabbitMQ)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose (production: Kubernetes)
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (future)
- **Logging**: Winston with centralized logging

## Architecture Patterns

### 1. Monorepo Structure
```
not-a-label-v2/
├── apps/           # Frontend applications
├── services/       # Backend microservices
├── packages/       # Shared packages
└── infrastructure/ # Deployment configs
```

### 2. Microservices

#### API Gateway (Port 3001)
- Routes requests to appropriate services
- Handles authentication and rate limiting
- Service discovery and health checks

#### User Service (Port 3002)
- User registration and authentication
- Profile management
- Session management

#### Music Service (Port 3003)
- Track upload and management
- Audio processing
- Metadata handling
- S3 integration

#### AI Service (Port 3004)
- Career guidance
- Content generation
- Music analysis
- Integration with OpenAI/Anthropic

#### Analytics Service (Port 3005)
- Real-time analytics
- Performance metrics
- Audience insights
- Revenue tracking

#### Distribution Service (Port 3006)
- Platform integrations
- Release management
- Status tracking

#### Notification Service (Port 3007)
- Real-time notifications
- Email notifications
- Push notifications

#### Payment Service (Port 3008)
- Stripe integration
- Revenue management
- Payout processing

### 3. Shared Packages

#### @not-a-label/types
- TypeScript type definitions
- Zod schemas for validation
- Shared interfaces

#### @not-a-label/utils
- Authentication utilities
- Validation helpers
- Logging
- Crypto utilities
- Date/time helpers

#### @not-a-label/ui (future)
- Shared React components
- Design system implementation

## Data Flow

1. **Client Request** → Nginx → API Gateway
2. **API Gateway** → Authentication → Rate Limiting → Service Routing
3. **Microservice** → Business Logic → Database/Cache → Response
4. **Response** → API Gateway → Client

## Security

### Authentication Flow
1. User logs in via User Service
2. JWT access token (1 day) + refresh token (30 days) issued
3. Tokens stored in httpOnly cookies
4. API Gateway validates tokens on each request

### Security Measures
- HTTPS everywhere
- Rate limiting per endpoint
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS prevention
- CORS configuration
- Security headers via Helmet

## Database Schema

### Core Tables
- **users**: User accounts
- **artist_profiles**: Artist information
- **tracks**: Music files and metadata
- **albums**: Album collections
- **analytics_events**: User interactions
- **distribution_jobs**: Platform distribution

## Deployment

### Development
```bash
npm run dev  # Starts all services in watch mode
```

### Production
```bash
docker-compose up -d  # Starts all services
```

### Environment Variables
- Database credentials
- JWT secrets
- API keys (OpenAI, Anthropic, AWS)
- Service URLs

## Scaling Considerations

### Horizontal Scaling
- Stateless services allow easy scaling
- Redis for session management
- Load balancing via Nginx

### Performance Optimizations
- Database indexing
- Redis caching
- CDN for static assets
- Image optimization
- Code splitting

### Future Enhancements
- Kubernetes deployment
- Service mesh (Istio)
- Event-driven architecture
- GraphQL federation
- Real-time collaboration
- Mobile applications