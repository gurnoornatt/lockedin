import sys
import os
import pytest
import json
from unittest.mock import patch, MagicMock

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

@pytest.fixture
def client():
    """Create a test client for the app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'
    assert 'FocusLock API is running' in data['message']

def test_not_found(client):
    """Test the 404 error handler."""
    response = client.get('/api/nonexistent')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['status'] == 'error'
    assert 'not found' in data['message'].lower()

@pytest.fixture
def mock_supabase():
    """Mock the Supabase client for testing."""
    with patch('app.supabase') as mock_client:
        # Create a table mock that can be reused
        table_mock = MagicMock()
        mock_client.table.return_value = table_mock
        
        # Mock the insert and execute methods
        insert_mock = MagicMock()
        table_mock.insert.return_value = insert_mock
        
        # Mock the execute method to return a response with data
        execute_mock = MagicMock()
        execute_mock.data = [{'id': 'test-uuid-123'}]
        insert_mock.execute.return_value = execute_mock
        
        yield mock_client

def test_save_assignment_success(client, mock_supabase):
    """Test successful assignment creation."""
    test_data = {
        'name': 'Test Assignment',
        'deadline': '2023-10-15T23:59:00',
        'total_hours': 10,
        'milestones': [
            {'task': 'Write intro', 'period': '2023-10-13T14:00-16:00'},
            {'task': 'Write body', 'period': '2023-10-14T14:00-16:00'}
        ]
    }
    
    response = client.post('/api/save_assignment', 
                          json=test_data,
                          content_type='application/json')
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'assignment_id' in data
    assert data['assignment_id'] == 'test-uuid-123'
    
    # Verify Supabase was called correctly
    mock_supabase.table.assert_any_call('assignments')
    mock_supabase.table.assert_any_call('milestones')

def test_save_assignment_missing_fields(client):
    """Test assignment creation with missing required fields."""
    # Missing deadline
    test_data = {
        'name': 'Test Assignment',
        'total_hours': 10
    }
    
    response = client.post('/api/save_assignment', 
                          json=test_data,
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Missing required fields' in data['error']

def test_save_assignment_no_data(client):
    """Test assignment creation with no data."""
    # Send a request with no JSON data
    response = client.post('/api/save_assignment', 
                          data='',  # Empty data
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Failed to save assignment' in data['error'] 