import requests
import time
import sys
import os
import glob
import json

BASE_URL = "http://127.0.0.1:5000/api"
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

def trigger_agent(name):
    print(f"\n--- Triggering Agent: {name} ---")
    try:
        response = requests.post(f"{BASE_URL}/agents/{name}/start")
        if response.status_code == 200:
            print(f"Agent {name} started successfully.")
            return True
        else:
            print(f"Failed to start agent {name}: {response.text}")
            return False
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return False

def wait_for_file_change(directory, pattern, timeout=60):
    print(f"Watching {directory} for changes...")
    start_time = time.time()
    initial_files = set(glob.glob(os.path.join(directory, pattern)))
    
    while time.time() - start_time < timeout:
        current_files = set(glob.glob(os.path.join(directory, pattern)))
        new_files = current_files - initial_files
        if new_files:
            print(f"New files detected: {new_files}")
            return list(new_files)[0]
        time.sleep(2)
        
    print("Timeout waiting for file changes.")
    return None

def main():
    # 1. Discovery Agent
    if trigger_agent("discovery"):
        print("Waiting for papers...")
        # Discovery agent writes to data/raw_papers/papers_YYYYMMDD_HHMMSS.json
        # It takes some time to fetch from PubMed
        new_file = wait_for_file_change(os.path.join(DATA_DIR, "raw_papers"), "*.json", timeout=120)
        if new_file:
            with open(new_file, 'r') as f:
                papers = json.load(f)
            print(f"Found {len(papers)} papers.")
        else:
            print("Discovery agent did not produce output in time. proceed anyway?")
            
    # 2. Profiling Agent
    if trigger_agent("profiling"):
        print("Waiting for profiles...")
        # Profiling agent updates data/authors/profiles.json or creates new ones
        # It runs quickly on the local file
        time.sleep(10) # Give it some time
        
    # 3. Email Discovery
    if trigger_agent("email"):
        print("Waiting for email discovery...")
        # Email agent updates profiles with email
        time.sleep(10)

    # 4. Validation
    if trigger_agent("validation"):
        print("Waiting for email validation...")
        time.sleep(10)
        
    print("\n--- Pipeline Execution Completed ---")
    
    # Check final results
    profiles_path = os.path.join(DATA_DIR, "authors", "profiles_latest.json") # Assuming agent creates this
    # Actually agents might append to profiles.json, let's check
    
    # Let's list files in authors dir
    files = glob.glob(os.path.join(DATA_DIR, "authors", "*.json"))
    if files:
        latest = max(files, key=os.path.getctime)
        print(f"Latest profiles file: {latest}")
        with open(latest, 'r') as f:
            data = json.load(f)
            emails = [p.get('email') for p in data if p.get('email')]
            print(f"Total Profiles: {len(data)}")
            print(f"Profiles with Email: {len(emails)}")
            if emails:
                print(f"Sample Emails: {emails[:3]}")

if __name__ == "__main__":
    main()
