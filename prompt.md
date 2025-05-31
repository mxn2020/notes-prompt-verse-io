I am participating in the 2025 boltdotnew hackathon and I want to win it!

I am building prompt-verse.io, the best prompt engineering and management tool of the world. I would like to post daily twitter/X, youtube updates about my progress, so I need a little note taking app to keep track of my daily notes so I can post a good update at the end of the day.

Please build me a comprehensive daily notes app with these requirements:

##Core Features:
- Clean, minimal UI that adapts based on note complexity
- Authentication so multiple users can use the app
- Each user should only see their own notes
- Notes automatically saved with timestamps

##Note Types System:
- Basic note type: Simple textarea field
- 8-10 predefined system note types like:
   - Daily Progress (textarea + mood selector + energy level)
   - Meeting Notes (title + attendees + action items + follow-ups)
   - Bug Report (title + severity + steps to reproduce + solution)
   - Feature Idea (title + description + priority + implementation notes)
   - Learning Log (topic + key takeaways + resources + next steps)
   - Code Snippet (language selector + code block + description + tags)
   - Task Planning (task list + deadlines + assignees + status)
   - Reflection (prompt questions + responses + insights)
- Users can create custom note types by defining their own fields (text, textarea, dropdown, checkbox, date, number)
- Note type templates with drag-and-drop field builder

##Note Threads & Nesting:
- Each new note starts as a simple note based on its type
- Users can add nested/reply notes to any note, which converts it to a "note thread"
- Note threads get enhanced UI with threading visualization, collapse/expand, and reply chains
- Nested notes can have different types than their parent

##Organization Features:
- Categories for grouping note threads
- Tags system with autocomplete from user's existing tags
- Optional checkboxes for task-like notes
- Color coding system - users can assign colors to notes/threads
- Search and filter by type, category, tags, date range, color

##Tech Stack:
- Vite + React for frontend
- Netlify Functions (serverless) for backend API endpoints
- Upstash Redis for storing notes, note types, user preferences
- Netlify Identity or Auth0 for Google/GitHub authentication
- Tailwind CSS for responsive styling
- Rich text editor for textarea fields
- Single repo deployment on Netlify with automatic builds

##Project Structure:
- Frontend in `/src` folder with Vite build
- Backend API routes in `/netlify/functions` folder
- Environment variables for Upstash Redis and auth configuration
- Deploy the entire project as one Netlify site

Store data in Redis with keys like "notes:userId:noteId", "noteTypes:userId", "categories:userId", "tags:userId". Keep the UI intuitive - start simple and progressively enhance as users add complexity!