const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { Redis } = require('@upstash/redis');

// Initialize Redis client
let redis;
try {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('Missing Redis environment variables');
    throw new Error('Redis configuration missing');
  }
  
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} catch (error) {
  console.error('Redis initialization failed:', error);
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
const COOKIE_NAME = 'promptnotes_session';

// Helper functions
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const getUserIdFromRequest = (event) => {
  try {
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies[COOKIE_NAME];
    
    if (!token) {
      return null;
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return null;
    }
    
    return decoded.userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
    };
  }

  try {
    const userId = getUserIdFromRequest(event);
    
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Not authenticated',
        }),
      };
    }

    // Get all note IDs for the user
    const noteIds = await redis.smembers(`notes:user:${userId}`);
    
    if (!noteIds || noteIds.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No notes to migrate',
          updated: 0,
        }),
      };
    }

    // Get all notes
    const notePromises = noteIds.map((noteId) => redis.get(`notes:${noteId}`));
    const notes = await Promise.all(notePromises);
    
    // Filter out null values
    const validNotes = notes.filter(Boolean);
    
    let updatedCount = 0;

    // Process each note
    for (const note of validNotes) {
      let needsUpdate = false;
      
      // If note doesn't have parentId but also doesn't have threadId set to its own id
      if (!note.parentId && note.threadId !== note.id) {
        note.threadId = note.id;
        needsUpdate = true;
      }
      
      // If note has parentId but no threadId, find the root note
      if (note.parentId && !note.threadId) {
        // Find the root note
        let rootNote = await redis.get(`notes:${note.parentId}`);
        if (rootNote) {
          // If the parent also has a threadId, use that, otherwise use parentId
          note.threadId = rootNote.threadId || note.parentId;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        // Update the note in Redis
        await redis.set(`notes:${note.id}`, note);
        
        // If this is a subnote, make sure it's in the thread set
        if (note.parentId && note.threadId) {
          await redis.sadd(`notes:thread:${note.threadId}`, note.id);
        }
        
        updatedCount++;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Migration completed. Updated ${updatedCount} notes.`,
        updated: updatedCount,
        total: validNotes.length,
      }),
    };
  } catch (error) {
    console.error('Migration error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred during migration',
      }),
    };
  }
};
