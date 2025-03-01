// List of blacklisted sites
const blacklistedSites = [
  'youtube.com',
  'instagram.com',
  'facebook.com',
  'twitter.com',
  'reddit.com',
  'netflix.com',
  'tiktok.com',
  'twitch.tv'
];

// Store the state of work mode
let isInWorkMode = false;
let isInPanicMode = false;

// Initialize the extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    inWorkMode: false,
    inPanicMode: false,
    workModeEndTime: null,
    currentWorkPeriod: null
  });
  console.log('FocusLock extension installed');
});

// Check if the extension state persists on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['inWorkMode', 'inPanicMode', 'workModeEndTime', 'currentWorkPeriod'], (result) => {
    isInWorkMode = result.inWorkMode || false;
    isInPanicMode = result.inPanicMode || false;
    
    // If there's a saved end time, recreate the alarm
    if (isInWorkMode && result.workModeEndTime) {
      const endTime = new Date(result.workModeEndTime).getTime();
      const now = Date.now();
      
      // Only recreate the alarm if the end time is in the future
      if (endTime > now) {
        try {
          chrome.alarms.create('workModeEnd', { when: endTime });
          console.log('Recreated work mode alarm for', new Date(endTime));
        } catch (error) {
          console.error('Failed to recreate work mode alarm:', error);
        }
      } else {
        // If the end time has passed, prompt for submission
        chrome.tabs.create({ url: 'http://localhost:3000/work-mode?submit=true' });
      }
    }
    
    if (isInPanicMode) {
      // If in panic mode, redirect to panic mode page
      chrome.tabs.create({ url: 'http://localhost:3000/panic-mode' });
      enforceRestrictions();
    } else if (isInWorkMode) {
      // If in work mode, redirect to work mode page
      chrome.tabs.create({ url: 'http://localhost:3000/work-mode' });
      enforceRestrictions();
    }
  });
});

// Listen for messages from the web app
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  if (message.action === 'startWorkMode') {
    startWorkMode(message.period_end, message.current_period);
    sendResponse({ status: 'Work mode started' });
  } else if (message.action === 'endWorkMode') {
    endWorkMode();
    sendResponse({ status: 'Work mode ended' });
  } else if (message.action === 'startPanicMode') {
    startPanicMode();
    sendResponse({ status: 'Panic mode started' });
  } else if (message.action === 'endPanicMode') {
    endPanicMode();
    sendResponse({ status: 'Panic mode ended' });
  } else if (message.action === 'checkAlarmStatus') {
    checkAlarmStatus().then(status => {
      sendResponse({ status: status });
    });
    return true; // Required for async response
  }
  
  return true; // Required for async response
});

// Function to check the status of the work mode alarm
async function checkAlarmStatus() {
  return new Promise((resolve) => {
    chrome.alarms.get('workModeEnd', (alarm) => {
      if (alarm) {
        const remainingTime = alarm.scheduledTime - Date.now();
        resolve({
          exists: true,
          scheduledTime: alarm.scheduledTime,
          remainingTime: remainingTime,
          remainingMinutes: Math.floor(remainingTime / 60000)
        });
      } else {
        resolve({ exists: false });
      }
    });
  });
}

// Function to start work mode
function startWorkMode(periodEnd, currentPeriod) {
  console.log('Starting work mode until', periodEnd);
  
  isInWorkMode = true;
  chrome.storage.local.set({ 
    inWorkMode: true,
    workModeEndTime: periodEnd,
    currentWorkPeriod: currentPeriod || null
  });
  
  // Set an alarm for the end of the work period
  if (periodEnd) {
    try {
      const endTime = new Date(periodEnd).getTime();
      const now = Date.now();
      
      // Only set the alarm if the end time is in the future
      if (endTime > now) {
        chrome.alarms.create('workModeEnd', { when: endTime });
        console.log('Created work mode alarm for', new Date(endTime));
        
        // Schedule a notification 5 minutes before the end
        const fiveMinutesBefore = endTime - (5 * 60 * 1000);
        if (fiveMinutesBefore > now) {
          chrome.alarms.create('workModeReminder', { when: fiveMinutesBefore });
        }
      } else {
        console.warn('Cannot set alarm for past time:', new Date(endTime));
      }
    } catch (error) {
      console.error('Failed to create work mode alarm:', error);
    }
  }
  
  // Close all tabs except FocusLock work mode
  closeNonFocusLockTabs();
  
  // Enforce restrictions on blacklisted sites
  enforceRestrictions();
}

// Function to end work mode
function endWorkMode() {
  console.log('Ending work mode');
  
  isInWorkMode = false;
  chrome.storage.local.set({ 
    inWorkMode: false,
    workModeEndTime: null,
    currentWorkPeriod: null
  });
  
  // Clear the work mode alarms
  try {
    chrome.alarms.clear('workModeEnd');
    chrome.alarms.clear('workModeReminder');
  } catch (error) {
    console.error('Failed to clear work mode alarms:', error);
  }
  
  // Remove restrictions
  removeRestrictions();
}

