import sys
import os
import json
import logging
import datetime

# Add parent directory to path to allow importing config and utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.pubmed_api import PubMedAPI
import yaml

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("DiscoveryAgent")

def load_config():
    with open("config/settings.yaml", "r") as f:
        return yaml.safe_load(f)

def load_keywords():
    with open("config/keywords.json", "r") as f:
        return json.load(f)

def main():
    logger.info("Starting Research Discovery Agent...")
    
    config = load_config()
    keywords = load_keywords()
    
    pubmed = PubMedAPI(email=config['discovery']['email'])
    
    all_papers = []
    
    for keyword in keywords:
        logger.info(f"Searching for: {keyword}")
        papers = pubmed.search_papers(
            query=keyword,
            days_back=config['discovery']['days_back'],
            max_results=config['discovery']['max_results']
        )
        logger.info(f"Found {len(papers)} papers for '{keyword}'")
        all_papers.extend(papers)
        
    # Deduplicate by ID
    unique_papers = {p['id']: p for p in all_papers}.values()
    
    # Save results
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"data/raw_papers/papers_{timestamp}.json"
    
    with open(output_file, "w") as f:
        json.dump(list(unique_papers), f, indent=2)
        
    logger.info(f"Saved {len(unique_papers)} unique papers to {output_file}")

if __name__ == "__main__":
    main()
