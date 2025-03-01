# Prompt Guide Overview

## Tech Stack

- **Frontend**: Next.js (React-based framework)
- **Backend**: Python with Flask and SQLite
- **Browser Extension**: Chrome-compatible (with potential Firefox support)

## Assumptions

- The UI is designed with placeholders for all forms, displays, and interfaces (e.g., assignment input, schedule, work mode, panic mode).
- Single-user system (no authentication) for simplicity, suitable for a hackathon demo.
- Basic error handling and user feedback are included, but polish is secondary to functionality.

## Project Features

- **Assignment Input and Scheduling**: Users input assignments and milestones; the backend generates a schedule.
- **Progress Tracking**: Users submit progress; the backend validates it.
- **Work Mode**: The extension blocks distractions during scheduled work periods.
- **Panic Mode**: Triggered when progress is insufficient, locking the browser until caught up.
- **Anti-Cheating Mechanisms**: Prevent fake submissions with timestamp and effort checks.

## Phase 1: Backend Setup and Database (Hours 0–6)

The backend is the foundation, handling data storage and core logic. We'll start here.

### 1. Set Up Flask App with SQLite Database

**Prompt:**
> "Create a Python script using Flask to initialize the backend for FocusLock. Set up a Flask app and connect it to an supabase database named focuslock.db. Include basic configuration for JSON responses and enable CORS to allow communication with the Next.js frontend running on http://localhost:3000. Save the script as app.py and ensure it runs on port 5000."

### 2. Create Database Schema

**Prompt:**
> "In the Flask app (app.py), define and create the supabase database schema for FocusLock. Use three tables:
> - **assignments**: Columns: id (integer, primary key), name (text), deadline (text, ISO format), total_hours (integer).
> - **milestones**: Columns: id (integer, primary key), assignment_id (integer, foreign key to assignments), task (text), deliverable (text), period_start (text, ISO format), period_end (text, ISO format), cumulative_goal (integer).
> - **submissions**: Columns: id (integer, primary key), milestone_id (integer, foreign key to milestones), progress (text), file_path (text), timestamp (text, ISO format), status (text). 
>
> Write a function init_db() to create these tables with proper foreign key constraints, and call it when the app starts."

### 3. Implement /api/save_assignment Endpoint

**Prompt:**
> "In app.py, add a Flask API endpoint at /api/save_assignment that accepts POST requests with JSON data. The expected JSON structure is:
> ```json
> {
>   "name": "Assignment Name",
>   "deadline": "2023-10-15T23:59:00",
>   "total_hours": 10,
>   "milestones": [
>     {"task": "Write intro", "period": "2023-10-13T14:00-16:00"},
>     {"task": "Write body", "period": "2023-10-14T14:00-16:00"}
>   ]
> }
> ```
> Insert the assignment into the assignments table, retrieve the assignment_id, and then insert each milestone into the milestones table. Parse each milestone's period into period_start and period_end (e.g., '2023-10-13T14:00', '2023-10-13T16:00'). Set cumulative_goal as a placeholder (e.g., 0) for now. Return a JSON response: {'assignment_id': id} on success or an error message on failure."

## Phase 2: Frontend Assignment Input and Scheduling (Hours 6–12)

With the backend storing assignments, let's wire up the frontend to input and display schedules.

### 4. Create Assignment Input Form in Next.js

**Prompt:**
> "In the Next.js app, create a page at /pages/add-assignment.js with a form for users to input assignment details. Use the existing UI components and add functionality:
> - Fields: name (text), deadline (datetime-local), total_hours (number).
> - Dynamic Milestones: A section to add multiple milestones, each with task (text) and period (text, e.g., '14:00-16:00'). 
>
> Use useState to manage the list of milestones, with an 'Add Milestone' button to append new entries. On form submission, construct a JSON object and send a POST request to http://localhost:5000/api/save_assignment using axios. After a successful response, redirect to /schedule."

### 5. Implement Scheduling Logic in Python

