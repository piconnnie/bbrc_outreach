import requests
import sys

BASE_URL = "http://127.0.0.1:5000/api"

def test_sync():
    print("Triggering Sync...")
    try:
        response = requests.post(f"{BASE_URL}/authors/sync")
        print(f"Sync Status: {response.status_code}")
        print(response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"Sync failed: {e}")
        return False

def test_export():
    print("Testing Export...")
    try:
        response = requests.get(f"{BASE_URL}/authors/export")
        print(f"Export Status: {response.status_code}")
        content = response.text
        line_count = len(content.splitlines())
        print(f"Export Lines: {line_count}")
        if line_count > 1:
            print("First 2 lines:")
            print("\n".join(content.splitlines()[:2]))
            return True
        else:
            print("Export appears empty.")
            return False
    except Exception as e:
        print(f"Export failed: {e}")
        return False

if __name__ == "__main__":
    if test_sync():
        test_export()
