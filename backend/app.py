import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow requests from the Next.js frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# API endpoint to save an assignment
@app.route('/api/save_assignment', methods=['POST'])
def save_assignment():
    """
    Save an assignment and its milestones to the database.
    
    Expected JSON structure:
    {
        "name": "Assignment Name",
        "deadline": "2023-10-15T23:59:00",
        "total_hours": 10,
        "milestones": [
            {"task": "Write intro", "period": "2023-10-13T14:00-16:00"},
            {"task": "Write body", "period": "2023-10-14T14:00-16:00"}
        ]
    }
    """
    try:
        # Get the JSON data from the request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract assignment details
        name = data.get('name')
        deadline = data.get('deadline')
        total_hours = data.get('total_hours')
        milestones = data.get('milestones', [])
        
        # Validate required fields
        if not all([name, deadline, total_hours]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Insert the assignment into the assignments table
        logging.info(f"Inserting assignment: {name}")
        assignment_response = supabase.table('assignments').insert({
            'name': name,
            'deadline': deadline,
            'total_hours': total_hours
        }).execute()
        
        # Check if the assignment was inserted successfully
        if not assignment_response.data:
            logging.error("Failed to insert assignment")
            return jsonify({'error': 'Failed to save assignment'}), 400
        
        # Get the assignment ID
        assignment_id = assignment_response.data[0]['id']
        logging.info(f"Assignment saved with ID: {assignment_id}")
        
        # Insert each milestone
        for milestone in milestones:
            task = milestone.get('task')
            period = milestone.get('period')
            
            if not task or not period:
                continue
            
            # Parse the period into period_start and period_end
            try:
                period_parts = period.split('-')
                period_start = period_parts[0]
                period_end = period_parts[1]
                
                # If period_start doesn't include a date, use the date from period_end
                if 'T' not in period_start:
                    date_part = period_end.split('T')[0]
                    period_start = f"{date_part}T{period_start}"
            except Exception as e:
                logging.error(f"Error parsing period: {e}")
                continue
            
            # Insert the milestone
            logging.info(f"Inserting milestone: {task}")
            milestone_response = supabase.table('milestones').insert({
                'assignment_id': assignment_id,
                'task': task,
                'deliverable': '',  # Empty string as placeholder
                'period_start': period_start,
                'period_end': period_end,
                'cumulative_goal': 0  # Placeholder, will be updated later
            }).execute()
            
            if not milestone_response.data:
                logging.warning(f"Failed to insert milestone: {task}")
        
        return jsonify({'assignment_id': assignment_id}), 201
    
    except Exception as e:
        logging.error(f"Error saving assignment: {e}")
        return jsonify({'error': 'Failed to save assignment'}), 400

# Basic health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the API is running."""
    return jsonify({
        'status': 'ok',
        'message': 'FocusLock API is running'
    })

# Error handler for 404 errors
@app.errorhandler(404)
def not_found(e):
    return jsonify({
        'status': 'error',
        'message': 'The requested resource was not found'
    }), 404

# Error handler for 500 errors
@app.errorhandler(500)
def server_error(e):
    return jsonify({
        'status': 'error',
        'message': 'An internal server error occurred'
    }), 500

# Run the app
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 