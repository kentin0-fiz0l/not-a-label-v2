# Not a Label V2 🎵

A modern platform empowering independent musicians with AI-powered tools, analytics, and distribution.

🌐 **Live at**: [https://www.not-a-label.art](https://www.not-a-label.art)

## ✨ Features

- **AI-Powered Career Assistant** - Get personalized guidance and strategies
- **Music Distribution** - Distribute to 150+ platforms with one click  
- **Advanced Analytics** - Real-time insights into your audience and performance
- **Content Generation** - AI-generated bios, press releases, and social posts
- **Revenue Tracking** - Monitor earnings across all platforms
- **Community Features** - Connect with other independent artists

## 🏗️ Architecture

Built with modern technologies:
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js microservices with Express
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 & Anthropic Claude integration
- **Infrastructure**: Docker, Nginx, Redis

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

### Production Deployment

See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for detailed instructions.

Quick deploy:
```bash
./deploy-to-server.sh
```

## 📦 Project Structure

```
not-a-label-v2/
├── apps/
│   └── web/                 # Next.js frontend
├── services/
│   ├── api-gateway/         # API routing & auth
│   ├── user-service/        # User management
│   ├── ai-service/          # AI features
│   └── ...                  # Other microservices
├── packages/
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Common utilities
└── infrastructure/          # Docker & deployment configs
```

## 🔧 Available Scripts

- `npm run dev` - Start all services in development
- `npm run build` - Build all packages and services
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run migrate` - Run database migrations
- `npm run deploy` - Deploy to production

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- [Documentation](https://docs.not-a-label.art)
- [API Reference](https://api.not-a-label.art/docs)
- [Support](mailto:support@not-a-label.art)

## 🙏 Acknowledgments

Built with ❤️ for independent musicians worldwide.