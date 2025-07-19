# Yadu Web Application

A comprehensive full-stack platform that serves as both a professional portfolio showcase and a complete business management system.

## 🚀 Features

- **Portfolio Showcase**: Dynamic portfolio with filtering and lightbox modals
- **Business Management**: Client and project management with Kanban boards
- **DNS Management**: Real-time DNS record management via Cloudflare API
- **AI-Powered Tools**: Content generation and automated workflows
- **Payment Processing**: Stripe integration for invoicing
- **Real-time Chat**: AI-powered chatbot for visitor support

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Email**: Resend
- **File Storage**: Google Drive API
- **CDN**: Cloudinary
- **AI/Automation**: n8n, Langflow

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yadu-web-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables in `.env.local`

4. **Database Setup**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Run database migrations
   pnpm db:migrate
   
   # Seed the database with sample data
   pnpm db:seed
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── layout/         # Layout components
├── lib/                # Utility functions and configurations
│   ├── db.ts           # Database connection
│   ├── utils.ts        # General utilities
│   ├── validations.ts  # Zod schemas
│   ├── constants.ts    # App constants
│   ├── env.ts          # Environment validation
│   └── api-utils.ts    # API helpers
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## 🔑 Environment Variables

Key environment variables needed:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/yadu_web_app"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Additional services (see .env.example for complete list)
```

## 🧪 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Prisma Studio

## 🏗 Development Workflow

1. **Database Changes**: Update `prisma/schema.prisma` → run `pnpm db:migrate`
2. **API Routes**: Add routes in `src/app/api/`
3. **Components**: Add reusable components in `src/components/`
4. **Types**: Update types in `src/types/`
5. **Validation**: Add schemas in `src/lib/validations.ts`

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📊 API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/portfolio` - List portfolio items
- `POST /api/ai/generate-content` - AI content generation
- `POST /api/chat` - Chatbot endpoint

## 🔒 Security Features

- Role-based access control (Admin/Client)
- API route rate limiting
- Input validation with Zod
- CSRF protection
- Secure headers configuration

## 📈 Performance Optimizations

- Image optimization with Cloudinary
- Lazy loading for portfolio gallery
- ISR (Incremental Static Regeneration)
- Bundle optimization
- Database query optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For support, email hello@yadukrishnan.dev or create an issue in the repository.