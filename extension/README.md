# FocusLock Chrome Extension

This Chrome extension is part of the FocusLock productivity application. It helps enforce focus by blocking distracting websites during work sessions and implementing panic mode when deadlines are approaching.

## Features

- **Work Mode**: Blocks distracting websites and keeps you focused on your work
- **Panic Mode**: Enforces stricter restrictions when you're behind on your assignments
- **Automatic Scheduling**: Integrates with the FocusLock web application to follow your schedule
- **Persistence**: Maintains work/panic mode state even if the browser is restarted

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `extension` directory
4. The FocusLock extension should now appear in your extensions list

## Usage

The extension works in conjunction with the FocusLock web application:

1. When you start a work session in the web app, the extension will automatically enter Work Mode
2. During Work Mode, distracting websites are blocked and you're kept on the FocusLock work page
3. If you fall behind on your assignments, Panic Mode will be activated
4. You can also manually control Work Mode through the extension popup

## Development

The extension consists of the following files:

- `manifest.json`: Extension configuration
- `background.js`: Background service worker that handles the core functionality
- `content.js`: Content script that facilitates communication with the web app
- `popup.html` and `popup.js`: User interface for the extension popup
- `images/`: Directory containing extension icons

## Permissions

The extension requires the following permissions:

- `tabs`: To manage and control browser tabs
- `webRequest` and `declarativeNetRequest`: To block distracting websites
- `alarms`: To schedule the end of work sessions
- `storage`: To persist the extension state
- `<all_urls>`: To monitor and control web requests

## License

This extension is part of the FocusLock application and is licensed under the MIT License. 