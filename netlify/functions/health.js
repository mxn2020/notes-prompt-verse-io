import { Redis } from '@upstash/redis';

// Health check endpoint to verify environment configuration
export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || 'http://localhost:8888',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  try {
    // Check Redis connection
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Simple ping to Redis
    const pingResult = await redis.ping();
    health.checks.redis = {
      status: pingResult === 'PONG' ? 'healthy' : 'unhealthy',
      response: pingResult
    };

    // Check environment variables
    const requiredEnvVars = [
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    health.checks.environment = {
      status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
      missingVariables: missingVars,
      totalRequired: requiredEnvVars.length,
      configured: requiredEnvVars.length - missingVars.length
    };

    // Overall health status
    const allHealthy = Object.values(health.checks).every(check => check.status === 'healthy');
    health.status = allHealthy ? 'healthy' : 'unhealthy';

    return {
      statusCode: allHealthy ? 200 : 503,
      headers,
      body: JSON.stringify(health, null, 2)
    };

  } catch (error) {
    console.error('Health check failed:', error);
    
    health.status = 'unhealthy';
    health.error = error.message;
    health.checks.redis = {
      status: 'unhealthy',
      error: error.message
    };

    return {
      statusCode: 503,
      headers,
      body: JSON.stringify(health, null, 2)
    };
  }
};
