import sys
import os
import json
import logging
import time
import glob

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("LoggingAgent")

def generate_summary():
    summary = {
        'timestamp': time.ctime(),
        'papers_found': 0,
        'authors_profiled': 0,
        'emails_found': 0,
        'emails_validated': 0,
        'emails_sent': 0
    }
    
    # Check papers
    paper_files = glob.glob("data/raw_papers/*.json")
    if paper_files:
        latest = max(paper_files, key=os.path.getctime)
        with open(latest, 'r') as f:
            summary['papers_found'] = len(json.load(f))
            
    # Check authors
    if os.path.exists("data/authors/profiles_latest.json"):
        with open("data/authors/profiles_latest.json", 'r') as f:
            summary['authors_profiled'] = len(json.load(f))
            
    # Check emails found
    if os.path.exists("data/authors/profiles_with_emails.json"):
        with open("data/authors/profiles_with_emails.json", 'r') as f:
            data = json.load(f)
            summary['emails_found'] = sum(1 for p in data if p.get('emails'))
            
    # Check validated
    if os.path.exists("data/validated_list/ready_to_send.json"):
        with open("data/validated_list/ready_to_send.json", 'r') as f:
            summary['emails_validated'] = len(json.load(f))
            
    # Check sent
    if os.path.exists("data/logs/sent_emails.csv"):
        with open("data/logs/sent_emails.csv", 'r') as f:
            summary['emails_sent'] = sum(1 for line in f)
            
    return summary

def main():
    logger.info("Starting Logging Agent...")
    
    # In a real loop, this would run every X minutes
    # For now, we run once to generate a snapshot
    
    summary = generate_summary()
    
    print("\n=== SYSTEM STATUS REPORT ===")
    print(json.dumps(summary, indent=2))
    print("============================")
    
    # Append to history log
    with open("data/logs/execution.log", "a") as f:
        f.write(json.dumps(summary) + "\n")

if __name__ == "__main__":
    main()
