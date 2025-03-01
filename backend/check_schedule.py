import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
supabase = create_client(supabase_url, supabase_key)

# Get the latest assignment
assignment_response = supabase.table('assignments').select('*').order('id', desc=True).limit(1).execute()
if assignment_response.data:
    assignment = assignment_response.data[0]
    print(f'Latest assignment: {assignment["name"]} (ID: {assignment["id"]})')
    
    # Get milestones for this assignment
    milestones_response = supabase.table('milestones').select('*').eq('assignment_id', assignment['id']).execute()
    if milestones_response.data:
        print(f'Found {len(milestones_response.data)} milestones:')
        for milestone in milestones_response.data:
            print(f'  - Task: {milestone["task"]}')
            print(f'    Period: {milestone["period_start"]} to {milestone["period_end"]}')
            print(f'    Cumulative Goal: {milestone["cumulative_goal"]} hours')
    else:
        print('No milestones found')
else:
    print('No assignments found') 