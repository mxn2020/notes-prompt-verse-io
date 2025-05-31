const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { Redis } = require('@upstash/redis');
const { nanoid } = require('nanoid');
const { uploadImage, deleteImage } = require('./cloudinary');

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://example-redis-url',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'example-token',
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
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

// Handle image upload
const handleImageUpload = async (event) => {
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

    const formData = await event.body;
    const result = await uploadImage(formData, `notes/${userId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to upload image',
      }),
    };
  }
};

// Handle image deletion
const handleImageDelete = async (event) => {
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

    const { publicId } = JSON.parse(event.body);
    await deleteImage(publicId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Image deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Image delete error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to delete image',
      }),
    };
  }
};

// Get all notes for a user
const getNotesHandler = async (event) => {
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
          data: [],
        }),
      };
    }
    
    // Get all notes
    const notePromises = noteIds.map((noteId) => redis.get(`notes:${noteId}`));
    const notes = await Promise.all(notePromises);
    
    // Filter out null values (in case a note was deleted)
    const validNotes = notes.filter(Boolean);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: validNotes,
      }),
    };
  } catch (error) {
    console.error('Get notes error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred while fetching notes',
      }),
    };
  }
};

// Get a single note by ID
const getNoteHandler = async (event) => {
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
    
    const noteId = event.path.split('/').pop();
    
    if (!noteId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Note ID is required',
        }),
      };
    }
    
    // Get the note
    const note = await redis.get(`notes:${noteId}`);
    
    if (!note) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Note not found',
        }),
      };
    }
    
    // Check if the note belongs to the user
    if (note.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          error: 'You do not have permission to access this note',
        }),
      };
    }
    
    // If this is a thread, get all replies
    let thread = null;
    
    if (note.threadId === note.id) {
      // This is a root note of a thread
      const replyIds = await redis.smembers(`notes:thread:${note.id}`);
      
      if (replyIds && replyIds.length > 0) {
        const replyPromises = replyIds.map((replyId) => redis.get(`notes:${replyId}`));
        const replies = await Promise.all(replyPromises);
        
        // Filter out null values
        const validReplies = replies.filter(Boolean);
        
        thread = {
          id: note.id,
          rootNote: note,
          replies: validReplies,
        };
      }
    } else if (note.threadId) {
      // This is a reply in a thread, get the thread
      const rootNote = await redis.get(`notes:${note.threadId}`);
      
      if (rootNote) {
        const replyIds = await redis.smembers(`notes:thread:${note.threadId}`);
        
        if (replyIds && replyIds.length > 0) {
          const replyPromises = replyIds.map((replyId) => redis.get(`notes:${replyId}`));
          const replies = await Promise.all(replyPromises);
          
          // Filter out null values
          const validReplies = replies.filter(Boolean);
          
          thread = {
            id: rootNote.id,
            rootNote,
            replies: validReplies,
          };
        }
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: thread || { id: note.id, rootNote: note, replies: [] },
      }),
    };
  } catch (error) {
    console.error('Get note error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred while fetching the note',
      }),
    };
  }
};

// Create a new note
const createNoteHandler = async (event) => {
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
    
    const { title, content, type, fields, tags, category, color, parentId } = JSON.parse(event.body);
    
    if (!title || !content || !type) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Title, content, and type are required',
        }),
      };
    }
    
    const noteId = nanoid();
    const now = new Date().toISOString();
    
    // If this is a reply to a parent note, get the parent note
    let threadId = null;
    
    if (parentId) {
      const parentNote = await redis.get(`notes:${parentId}`);
      
      if (!parentNote) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            success: false,
            error: 'Parent note not found',
          }),
        };
      }
      
      // If parent has a threadId, use that, otherwise use parentId as threadId
      threadId = parentNote.threadId || parentId;
    }
    
    const noteData = {
      id: noteId,
      userId,
      title,
      content,
      type,
      fields: fields || {},
      parentId,
      threadId,
      category: category || null,
      tags: tags || [],
      color: color || null,
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    
    // Save the note
    await redis.set(`notes:${noteId}`, noteData);
    
    // Add to user's notes set
    await redis.sadd(`notes:user:${userId}`, noteId);
    
    // If this is a reply, add to thread's replies set
    if (threadId) {
      await redis.sadd(`notes:thread:${threadId}`, noteId);
    }
    
    // If this has tags, add to tag sets
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await redis.sadd(`tags:user:${userId}`, tag);
        await redis.sadd(`notes:tag:${userId}:${tag}`, noteId);
      }
    }
    
    // If this has a category, add to category set
    if (category) {
      await redis.sadd(`notes:category:${userId}:${category}`, noteId);
    }
    
    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        data: noteData,
      }),
    };
  } catch (error) {
    console.error('Create note error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred while creating the note',
      }),
    };
  }
};

// Update a note
const updateNoteHandler = async (event) => {
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
    
    const noteId = event.path.split('/').pop();
    
    if (!noteId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Note ID is required',
        }),
      };
    }
    
    // Get the existing note
    const existingNote = await redis.get(`notes:${noteId}`);
    
    if (!existingNote) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Note not found',
        }),
      };
    }
    
    // Check if the note belongs to the user
    if (existingNote.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          error: 'You do not have permission to update this note',
        }),
      };
    }
    
    const updates = JSON.parse(event.body);
    
    // Prevent updating certain fields
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;
    
    // If tags are updated, update tag sets
    if (updates.tags && JSON.stringify(updates.tags) !== JSON.stringify(existingNote.tags)) {
      // Remove from old tag sets
      if (existingNote.tags && existingNote.tags.length > 0) {
        for (const tag of existingNote.tags) {
          await redis.srem(`notes:tag:${userId}:${tag}`, noteId);
        }
      }
      
      // Add to new tag sets
      if (updates.tags && updates.tags.length > 0) {
        for (const tag of updates.tags) {
          await redis.sadd(`tags:user:${userId}`, tag);
          await redis.sadd(`notes:tag:${userId}:${tag}`, noteId);
        }
      }
    }
    
    // If category is updated, update category sets
    if (updates.category !== undefined && updates.category !== existingNote.category) {
      // Remove from old category set
      if (existingNote.category) {
        await redis.srem(`notes:category:${userId}:${existingNote.category}`, noteId);
      }
      
      // Add to new category set
      if (updates.category) {
        await redis.sadd(`notes:category:${userId}:${updates.category}`, noteId);
      }
    }
    
    const updatedNote = {
      ...existingNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // Save the updated note
    await redis.set(`notes:${noteId}`, updatedNote);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: updatedNote,
      }),
    };
  } catch (error) {
    console.error('Update note error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred while updating the note',
      }),
    };
  }
};

// Delete a note
const deleteNoteHandler = async (event) => {
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
    
    const noteId = event.path.split('/').pop();
    
    if (!noteId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Note ID is required',
        }),
      };
    }
    
    // Get the note
    const note = await redis.get(`notes:${noteId}`);
    
    if (!note) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Note not found',
        }),
      };
    }
    
    // Check if the note belongs to the user
    if (note.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          error: 'You do not have permission to delete this note',
        }),
      };
    }
    
    // If this is a thread root, delete all replies
    if (note.threadId === note.id) {
      const replyIds = await redis.smembers(`notes:thread:${note.id}`);
      
      if (replyIds && replyIds.length > 0) {
        for (const replyId of replyIds) {
          const reply = await redis.get(`notes:${replyId}`);
          
          if (reply) {
            // Remove from tag sets
            if (reply.tags && reply.tags.length > 0) {
              for (const tag of reply.tags) {
                await redis.srem(`notes:tag:${userId}:${tag}`, replyId);
              }
            }
            
            // Remove from category set
            if (reply.category) {
              await redis.srem(`notes:category:${userId}:${reply.category}`, replyId);
            }
            
            // Remove from user's notes set
            await redis.srem(`notes:user:${userId}`, replyId);
            
            // Delete the reply
            await redis.del(`notes:${replyId}`);
          }
        }
        
        // Delete the thread set
        await redis.del(`notes:thread:${note.id}`);
      }
    } else if (note.threadId) {
      // This is a reply, remove from thread set
      await redis.srem(`notes:thread:${note.threadId}`, noteId);
    }
    
    // Remove from tag sets
    if (note.tags && note.tags.length > 0) {
      for (const tag of note.tags) {
        await redis.srem(`notes:tag:${userId}:${tag}`, noteId);
      }
    }
    
    // Remove from category set
    if (note.category) {
      await redis.srem(`notes:category:${userId}:${note.category}`, noteId);
    }
    
    // Remove from user's notes set
    await redis.srem(`notes:user:${userId}`, noteId);
    
    // Delete the note
    await redis.del(`notes:${noteId}`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Note deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Delete note error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred while deleting the note',
      }),
    };
  }
};

// Main handler
exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || 'http://localhost:8888',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }
  
  // Add CORS headers to all responses
  const addCorsHeaders = (response) => {
    return {
      ...response,
      headers: {
        ...response.headers,
        ...headers,
      },
    };
  };
  
  try {
    // Route handling
    const path = event.path.replace('/notes', '').replace('/.netlify/functions/notes', '');
    
    // Image upload/delete routes
    if (path === '/upload' && event.httpMethod === 'POST') {
      return addCorsHeaders(await handleImageUpload(event));
    }

    if (path === '/image' && event.httpMethod === 'DELETE') {
      return addCorsHeaders(await handleImageDelete(event));
    }

    if (event.httpMethod === 'GET' && (path === '' || path === '/')) {
      return addCorsHeaders(await getNotesHandler(event));
    }
    
    if (event.httpMethod === 'GET' && path.match(/^\/[a-zA-Z0-9_-]+$/)) {
      return addCorsHeaders(await getNoteHandler(event));
    }
    
    if (event.httpMethod === 'POST' && (path === '' || path === '/')) {
      return addCorsHeaders(await createNoteHandler(event));
    }
    
    if (event.httpMethod === 'PUT' && path.match(/^\/[a-zA-Z0-9_-]+$/)) {
      return addCorsHeaders(await updateNoteHandler(event));
    }
    
    if (event.httpMethod === 'DELETE' && path.match(/^\/[a-zA-Z0-9_-]+$/)) {
      return addCorsHeaders(await deleteNoteHandler(event));
    }
    
    return addCorsHeaders({
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        error: 'Route not found',
      }),
    });
  } catch (error) {
    console.error('Notes handler error:', error);
    
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An unexpected error occurred',
      }),
    });
  }
};