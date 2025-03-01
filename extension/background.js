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
    workModeEndTime: null
  });
  console.log('FocusLock extension installed');
});

// Check if the extension state persists on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['inWorkMode', 'inPanicMode'], (result) => {
    isInWorkMode = result.inWorkMode || false;
    isInPanicMode = result.inPanicMode || false;
    
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
    startWorkMode(message.period_end);
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
  }
  
  return true; // Required for async response
});

// Function to start work mode
function startWorkMode(periodEnd) {
  console.log('Starting work mode until', periodEnd);
  
  isInWorkMode = true;
  chrome.storage.local.set({ 
    inWorkMode: true,
    workModeEndTime: periodEnd
  });
  
  // Set an alarm for the end of the work period
  if (periodEnd) {
    const endTime = new Date(periodEnd).getTime();
    chrome.alarms.create('workModeEnd', { when: endTime });
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
  chrome.storage.local.set({ inWorkMode: false });
  
  // Clear the work mode end alarm
  chrome.alarms.clear('workModeEnd');
  
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
  
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(rule => rule.id),
    addRules: rules
  });
  
  // Listen for tab creation to enforce restrictions
  chrome.tabs.onCreated.addListener(handleNewTab);
}

// Function to remove restrictions
function removeRestrictions() {
  // Remove all blocking rules
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const ruleIds = rules.map(rule => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds,
      addRules: []
    });
  });
  
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

// Handle alarm for work mode end
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'workModeEnd') {
    console.log('Work mode period ended');
    
    // Prompt user to submit progress
    chrome.tabs.create({ url: 'http://localhost:3000/work-mode?submit=true' });
  }
}); 