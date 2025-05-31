const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Import and set up function handlers
const authHandler = require('../netlify/functions/auth.cjs');
const notesHandler = require('../netlify/functions/notes.cjs');
const healthHandler = require('../netlify/functions/health.cjs');
const testHandler = require('../netlify/functions/test.cjs');

// Helper function to convert Netlify function to Express middleware
const netlifyToExpress = (handler) => {
  return async (req, res) => {
    const event = {
      httpMethod: req.method,
      path: req.path,
      queryStringParameters: req.query,
      headers: req.headers,
      body: req.body ? JSON.stringify(req.body) : null,
      pathParameters: req.params,
      isBase64Encoded: false
    };

    const context = {
      functionName: 'dev-function',
      functionVersion: '1',
      memoryLimitInMB: 128,
      timeoutInSeconds: 30
    };

    try {
      const result = await handler.handler(event, context);
      
      // Set headers
      if (result.headers) {
        Object.entries(result.headers).forEach(([key, value]) => {
          res.set(key, value);
        });
      }

      // Set status and send response
      res.status(result.statusCode || 200);
      
      if (result.body) {
        const contentType = result.headers?.['Content-Type'] || result.headers?.['content-type'];
        if (contentType?.includes('application/json')) {
          try {
            res.json(JSON.parse(result.body));
          } catch {
            res.send(result.body);
          }
        } else {
          res.send(result.body);
        }
      } else {
        res.end();
      }
    } catch (error) {
      console.error('Function error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Set up routes for each function
app.use('/api/auth', netlifyToExpress(authHandler));
app.use('/api/notes', netlifyToExpress(notesHandler));
app.use('/api/health', netlifyToExpress(healthHandler));
app.use('/api/test', netlifyToExpress(testHandler));

// Health check for the dev server itself
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Functions development server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Functions development server running on http://localhost:${PORT}`);
  console.log('📡 Available endpoints:');
  console.log('  - http://localhost:3001/api/auth');
  console.log('  - http://localhost:3001/api/notes');
  console.log('  - http://localhost:3001/api/health');
  console.log('  - http://localhost:3001/api/test');
});
