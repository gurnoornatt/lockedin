document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status');
  const startWorkModeButton = document.getElementById('startWorkMode');
  const endWorkModeButton = document.getElementById('endWorkMode');
  
  // Check the current state
  chrome.storage.local.get(['inWorkMode', 'inPanicMode'], (result) => {
    updateUI(result.inWorkMode, result.inPanicMode);
  });
  
  // Start Work Mode button
  startWorkModeButton.addEventListener('click', () => {
    // Set work mode end time to 1 hour from now
    const periodEnd = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    chrome.runtime.sendMessage({ 
      action: 'startWorkMode',
      period_end: periodEnd
    }, (response) => {
      console.log('Response:', response);
      updateUI(true, false);
    });
  });
  
  // End Work Mode button
  endWorkModeButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ 
      action: 'endWorkMode' 
    }, (response) => {
      console.log('Response:', response);
      updateUI(false, false);
    });
  });
  
  // Update UI based on current state
  function updateUI(inWorkMode, inPanicMode) {
    if (inPanicMode) {
      statusElement.className = 'status panic';
      statusElement.textContent = 'Status: Panic Mode';
      startWorkModeButton.disabled = true;
      endWorkModeButton.disabled = true;
    } else if (inWorkMode) {
      statusElement.className = 'status active';
      statusElement.textContent = 'Status: Work Mode Active';
      startWorkModeButton.disabled = true;
      endWorkModeButton.disabled = false;
    } else {
      statusElement.className = 'status inactive';
      statusElement.textContent = 'Status: Inactive';
      startWorkModeButton.disabled = false;
      endWorkModeButton.disabled = true;
    }
  }
}); 