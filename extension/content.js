// Listen for messages from the web page
window.addEventListener('message', function(event) {
  // Only accept messages from the same frame
  if (event.source !== window) return;

  // Check if the message is for our extension
  const message = event.data;
  if (message && 
      (message.action === 'startWorkMode' || 
       message.action === 'endWorkMode' || 
       message.action === 'startPanicMode' || 
       message.action === 'endPanicMode' ||
       message.action === 'checkAlarmStatus')) {
    
    // Forward the message to the background script
    chrome.runtime.sendMessage(message, function(response) {
      // Send the response back to the web page
      window.postMessage({
        type: 'FOCUSLOCK_EXTENSION_RESPONSE',
        response: response,
        originalAction: message.action
      }, '*');
    });
  }
});

// Instead of injecting an inline script, create a script element that loads an external file
function injectHelperScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('page-script.js');
  (document.head || document.documentElement).appendChild(script);
  script.onload = function() {
    script.remove();
  };
}

// Inject the helper script
injectHelperScript();

// Notify the web page when the extension is loaded
document.dispatchEvent(new CustomEvent('focusLockExtensionLoaded')); 