// Function to start panic mode
function startPanicMode() {
  console.log('Starting panic mode');
  
  isInPanicMode = true;
  chrome.storage.local.set({ inPanicMode: true });
  
  // Close all tabs except FocusLock panic mode
  closeAllTabsExcept('http://localhost:3000/panic-mode');
  
  // Enforce stricter restrictions
  enforceRestrictions();
}

// Function to end panic mode
function endPanicMode() {
  console.log('Ending panic mode');
  
  isInPanicMode = false;
  chrome.storage.local.set({ inPanicMode: false });
  
  // Remove restrictions
  removeRestrictions();
}

// Function to close all tabs except FocusLock work mode
function closeNonFocusLockTabs() {
  chrome.tabs.query({}, (tabs) => {
    const focusLockUrl = 'http://localhost:3000/work-mode';
    let focusLockTabExists = false;
    
    for (const tab of tabs) {
      if (tab.url && tab.url.startsWith('http://localhost:3000/work-mode')) {
        focusLockTabExists = true;
      } else if (tab.url && !tab.url.startsWith('chrome://')) {
        chrome.tabs.remove(tab.id);
      }
    }
    
    // If no FocusLock tab exists, create one
    if (!focusLockTabExists) {
      chrome.tabs.create({ url: focusLockUrl });
    }
  });
}

// Function to close all tabs except a specific URL
function closeAllTabsExcept(exceptUrl) {
  chrome.tabs.query({}, (tabs) => {
    let exceptTabExists = false;
    
    for (const tab of tabs) {
      if (tab.url && tab.url.startsWith(exceptUrl)) {
        exceptTabExists = true;
      } else if (tab.url && !tab.url.startsWith('chrome://')) {
        chrome.tabs.remove(tab.id);
      }
    }
    
    // If no except tab exists, create one
    if (!exceptTabExists) {
      chrome.tabs.create({ url: exceptUrl });
    }
  });
}

// Function to enforce restrictions on blacklisted sites
function enforceRestrictions() {
  // Use declarativeNetRequest to block blacklisted sites
  const rules = blacklistedSites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: site,
      resourceTypes: ['main_frame']
    }
  }));
  
  try {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(rule => rule.id),
      addRules: rules
    });
  } catch (error) {
    console.error('Failed to update blocking rules:', error);
  }
  
  // Listen for tab creation to enforce restrictions
  chrome.tabs.onCreated.addListener(handleNewTab);
}

// Function to remove restrictions
function removeRestrictions() {
  // Remove all blocking rules
  try {
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      const ruleIds = rules.map(rule => rule.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: []
      });
    });
  } catch (error) {
    console.error('Failed to remove blocking rules:', error);
  }
  
  // Remove tab creation listener
  chrome.tabs.onCreated.removeListener(handleNewTab);
}

// Function to handle new tab creation during work/panic mode
function handleNewTab(tab) {
  if (isInPanicMode) {
    // In panic mode, redirect all new tabs to panic mode
    chrome.tabs.update(tab.id, { url: 'http://localhost:3000/panic-mode' });
  } else if (isInWorkMode) {
    // In work mode, only allow FocusLock work mode
    if (!tab.pendingUrl || !tab.pendingUrl.startsWith('http://localhost:3000/work-mode')) {
      chrome.tabs.update(tab.id, { url: 'http://localhost:3000/work-mode' });
    }
  }
}

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'workModeEnd') {
    console.log('Work mode period ended');
    
    // Get the current work period information
    chrome.storage.local.get(['currentWorkPeriod'], (result) => {
      let submitUrl = 'http://localhost:3000/submit';
      
      // If we have current period info, add it to the URL
      if (result.currentWorkPeriod) {
        submitUrl += `?period=${encodeURIComponent(JSON.stringify(result.currentWorkPeriod))}`;
      }
      
      try {
        // Prompt user to submit progress
        chrome.tabs.create({ url: submitUrl });
        
        // Show a notification
        chrome.notifications.create('workModeEnded', {
          type: 'basic',
          iconUrl: 'images/icon128.png',
          title: 'Work Period Ended',
          message: 'Your scheduled work period has ended. Please submit your progress.',
          priority: 2
        });
      } catch (error) {
        console.error('Failed to handle work mode end:', error);
        
        // Fallback: try to open the work mode page with submit parameter
        try {
          chrome.tabs.create({ url: 'http://localhost:3000/work-mode?submit=true' });
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    });
  } else if (alarm.name === 'workModeReminder') {
    console.log('Work mode reminder');
    
    // Show a notification
    try {
      chrome.notifications.create('workModeReminder', {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: 'Work Period Ending Soon',
        message: 'Your scheduled work period will end in 5 minutes. Finish up your current task.',
        priority: 1
      });
    } catch (error) {
      console.error('Failed to show reminder notification:', error);
    }
  }
}); 