import sys
import os
import json
import logging
import csv
import dns.resolver

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ValidationAgent")

HISTORY_FILE = "data/logs/history.csv"

def load_candidates():
    input_file = "data/authors/profiles_with_emails.json"
    if not os.path.exists(input_file):
        return []
    with open(input_file, 'r') as f:
        return json.load(f)

def load_history():
    history = set()
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            reader = csv.reader(f)
            # Skip header if exists (check logic needed or just try/except)
            for row in reader:
                if len(row) > 1:
                    history.add(row[1]) # Assuming email is 2nd column
    return history

def validate_domain(email):
    domain = email.split('@')[1]
    try:
        dns.resolver.resolve(domain, 'MX')
        return True
    except:
        return False

def validate_and_dedup(candidates, history):
    validated_list = []
    
    for candidate in candidates:
        valid_emails = []
        for email in candidate.get('emails', []):
            email = email.lower().strip()
            
            # Simple syntax check
            if not email or '@' not in email:
                continue
                
            # Deduplication
            if email in history:
                logger.info(f"Skipping {email} - already in history")
                continue
                
            # Domain validation (Optional: enable for strict mode)
            # if not validate_domain(email):
            #     logger.warning(f"Invalid domain for {email}")
            #     continue
            
            valid_emails.append(email)
            
        if valid_emails:
            # Create a clean record for outreach
            clean_record = {
                'name': candidate['name'],
                'first_name': candidate['first_name'],
                'email': valid_emails[0], # Pick first valid for now
                'paper_title': candidate['paper_title'],
                'journal': candidate['journal']
            }
            validated_list.append(clean_record)
            
    return validated_list

def main():
    logger.info("Starting Validation Agent...")
    
    candidates = load_candidates()
    history = load_history()
    
    logger.info(f"Loaded {len(candidates)} candidates and {len(history)} history records.")
    
    final_list = validate_and_dedup(candidates, history)
    
    output_file = "data/validated_list/ready_to_send.json"
    with open(output_file, 'w') as f:
        json.dump(final_list, f, indent=2)
        
    logger.info(f"Prepared {len(final_list)} authors for outreach in {output_file}")

if __name__ == "__main__":
    main()