**Prompt:**
> "In app.py, add a function generate_schedule(assignment_id) to create a work schedule. Fetch the assignment's total_hours and deadline. Calculate daily work hours (e.g., 10 hours over 5 days = 2 hours/day). For each milestone, assign period_start and period_end based on its period string, converting to ISO format (e.g., '2023-10-13T14:00:00'). Update the milestones table with these times and set cumulative_goal incrementally (e.g., 2, 4, 6 hours). Call this function in the /api/save_assignment endpoint after inserting milestones."

### 6. Create /api/get_schedule Endpoint

**Prompt:**
> "In app.py, implement a GET endpoint at /api/get_schedule that returns the user's schedule. For simplicity, assume a single user and return all assignments and their milestones. Fetch data from the assignments and milestones tables, joining them on assignment_id. Return a JSON response:
> ```json
> [
>   {
>     "id": 1,
>     "name": "Assignment Name",
>     "deadline": "2023-10-15T23:59:00",
>     "total_hours": 10,
>     "milestones": [
>       {"task": "Write intro", "period_start": "2023-10-13T14:00:00", "period_end": "2023-10-13T16:00:00", "cumulative_goal": 2}
>     ]
>   }
> ]
> ```
> Handle errors with a 500 status if the query fails."

### 7. Display Schedule in Next.js

**Prompt:**
> "In Next.js, create a page at /pages/schedule.js that fetches the schedule from http://localhost:5000/api/get_schedule using axios in a useEffect hook. Display the data using the existing UI components, showing each assignment's name, deadline, and a list of milestones with their tasks, work periods, and cumulative goals. Use a table or list format for readability."

## Phase 3: Work Mode Implementation (Hours 12–18)

Now, let's enforce focus during work periods with the frontend and extension.

### 8. Create Work Mode Interface in Next.js

**Prompt:**
> "In Next.js, create a page at /pages/work-mode.js. Check the current time against the schedule (fetched from /api/get_schedule) to determine the active milestone. Display its task and a countdown timer (e.g., using setInterval) based on period_end. Include a form for progress submission with fields for text input or file upload. When the timer reaches zero, show a notification using the Notification API ('Time to submit progress!') and enable the submit button. Use the existing UI components."

### 9. Implement Work Mode Enforcement in Browser Extension

