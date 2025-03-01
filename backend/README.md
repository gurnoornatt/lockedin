# FocusLock Backend

This is the backend for the FocusLock application, built with Flask and Supabase.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-supabase-project-url.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   FLASK_ENV=development
   ```

## Running the Server

Start the Flask server:
```bash
python app.py
```

The server will run on http://localhost:5001.

## API Endpoints

- `GET /api/health`: Health check endpoint
- `POST /api/save_assignment`: Save a new assignment with milestones
  - Request body:
    ```json
    {
      "name": "Assignment Name",
      "deadline": "2023-10-15T23:59:00",
      "total_hours": 10,
      "milestones": [
        {"task": "Write intro", "period": "2023-10-13T14:00-16:00"},
        {"task": "Write body", "period": "2023-10-14T14:00-16:00"}
      ]
    }
    ```
  - Response:
    ```json
    {
      "assignment_id": "uuid-of-created-assignment"
    }
    ```

## Running Tests

Run the tests using the provided script:
```bash
./run_tests.sh
```

Or manually:
```bash
python -m pytest tests/ -v
``` 