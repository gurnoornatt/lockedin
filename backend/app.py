import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

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

# Database initialization function
def init_db():
    """
    Initialize the database tables if they don't exist.
    This function will be implemented in the next step.
    """
    print("Database initialization will be implemented in the next step.")
    return True

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

# Initialize the database when the app starts
with app.app_context():
    init_db()

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5001) 