**Prompt:**
> "Create a Chrome extension for FocusLock. Start with manifest.json:
> ```json
> {
>   "manifest_version": 3,
>   "name": "FocusLock",
>   "version": "1.0",
>   "permissions": ["tabs", "webRequest", "webRequestBlocking", "alarms", "<all_urls>"],
>   "background": {"service_worker": "background.js"},
>   "content_scripts": [{"matches": ["http://localhost:3000/*"], "js": ["content.js"]}]
> }
> ```
> In background.js, listen for messages from the web app. If the message is { action: 'startWorkMode' }, block blacklisted sites (e.g., 'youtube.com', 'instagram.com') using chrome.webRequest.onBeforeRequest and redirect or close non-FocusLock tabs (e.g., keep only http://localhost:3000/work-mode) using chrome.tabs. Provide the full script."

### 10. Set Up Alarms for Work Period Ends

**Prompt:**
> "In the extension's background.js, add functionality to set an alarm for the end of a work period. When a startWorkMode message is received, extract period_end from the message payload and use chrome.alarms.create to schedule an alarm. When the alarm fires (chrome.alarms.onAlarm), open a new tab to http://localhost:3000/submit to prompt progress submission. Include error handling if the alarm fails."

## Phase 4: Progress Submission and Validation (Hours 18–24)

Track and validate progress to enforce accountability.

### 11. Implement /api/submit_progress Endpoint

**Prompt:**
> "In app.py, create a POST endpoint at /api/submit_progress that accepts JSON data:
> ```json
> {
>   "milestone_id": 1,
>   "progress": "text content",
>   "file": "base64 encoded or path", 
>   "timestamp": "2023-10-13T15:45:00"
> }
> ```
> Validate:
> - Timestamp is within period_start to period_end + 15 minutes.
> - Text progress has ≥50 words (len(progress.split())).
> - File (if provided) exists at file_path and is >100 KB.
>
> Insert the submission into the submissions table with status as 'approved' or 'rejected'. If rejected or cumulative progress < cumulative_goal, return {'status': 'panic'}; else, {'status': 'ok'}."

### 12. Handle Progress Submission in Next.js

**Prompt:**
> "On /work-mode.js, when the user submits progress, send a POST request to http://localhost:5000/api/submit_progress with the form data. Use axios and include the current timestamp (ISO format). If the response is {'status': 'panic'}, send a message to the extension: chrome.runtime.sendMessage('extension_id', { action: 'startPanicMode' }). If ok, display a success message and redirect to /schedule. Use the existing submit button and form."

### 13. Implement Anti-Cheating Mechanisms

**Prompt:**
> "In /api/submit_progress, add anti-cheating checks:
> - Compare timestamp against file metadata (if available) to reject pre-existing files.
> - Check progress against previous submissions for duplicates.
> - With 20% probability (random.random() < 0.2), set status to 'pending' and delay Panic Mode exit by 1 hour unless resubmitted.
>
> Update the endpoint to reflect these rules and adjust the response accordingly."

## Phase 5: Panic Mode Implementation (Hours 24–30)

Lock the user into catching up when they fall behind.

### 14. Create Panic Mode Interface in Next.js

**Prompt:**
> "In Next.js, create a page at /pages/panic-mode.js using the existing UI. Display a message: 'You're in Panic Mode due to insufficient progress. Submit catch-up work to exit.' Include a form for text or file submission. On load, enter fullscreen mode with document.documentElement.requestFullscreen(). On submission, send to /api/submit_progress and check the response to exit Panic Mode."

### 15. Implement Panic Mode Enforcement in Extension

**Prompt:**
> "In background.js, handle { action: 'startPanicMode' } messages. Block all non-whitelisted URLs (e.g., allow only http://localhost:3000/*) using chrome.webRequest. Close all tabs except http://localhost:3000/panic-mode with chrome.tabs. Persist the state with chrome.storage.local.set({ inPanicMode: true }). Lift restrictions only when { action: 'endPanicMode' } is received."

### 16. Implement Panic Mode Exit Logic

**Prompt:**
> "In /api/submit_progress, when called during Panic Mode (determined by prior 'panic' status), check if cumulative approved submissions for the assignment meet or exceed the missed milestone's cumulative_goal. If yes, return {'status': 'ok'}; else, {'status': 'panic'}. In /panic-mode.js, send { action: 'endPanicMode' } to the extension on 'ok'."

## Phase 6: Final Touches and Testing (Hours 30–36)

Polish and verify the system.

### 17. Implement Extension Persistence

**Prompt:**
> "In background.js, use chrome.runtime.onStartup to check chrome.storage.local.get('inPanicMode'). If true, reopen http://localhost:3000/panic-mode and restore restrictions. Ensure this persists Panic Mode across browser restarts."

### 18. Add User Feedback and Error Handling

**Prompt:**
> "In Next.js, enhance all API calls (/add-assignment, /work-mode, /panic-mode) with loading states (e.g., 'Submitting...') and error messages (e.g., 'Failed to save') using state variables. Use the Notification API to alert users when Work Mode starts or ends based on the schedule."

### 19. Test End-to-End Scenarios

**Prompt:**
> "Provide a Python script to test FocusLock:
> - Insert a sample assignment with 2 milestones.
> - Simulate an on-time, valid submission (approved).
> - Simulate a late, insufficient submission (triggers Panic Mode).
> - Simulate a catch-up submission in Panic Mode (exits).
>
> Include assertions to verify API responses, database updates, and extension behavior."

## Integration Details

### Frontend-to-Extension Communication:
Use `chrome.runtime.sendMessage('extension_id', { action: 'startWorkMode', period_end: '...' })` in Next.js, with extension_id from your extension's manifest.

### File Uploads:
In Flask, add `from flask import request` and handle `request.files` in /api/submit_progress, saving files to a /uploads folder.

### Time Handling:
Use `datetime` in Python and `Date` in JavaScript, ensuring ISO format consistency (e.g., '2023-10-13T14:00:00Z').

## Final Notes

This guide ensures every part of FocusLock is coded, from database setup to browser lockdowns. Follow the prompts sequentially, testing each phase before moving on. For the hackathon, prioritize:

1. Backend APIs and database.
2. Frontend forms and displays.
3. Extension enforcement.