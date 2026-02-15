import sys
import os
import json
import logging
import re

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("EmailDiscoveryAgent")

EMAIL_REGEX = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

def load_profiles():
    # Load the output from Agent 2
    input_file = "data/authors/profiles_latest.json"
    if not os.path.exists(input_file):
        logger.warning(f"{input_file} not found.")
        return []
    
    with open(input_file, 'r') as f:
        return json.load(f)

def find_emails(text):
    if not text:
        return []
    return list(set(re.findall(EMAIL_REGEX, text)))

def process_profiles(profiles):
    processed = []
    
    for profile in profiles:
        emails = set(profile.get('emails', []))
        
        # Check affiliations for emails
        for affiliation in profile.get('affiliations', []):
            found = find_emails(affiliation)
            emails.update(found)
            
        profile['emails'] = list(emails)
        
        # Only keep profiles with emails for the next stage? 
        # Requirement said "Candidate email list per author". 
        # We keep all, but maybe mark those with emails.
        if emails:
            processed.append(profile)
            
    return processed

def main():
    logger.info("Starting Email Discovery Agent...")
    
    profiles = load_profiles()
    if not profiles:
        return

    logger.info(f"Loaded {len(profiles)} profiles.")
    
    enriched_profiles = process_profiles(profiles)
    logger.info(f"Found emails for {len(enriched_profiles)} authors.")
    
    # Save results
    output_file = "data/authors/profiles_with_emails.json"
    with open(output_file, 'w') as f:
        json.dump(enriched_profiles, f, indent=2)
        
    logger.info(f"Saved {len(enriched_profiles)} enriched profiles to {output_file}")

if __name__ == "__main__":
    main()
