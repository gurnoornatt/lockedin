document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status');
  const startWorkModeButton = document.getElementById('startWorkMode');
  const endWorkModeButton = document.getElementById('endWorkMode');
  
  // Check the current state
  chrome.storage.local.get(['inWorkMode', 'inPanicMode', 'workModeEndTime'], (result) => {
    updateUI(result.inWorkMode, result.inPanicMode, result.workModeEndTime);
    
    // If in work mode, check the alarm status
    if (result.inWorkMode) {
      chrome.runtime.sendMessage({ action: 'checkAlarmStatus' }, (response) => {
        if (response && response.status && response.status.exists) {
          const remainingMinutes = response.status.remainingMinutes;
          const timeDisplay = document.createElement('div');
          timeDisplay.className = 'time-display';
          timeDisplay.textContent = `Time remaining: ${remainingMinutes} minutes`;
          statusElement.appendChild(timeDisplay);
        }
      });
    }
  });
  
  // Start Work Mode button
  startWorkModeButton.addEventListener('click', () => {
    // Set work mode end time to 1 hour from now
    const periodEnd = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    chrome.runtime.sendMessage({ 
      action: 'startWorkMode',
      period_end: periodEnd,
      current_period: {
        task: 'Focus Session',
        start: new Date().toISOString(),
        end: periodEnd
      }
    }, (response) => {
      console.log('Response:', response);
      updateUI(true, false, periodEnd);
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
  function updateUI(inWorkMode, inPanicMode, workModeEndTime) {
    if (inPanicMode) {
      statusElement.className = 'status panic';
      statusElement.textContent = 'Status: Panic Mode';
      startWorkModeButton.disabled = true;
      endWorkModeButton.disabled = true;
    } else if (inWorkMode) {
      statusElement.className = 'status active';
      statusElement.innerHTML = 'Status: Work Mode Active';
      
      // Add end time if available
      if (workModeEndTime) {
        const endTime = new Date(workModeEndTime);
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        timeDisplay.textContent = `Ends at: ${endTime.toLocaleTimeString()}`;
        statusElement.appendChild(timeDisplay);
      }
      
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