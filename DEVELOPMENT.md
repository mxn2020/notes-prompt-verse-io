# Getting Started with PromptNotes Development

This guide will help you set up your development environment quickly.

## 🚀 Quick Setup Guide

### Step 1: Get Upstash Redis (Free)

1. Go to [console.upstash.com](https://console.upstash.com/)
2. Sign up with GitHub or Google (it's free!)
3. Click "Create Database"
4. Choose:
   - **Type**: Redis
   - **Name**: `promptnotes-dev` (or any name you like)
   - **Region**: Choose the closest to you
   - **Plan**: Start with the free tier (30K commands/month)
5. After creation, go to the database details page
6. Copy the **REST URL** and **REST Token** from the "REST API" section

### Step 2: Configure Environment

1. Edit your `.env` file:
   ```bash
   nano .env
   ```

2. Replace the placeholder values:
   ```env
   UPSTASH_REDIS_REST_URL=https://your-actual-url-here.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-actual-token-here
   ```

3. Validate your configuration:
   ```bash
   ./validate-env.sh
   ```

### Step 3: Start Development

1. Install dependencies (if not already done):
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm run dev
   ```

3. In another terminal, start Netlify functions:
   ```bash
   netlify dev
   ```

4. Open your browser to `http://localhost:8888`

## 🔧 Development Workflow

### Available Commands

```bash
# Start Vite dev server (frontend only)
pnpm run dev

# Start Netlify dev server (includes functions)
netlify dev

# Build for production
pnpm run build

# Validate environment
./validate-env.sh

# Run full setup
./setup.sh
```

### Recommended Development Setup

1. **Terminal 1**: Run `netlify dev` (this starts both frontend and functions)
2. **Terminal 2**: Keep available for git commands and other tasks
3. **Browser**: Open `http://localhost:8888` (not the Vite port 5173)

## 📊 Redis Data Structure

Your notes app will store data in Redis with these key patterns:

```
users:{userId}                    # User profile data
notes:{userId}:list              # List of note IDs for user
notes:{userId}:{noteId}          # Individual note data
noteTypes:{userId}               # Custom note types for user
categories:{userId}              # User's categories
tags:{userId}                    # User's tags
sessions:{sessionId}             # User sessions
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 8888
   lsof -ti:8888 | xargs kill -9
   ```

2. **Redis connection failed**
   - Check your Upstash credentials
   - Ensure your Redis database is active
   - Verify the URL doesn't have extra spaces

3. **Environment variables not loading**
   ```bash
   # Check if .env file exists and has correct permissions
   ls -la .env
   cat .env | grep -v '#'
   ```
### Development Tips

- Use the browser dev tools to check for console errors
- Check the Netlify functions logs in the terminal
- Use `DEBUG=true` in your `.env` for more verbose logging
- The app uses HTTP-only cookies for authentication - check Application tab in dev tools

## 🎯 Next Steps

Once your environment is set up:

1. Create your first note at `/notes/new`
2. Try different note types (Daily Progress, Meeting Notes, etc.)
3. Test the authentication flow
4. Explore the note threading feature
5. Experiment with custom note types

## 📚 Code Structure

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Netlify Functions (serverless)
- **Database**: Upstash Redis
- **Auth**: JWT with HTTP-only cookies

Happy coding! 🚀
