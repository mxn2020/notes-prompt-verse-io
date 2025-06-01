# PromptNotes - Daily Notes App

A comprehensive note-taking app built for tracking daily progress, meeting notes, ideas, and more. Perfect for content creators, developers, and anyone who wants to stay organized with their daily thoughts and progress.

## ✨ Features

- **Multiple Note Types**: Daily Progress, Meeting Notes, Bug Reports, Feature Ideas, Learning Logs, Code Snippets, and more
- **Custom Note Types**: Create your own note templates with custom fields
- **Note Threading**: Add sub notes and create threaded conversations
- **Organization**: Categories, tags, color coding, and powerful search
- **Authentication**: Secure user authentication with personal note spaces
- **Real-time Sync**: Automatic saving with timestamps

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Upstash Redis account (free tier available)

### One-Command Setup

```bash
# Clone and run the setup script
git clone <your-repo-url>
cd notes-prompt-verse-io
./setup.sh
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit with your actual credentials
   nano .env
   ```

3. **Get Upstash Redis Credentials**
   - Go to [console.upstash.com](https://console.upstash.com/)
   - Create a new Redis database (free tier available)
   - Copy the REST URL and Token to your `.env` file

4. **Start Development Server**
   ```bash
   # Start Vite development server
   npm run dev
   
   # In another terminal, start Netlify functions
   netlify dev
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:8888`

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | ✅ | - |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | ✅ | - |
| `JWT_SECRET` | Secret for JWT token signing | ✅ | `dev-secret` |
| `NODE_ENV` | Environment mode | ❌ | `development` |
| `VITE_APP_URL` | Frontend application URL | ❌ | `http://localhost:8888` |
| `CORS_ORIGINS` | Allowed CORS origins | ❌ | `localhost` |

### Required Setup

1. **Upstash Redis**: Get free credentials at [console.upstash.com](https://console.upstash.com/)
2. **JWT Secret**: Generate with `openssl rand -base64 32` for production

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── layout/         # Layout components (Sidebar, Navbar)
│   ├── notes/          # Note-related components
│   └── ui/             # shadcn/ui components
├── pages/              # Route pages
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions

netlify/
└── functions/          # Serverless API endpoints
    ├── auth/           # Authentication endpoints
    └── notes/          # Notes CRUD endpoints
```

## 🎯 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Start Netlify functions locally
netlify dev

# Build for production
npm run build

# Run linting
npm run lint
```

### API Endpoints

- `POST /.netlify/functions/auth` - User authentication
- `GET /.netlify/functions/notes` - Get user notes
- `POST /.netlify/functions/notes` - Create new note
- `PUT /.netlify/functions/notes/:id` - Update note
- `DELETE /.netlify/functions/notes/:id` - Delete note

## 🏗️ Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Netlify Functions (Serverless)
- **Database**: Upstash Redis
- **Authentication**: JWT with HTTP-only cookies
- **Deployment**: Netlify

## 🔒 Security Features

- HTTP-only cookies for auth tokens
- CORS protection
- Rate limiting
- Input validation and sanitization
- Secure environment variable handling

## 📚 Usage

1. **Create Notes**: Choose from predefined note types or create custom ones
2. **Organize**: Use categories, tags, and colors to organize your notes
3. **Thread Conversations**: Add sub notes to create threaded discussions
4. **Search & Filter**: Find notes quickly with powerful search and filtering
5. **Daily Progress**: Track your daily progress with mood and energy tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

If you have any questions or run into issues:

1. Check the environment setup instructions above
2. Ensure your Upstash Redis credentials are correct
3. Verify all required environment variables are set
4. Check the browser console and server logs for error messages

---

**Built for the 2025 bolt.new hackathon** 🚀
