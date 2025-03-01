// Listen for messages from the web page
window.addEventListener('message', (event) => {
  // Only accept messages from our application
  if (event.origin !== 'http://localhost:3000') return;
  
  const message = event.data;
  
  // Forward messages to the background script
  if (message && (
    message.action === 'startWorkMode' || 
    message.action === 'endWorkMode' || 
    message.action === 'startPanicMode' || 
    message.action === 'endPanicMode'
  )) {
    chrome.runtime.sendMessage(message, (response) => {
      // Send response back to the web page
      window.postMessage({
        type: 'FOCUSLOCK_EXTENSION_RESPONSE',
        response: response
      }, '*');
    });
  }
});

// Inject a script to allow the web page to detect if the extension is installed
const script = document.createElement('script');
script.textContent = `
  window.focusLockExtensionInstalled = true;
  
  // Function to send messages to the extension
  window.sendToFocusLockExtension = function(message) {
    window.postMessage(message, '*');
    return new Promise((resolve) => {
      window.addEventListener('message', function listener(event) {
        if (event.data && event.data.type === 'FOCUSLOCK_EXTENSION_RESPONSE') {
          window.removeEventListener('message', listener);
          resolve(event.data.response);
        }
      });
    });
  };
  
  // Dispatch an event to notify the web app that the extension is ready
  document.dispatchEvent(new CustomEvent('focusLockExtensionReady'));
`;
document.documentElement.appendChild(script);
script.remove();

// Notify the web page when the extension is loaded
document.dispatchEvent(new CustomEvent('focusLockExtensionLoaded')); 