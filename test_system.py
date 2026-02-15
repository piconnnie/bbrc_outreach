import requests
import time
import sys

BASE_URL = "http://127.0.0.1:5000/api"

def test_endpoint(endpoint):
    try:
        response = requests.get(f"{BASE_URL}/{endpoint}")
        print(f"GET {endpoint}: {response.status_code}")
        if response.status_code == 200:
            print(response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to connect to {endpoint}: {e}")
        return False

def test_agent_start(agent_name):
    try:
        response = requests.post(f"{BASE_URL}/agents/{agent_name}/start")
        print(f"POST /agents/{agent_name}/start: {response.status_code}")
        print(response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to start agent {agent_name}: {e}")
        return False

if __name__ == "__main__":
    print("Testing Backend API...")
    if not test_endpoint("status"):
        sys.exit(1)
    
    if not test_endpoint("config"):
        print("Warning: Config endpoint failed")

    print("\nTesting Agent Trigger...")
    # Trigger discovery agent
    test_agent_start("discovery")
    
    # We won't wait for completion as it's async, but we verified the trigger works
