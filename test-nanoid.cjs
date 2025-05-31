// Test nanoid specifically
console.log('Testing nanoid import...');

try {
  const { nanoid } = require('nanoid');
  console.log('Nanoid imported successfully');
  console.log('Nanoid type:', typeof nanoid);
  
  const id = nanoid();
  console.log('Generated ID:', id);
  
  // Now try to export something
  const handler = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify({ id: nanoid() })
    };
  };
  
  exports.handler = handler;
  console.log('Handler exported with nanoid');
  
} catch (error) {
  console.error('Error with nanoid:', error);
}
