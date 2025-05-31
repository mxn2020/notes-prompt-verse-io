const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Redis } = require('@upstash/redis');

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://example-redis-url',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'example-token',
});

// JWT secret (in production, use env variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '7d';
const COOKIE_NAME = 'promptnotes_session';
const SALT_ROUNDS = 12; // Number of salt rounds for bcrypt

// Password hashing helpers
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Check if password is already hashed (bcrypt hashes start with $2b$)
const isPasswordHashed = (password) => {
  return password && password.startsWith('$2b$');
};

// Helper functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

const setCookie = (token) => {
  return cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
};

const clearCookie = () => {
  return cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const getAuthUser = async (userId) => {
  try {
    const userKey = `user:${userId}`;
    const user = await redis.get(userKey);
    
    if (!user) {
      return null;
    }
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Route handlers
const registerHandler = async (event) => {
  try {
    const { email, password, name } = JSON.parse(event.body);
    
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Email, password and name are required',
        }),
      };
    }
    
    // Validate password strength
    if (password.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Password must be at least 6 characters long',
        }),
      };
    }
    
    // Check if user already exists
    const userKey = `user:email:${email}`;
    const existingUserId = await redis.get(userKey);
    
    if (existingUserId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'User with this email already exists',
        }),
      };
    }
    
    // Create new user
    const userId = Date.now().toString();
    
    // Hash the password before storing
    const hashedPassword = await hashPassword(password);
    
    const userData = {
      id: userId,
      email,
      name,
      password: hashedPassword, // Store hashed password
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store user data
    await redis.set(`user:${userId}`, userData);
    await redis.set(userKey, userId);
    
    // Create JWT token
    const token = generateToken(userId);
    
    // Set cookie
    const headers = {
      'Set-Cookie': setCookie(token),
    };
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = userData;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: userWithoutPassword,
      }),
    };
  } catch (error) {
    console.error('Register error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred during registration',
      }),
    };
  }
};

const loginHandler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);
    
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Email and password are required',
        }),
      };
    }
    
    // Find user by email
    const userKey = `user:email:${email}`;
    const userId = await redis.get(userKey);
    
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email or password',
        }),
      };
    }
    
    // Get user data
    const userData = await redis.get(`user:${userId}`);
    
    if (!userData) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email or password',
        }),
      };
    }
    
    let isValidPassword = false;
    
    // Check if password is already hashed or plaintext (for backward compatibility)
    if (isPasswordHashed(userData.password)) {
      // Password is hashed, use bcrypt to compare
      isValidPassword = await comparePassword(password, userData.password);
    } else {
      // Legacy plaintext password, compare directly and migrate to hashed
      if (userData.password === password) {
        isValidPassword = true;
        
        // Migrate to hashed password
        const hashedPassword = await hashPassword(password);
        const updatedUser = {
          ...userData,
          password: hashedPassword,
          updatedAt: new Date().toISOString(),
        };
        
        // Update user with hashed password
        await redis.set(`user:${userId}`, updatedUser);
        console.log('Migrated plaintext password to hashed for user:', userId);
      }
    }
    
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email or password',
        }),
      };
    }
    
    // Create JWT token
    const token = generateToken(userId);
    
    // Set cookie
    const headers = {
      'Set-Cookie': setCookie(token),
    };
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = userData;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: userWithoutPassword,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred during login',
      }),
    };
  }
};

const logoutHandler = () => {
  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': clearCookie(),
    },
    body: JSON.stringify({
      success: true,
      message: 'Logged out successfully',
    }),
  };
};

const getMeHandler = async (event) => {
  try {
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies[COOKIE_NAME]; // Only look for our specific cookie
    
    console.log('Available cookies:', Object.keys(cookies));
    console.log('Looking for cookie:', COOKIE_NAME);
    console.log('Found token:', token ? 'YES' : 'NO');
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Not authenticated - no session cookie found',
        }),
      };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        statusCode: 401,
        headers: {
          'Set-Cookie': clearCookie(),
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid or expired token',
        }),
      };
    }
    
    const user = await getAuthUser(decoded.userId);
    
    if (!user) {
      return {
        statusCode: 404,
        headers: {
          'Set-Cookie': clearCookie(),
        },
        body: JSON.stringify({
          success: false,
          error: 'User not found',
        }),
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: user,
      }),
    };
  } catch (error) {
    console.error('Get me error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred',
      }),
    };
  }
};

