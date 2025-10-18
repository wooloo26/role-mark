# Role Mark

A comprehensive full-stack web application for managing characters, resources, and wiki content with powerful tagging and organization features.

## ✨ Features

- 🎭 **Character Database**: Manage character profiles with avatars, portraits, and detailed information
- 📁 **Resource Library**: Organize images, videos, audio, and other media files
- 📚 **Wiki System**: Create and manage Markdown-based wiki pages with version history
- 🏷️ **Tagging System**: Powerful organization with static and dynamic tags
- 🔐 **Authentication**: Secure login and registration system
- 🎨 **Theme System**: Light/dark mode with customizable appearance
- 🔍 **Advanced Search**: Full-text search with filtering capabilities
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

| Layer              | Technology              | Description                         |
| ------------------ | ----------------------- | ----------------------------------- |
| **Frontend**       | Next.js 15 (App Router) | React framework with SSR support    |
| **Backend API**    | tRPC                    | Type-safe end-to-end APIs           |
| **Database**       | PostgreSQL              | Relational database with Prisma ORM |
| **UI Components**  | shadcn/ui + magicui     | Radix UI-based component library    |
| **Styling**        | Tailwind CSS            | Utility-first CSS framework         |
| **Authentication** | NextAuth.js             | Authentication for Next.js          |
| **Type Safety**    | TypeScript              | Full type safety across the stack   |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd role-mark

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secrets

# Set up database
pnpm db:push
pnpm db:seed

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rolemark"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"
```

## 📚 Documentation

- [Architecture](./architecture.md) - System architecture and data models
- [Next.js Implementation](./docs/NEXTJS_IMPLEMENTATION.md) - Detailed Next.js implementation guide

## 🧪 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database with sample data

# Code Quality
pnpm lint             # Run Biome linter
pnpm format           # Format code with Biome
```

## 📁 Project Structure

```
role-mark/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── characters/        # Character pages
│   ├── resources/         # Resource pages
│   ├── wiki/              # Wiki pages
│   ├── login/             # Authentication
│   ├── settings/          # User settings
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── theme/            # Theme system
│   ├── providers/        # React providers
│   └── ui/               # UI components (shadcn/ui)
├── lib/                   # Utility libraries
│   ├── trpc/             # tRPC configuration
│   └── auth.ts           # Authentication config
├── server/                # Server-side code
│   ├── routers/          # tRPC routers
│   └── trpc.ts           # tRPC setup
├── prisma/                # Database schema and migrations
└── types/                 # TypeScript type definitions
```

## 🎯 Key Features Explained

### Character Management

- Create, read, update, and delete character entries
- Upload avatars and portrait images
- Static tags (height, weight, birthday) for filtering and statistics
- Dynamic tags (keywords) for flexible categorization
- Character relationships (siblings, rivals, etc.)

### Resource Library

- Support for images, videos, audio, and other file types
- Many-to-many associations with characters
- Tag-based indexing for fast retrieval
- Search and filter by tags, characters, and file type

### Wiki System

- Markdown-based content with rich text support
- Version history tracking
- Many-to-many associations with characters
- AI-assisted editing capabilities (planned)

### Authentication & Authorization

- Secure login and registration
- Session management with NextAuth.js
- Protected routes and API endpoints
- NSFW content filtering based on user preferences

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based session management
- CSRF protection
- SQL injection prevention via Prisma
- XSS protection with React

## 🎨 Customization

### Theme System

- Light and dark mode support
- System theme detection
- Persistent theme preferences
- Component-level styling customization

### UI Components

All UI components are customizable through:

- Tailwind CSS classes
- CSS variables for colors
- shadcn/ui component variants

## 🤝 Contributing

Contributions are welcome! Please read the architecture document before making significant changes.

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [tRPC](https://trpc.io/) - Type-safe APIs
- [Prisma](https://www.prisma.io/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
