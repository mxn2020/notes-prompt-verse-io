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

// Get all note types for a user
const getNotesTypesHandler = async (event) => {
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
    
    // Get all note type IDs for the user
    const noteTypeIds = await redis.smembers(`note-types:user:${userId}`);
    
    if (!noteTypeIds || noteTypeIds.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      };
    }
    
    // Get all note types
    const noteTypePromises = noteTypeIds.map((id) => redis.get(`note-types:${id}`));
    const noteTypes = await Promise.all(noteTypePromises);
    
    // Filter out null values
    const validNoteTypes = noteTypes.filter(Boolean);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: validNoteTypes,
      }),
    };
  } catch (error) {
    console.error('Get note types error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred while fetching note types',
      }),
    };
  }
};

// Create a new note type
const createNoteTypeHandler = async (event) => {
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
    
    const noteTypeData = JSON.parse(event.body);
    
    // Validate required fields
    if (!noteTypeData.name || !noteTypeData.fields || !Array.isArray(noteTypeData.fields)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Name and fields are required',
        }),
      };
    }
    
    // Add metadata
    const now = new Date().toISOString();
    const noteType = {
      ...noteTypeData,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    
    // Save the note type
    await redis.set(`note-types:${noteType.id}`, noteType);
    
    // Add to user's note types set
    await redis.sadd(`note-types:user:${userId}`, noteType.id);
    
    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        data: noteType,
      }),
    };
  } catch (error) {
    console.error('Create note type error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred while creating the note type',
      }),
    };
  }
};

// Delete a note type
const deleteNoteTypeHandler = async (event) => {
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
    
    const noteTypeId = event.path.split('/').pop();
    
    if (!noteTypeId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Note type ID is required',
        }),
      };
    }
    
    // Get the note type
    const noteType = await redis.get(`note-types:${noteTypeId}`);
    
    if (!noteType) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Note type not found',
        }),
      };
    }
    
    // Check if the note type belongs to the user
    if (noteType.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          error: 'You do not have permission to delete this note type',
        }),
      };
    }
    
    // Delete the note type
    await redis.del(`note-types:${noteTypeId}`);
    
    // Remove from user's note types set
    await redis.srem(`note-types:user:${userId}`, noteTypeId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Note type deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Delete note type error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred while deleting the note type',
      }),
    };
  }
};

// Main handler
exports.handler = async (event) => {
  // Early health check for configuration
  if (!redis) {
    console.error('Redis not initialized - check environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Service configuration error - Redis not available',
      }),
    };
  }

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
    if (event.httpMethod === 'GET') {
      return addCorsHeaders(await getNotesTypesHandler(event));
    }
    
    if (event.httpMethod === 'POST') {
      return addCorsHeaders(await createNoteTypeHandler(event));
    }
    
    if (event.httpMethod === 'DELETE') {
      return addCorsHeaders(await deleteNoteTypeHandler(event));
    }
    
    return addCorsHeaders({
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        error: 'Route not found',
      }),
    });
  } catch (error) {
    console.error('Note types handler error:', error);
    
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An unexpected error occurred',
      }),
    });
  }
};