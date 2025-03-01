// This script will be loaded by the content script and executed in the page context
window.focusLockExtensionInstalled = true;

// Function to send messages to the extension
window.sendToFocusLockExtension = function(message) {
  window.postMessage(message, '*');
  return new Promise((resolve) => {
    window.addEventListener('message', function listener(event) {
      if (event.data && 
          event.data.type === 'FOCUSLOCK_EXTENSION_RESPONSE' && 
          event.data.originalAction === message.action) {
        window.removeEventListener('message', listener);
        resolve(event.data.response);
      }
    });
  });
};

// Dispatch an event to notify the web app that the extension is ready
document.dispatchEvent(new CustomEvent('focusLockExtensionReady')); 