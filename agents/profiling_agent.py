import sys
import os
import json
import logging
import glob

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ProfilingAgent")

def load_papers():
    # Find the most recent papers file
    list_of_files = glob.glob('data/raw_papers/*.json')
    if not list_of_files:
        logger.warning("No paper files found in data/raw_papers/")
        return []
    
    latest_file = max(list_of_files, key=os.path.getctime)
    logger.info(f"Processing latest file: {latest_file}")
    
    with open(latest_file, 'r') as f:
        return json.load(f)

def extract_authors(papers):
    authors_data = []
    
    for paper in papers:
        for author in paper.get('authors', []):
            # Basic normalization
            first = author.get('first_name', '').strip()
            last = author.get('last_name', '').strip()
            
            if not last:
                continue
                
            full_name = f"{first} {last}".strip()
            
            # Create author profile
            profile = {
                'name': full_name,
                'first_name': first,
                'last_name': last,
                'affiliations': author.get('affiliation', []),
                'paper_title': paper.get('title'),
                'paper_id': paper.get('id'),
                'journal': paper.get('journal'),
                'emails': [] # To be filled by Email Discovery Agent
            }
            authors_data.append(profile)
            
    return authors_data

def main():
    logger.info("Starting Author Profiling Agent...")
    
    papers = load_papers()
    if not papers:
        return

    authors = extract_authors(papers)
    logger.info(f"Extracted {len(authors)} author profiles")
    
    # Save to authors directory
    output_file = "data/authors/profiles_latest.json"
    with open(output_file, 'w') as f:
        json.dump(authors, f, indent=2)
        
    logger.info(f"Saved profiles to {output_file}")

if __name__ == "__main__":
    main()