const refreshHandler = async (event) => {
  try {
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies[COOKIE_NAME]; // Only look for our specific cookie
    
    console.log('Refresh - Available cookies:', Object.keys(cookies));
    console.log('Refresh - Looking for cookie:', COOKIE_NAME);
    console.log('Refresh - Found token:', token ? 'YES' : 'NO');
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Not authenticated - no session cookie found',
        }),
      };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        statusCode: 401,
        headers: {
          'Set-Cookie': clearCookie(),
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid or expired token',
        }),
      };
    }
    
    // Generate new token
    const newToken = generateToken(decoded.userId);
    
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': setCookie(newToken),
      },
      body: JSON.stringify({
        success: true,
        message: 'Token refreshed',
      }),
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred',
      }),
    };
  }
};

const updateUserHandler = async (event) => {
  try {
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies[COOKIE_NAME];
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Not authenticated',
        }),
      };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Invalid or expired token',
        }),
      };
    }
    
    const userData = await redis.get(`user:${decoded.userId}`);
    
    if (!userData) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'User not found',
        }),
      };
    }
    
    const updates = JSON.parse(event.body);
    
    // Prevent updating email or password through this route
    delete updates.email;
    delete updates.password;
    
    const updatedUser = {
      ...userData,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await redis.set(`user:${decoded.userId}`, updatedUser);
    
    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser;
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: userWithoutPassword,
      }),
    };
  } catch (error) {
    console.error('Update user error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred',
      }),
    };
  }
};

const changePasswordHandler = async (event) => {
  try {
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies[COOKIE_NAME];
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Not authenticated',
        }),
      };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Invalid or expired token',
        }),
      };
    }
    
    const { currentPassword, newPassword } = JSON.parse(event.body);
    
    if (!currentPassword || !newPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Current password and new password are required',
        }),
      };
    }
    
    if (newPassword.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'New password must be at least 6 characters long',
        }),
      };
    }
    
    const userData = await redis.get(`user:${decoded.userId}`);
    
    if (!userData) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'User not found',
        }),
      };
    }
    
    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, userData.password);
    
    if (!isValidPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Current password is incorrect',
        }),
      };
    }
    
    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);
    
    // Update user with new password
    const updatedUser = {
      ...userData,
      password: hashedNewPassword,
      updatedAt: new Date().toISOString(),
    };
    
    await redis.set(`user:${decoded.userId}`, updatedUser);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Password changed successfully',
      }),
    };
  } catch (error) {
    console.error('Change password error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An error occurred',
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
    // Debug logging
    console.log('Event path:', event.path);
    console.log('Event rawUrl:', event.rawUrl);
    console.log('Event headers:', event.headers);
    
    // Route handling - extract the endpoint from the path
    let path = event.path;
    
    // Handle different path formats
    if (path.includes('/.netlify/functions/auth')) {
      path = path.replace('/.netlify/functions/auth', '');
    }
    if (path.includes('/api/auth')) {
      path = path.replace('/api/auth', '');
    }
    
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    console.log('Processed path:', path);
    
    if (event.httpMethod === 'POST' && path === '/register') {
      return addCorsHeaders(await registerHandler(event));
    }
    
    if (event.httpMethod === 'POST' && path === '/login') {
      return addCorsHeaders(await loginHandler(event));
    }
    
    if (event.httpMethod === 'POST' && path === '/logout') {
      return addCorsHeaders(logoutHandler());
    }
    
    if (event.httpMethod === 'GET' && path === '/me') {
      return addCorsHeaders(await getMeHandler(event));
    }
    
    if (event.httpMethod === 'GET' && path === '/refresh') {
      return addCorsHeaders(await refreshHandler(event));
    }
    
    if (event.httpMethod === 'PUT' && path === '/user') {
      return addCorsHeaders(await updateUserHandler(event));
    }
    
    if (event.httpMethod === 'PUT' && path === '/change-password') {
      return addCorsHeaders(await changePasswordHandler(event));
    }
    
    return addCorsHeaders({
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        error: 'Route not found',
      }),
    });
  } catch (error) {
    console.error('Auth handler error:', error);
    
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'An unexpected error occurred',
      }),
    });
  }
};