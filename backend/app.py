import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta
import math

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

# Function to generate a work schedule for an assignment
def generate_schedule(assignment_id):
    """
    Generate a work schedule for an assignment.
    
    Args:
        assignment_id: The ID of the assignment to generate a schedule for.
        
    Returns:
        bool: True if successful, False otherwise.
    """
    try:
        # Fetch the assignment details
        assignment_response = supabase.table('assignments').select('*').eq('id', assignment_id).execute()
        
        if not assignment_response.data:
            logging.error(f"Assignment with ID {assignment_id} not found")
            return False
        
        assignment = assignment_response.data[0]
        total_hours = assignment['total_hours']
        deadline = datetime.fromisoformat(assignment['deadline'].replace('Z', '+00:00'))
        
        # Fetch all milestones for this assignment
        milestones_response = supabase.table('milestones').select('*').eq('assignment_id', assignment_id).execute()
        
        if not milestones_response.data:
            logging.warning(f"No milestones found for assignment {assignment_id}")
            return False
        
        milestones = milestones_response.data
        
        # Calculate how many hours should be allocated to each milestone
        num_milestones = len(milestones)
        hours_per_milestone = total_hours / num_milestones
        
        # Update each milestone with cumulative goals
        cumulative_hours = 0
        
        for i, milestone in enumerate(milestones):
            # Calculate cumulative goal for this milestone
            cumulative_hours += hours_per_milestone
            cumulative_goal = math.ceil(cumulative_hours)  # Round up to nearest hour
            
            # Update the milestone with the cumulative goal
            update_response = supabase.table('milestones').update({
                'cumulative_goal': cumulative_goal
            }).eq('id', milestone['id']).execute()
            
            if not update_response.data:
                logging.warning(f"Failed to update cumulative goal for milestone {milestone['id']}")
        
        logging.info(f"Successfully generated schedule for assignment {assignment_id}")
        return True
        
    except Exception as e:
        logging.error(f"Error generating schedule: {e}")
        return False

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
        
        # Generate schedule for the assignment
        schedule_success = generate_schedule(assignment_id)
        if not schedule_success:
            logging.warning(f"Failed to generate schedule for assignment {assignment_id}")
        
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