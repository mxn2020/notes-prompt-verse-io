// Debug script to check what's happening
console.log('Debug script loaded!');

// Check if React and DOM are working
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  console.log('Root element:', document.getElementById('root'));
  console.log('Root innerHTML:', document.getElementById('root')?.innerHTML);
});

// Check for any errors
window.addEventListener('error', (event) => {
  console.error('JavaScript Error:', event.error);
});

// Check for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

// Log when the page is fully loaded
window.addEventListener('load', () => {
  console.log('Page fully loaded');
  setTimeout(() => {
    console.log('After 2 seconds - Root content:', document.getElementById('root')?.innerHTML);
  }, 2000);
});
