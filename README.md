# Not a Label 🎵

The all-in-one platform for independent artists. Distribute your music, grow your fanbase, and build a sustainable career with AI-powered insights.

🌐 **Live Demo**: [https://www.not-a-label.art](https://www.not-a-label.art)
📦 **Repository**: [https://github.com/kentin0-fiz0l/not-a-label-v2](https://github.com/kentin0-fiz0l/not-a-label-v2)

## ✨ Key Features

### 🎵 Music Management
- **Smart Distribution** - One-click distribution to 150+ streaming platforms
- **Upload & Organize** - Drag-and-drop uploads with automatic metadata extraction
- **Rights Protection** - Keep 100% of your rights with transparent revenue sharing

### 📊 Analytics & Insights
- **Real-time Analytics** - Track streams, revenue, and audience demographics
- **Performance Metrics** - Detailed insights on track performance and trends
- **Revenue Tracking** - Monitor earnings across all platforms in one dashboard

### 🤖 AI-Powered Tools
- **Career Assistant** - Personalized guidance based on your music and goals
- **Content Generation** - AI-generated bios, press releases, and social posts
- **Market Analysis** - Genre trends and strategic recommendations

### 👥 Community & Collaboration
- **Artist Network** - Connect with other independent musicians
- **Collaboration Tools** - Find producers, vocalists, and collaborators
- **Event Management** - Organize and promote live performances

### 💼 Professional Tools
- **Multi-step Onboarding** - Guided setup for new artists
- **Custom Artist Pages** - Professional presence for your music
- **Notification System** - Real-time updates on your career milestones

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.2 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: Zustand
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend
- **Architecture**: Microservices with API Gateway pattern
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: NextAuth.js with JWT

### AI Integration
- **OpenAI GPT-4**: Content generation and analysis
- **Anthropic Claude**: Career guidance and insights

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Process Management**: PM2
- **Reverse Proxy**: Nginx
- **Deployment**: DigitalOcean / Vercel

## 🚀 Quick Start

### Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/not-a-label-v2.git
cd not-a-label-v2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start development servers:
```bash
npm run dev
```

Visit http://localhost:3000

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to DigitalOcean

```bash
# SSH into your server
ssh root@your-server-ip

# Run deployment script
curl -sSL https://raw.githubusercontent.com/kentin0-fiz0l/not-a-label-v2/main/deploy.sh | bash
```

## 📦 Project Structure

```
not-a-label-v2/
├── apps/
│   └── web/                 # Next.js frontend application
│       ├── src/
│       │   ├── app/        # App router pages
│       │   ├── components/ # React components
│       │   ├── hooks/      # Custom React hooks
│       │   └── lib/        # Utilities and helpers
│       └── public/         # Static assets
├── services/
│   ├── api-gateway/        # API routing & authentication
│   ├── user-service/       # User management
│   ├── music-service/      # Music uploads & metadata
│   ├── ai-service/         # AI integrations
│   ├── analytics-service/  # Analytics processing
│   └── streaming-service/  # Real-time updates
├── packages/
│   ├── types/             # Shared TypeScript definitions
│   └── utils/             # Common utilities
├── infrastructure/
│   ├── docker/            # Docker configurations
│   └── nginx/             # Nginx configs
└── docs/                  # Documentation
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start all services in development mode
- `npm run dev:web` - Start only the frontend
- `npm run dev:services` - Start backend services

### Build & Deploy
- `npm run build` - Build all packages for production
- `npm run start` - Start production servers
- `npm run deploy` - Deploy to production

### Code Quality
- `npm run lint` - Run ESLint on all packages
- `npm run type-check` - TypeScript type checking
- `npm run test` - Run test suites
- `npm run test:e2e` - Run end-to-end tests

### Database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database

## 🎯 Roadmap

- [x] Core platform development
- [x] AI integration
- [x] Analytics dashboard
- [x] Distribution system
- [x] Community features
- [ ] Mobile app (React Native)
- [ ] Advanced collaboration tools
- [ ] Blockchain-based rights management
- [ ] Live streaming integration

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **Website**: [https://www.not-a-label.art](https://www.not-a-label.art)
- **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **GitHub**: [https://github.com/kentin0-fiz0l/not-a-label-v2](https://github.com/kentin0-fiz0l/not-a-label-v2)

## 🙏 Acknowledgments

- Built with ❤️ for independent musicians worldwide
- Powered by cutting-edge AI technology
- Inspired by the DIY music community

---

**Not a Label** - Your Music. Your Career. Your Way.