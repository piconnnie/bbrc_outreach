import sys
import os
import json
import logging
import smtplib
import time
import yaml
from email.message import EmailMessage

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("OutreachAgent")

def load_config():
    with open("config/settings.yaml", "r") as f:
        return yaml.safe_load(f)

def load_template():
    with open("config/templates/cfp_email.txt", "r") as f:
        return f.read()

def load_validated_list():
    input_file = "data/validated_list/ready_to_send.json"
    if not os.path.exists(input_file):
        return []
    with open(input_file, 'r') as f:
        return json.load(f)

def send_email(config, recipient, template):
    msg = EmailMessage()
    
    # Personalize
    body = template.format(
        author_name=recipient['first_name'] or recipient['name'],
        paper_title=recipient['paper_title'],
        journal_name=recipient['journal']
    )
    
    msg.set_content(body)
    msg['Subject'] = config['emailTemplateSubject'] # Should be in config, fallback if not
    msg['From'] = config['outreach']['sender_email']
    msg['To'] = recipient['email']
    
    try:
        if config['outreach']['smtp_port'] == 465:
            server = smtplib.SMTP_SSL(config['outreach']['smtp_server'], 465)
        else:
            server = smtplib.SMTP(config['outreach']['smtp_server'], 587)
            server.starttls()
            
        server.login(config['outreach']['sender_email'], os.environ.get('SMTP_PASSWORD', 'password_placeholder'))
        server.send_message(msg)
        server.quit()
        logger.info(f"Sent email to {recipient['email']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send to {recipient['email']}: {e}")
        return False

def main():
    logger.info("Starting Outreach Agent...")
    
    config = load_config()
    template = load_template()
    candidates = load_validated_list()
    
    if not candidates:
        logger.info("No candidates to email.")
        return

    count = 0
    max_daily = config['outreach']['max_daily_emails']
    
    logger.info(f"Loaded {len(candidates)} candidates. Processing...")
    
    for candidate in candidates:
        if count >= max_daily:
            logger.info("Daily limit reached.")
            break
            
        success = send_email(config, candidate, template)
        
        if success:
            count += 1
            # Log successful send to separate file
            with open("data/logs/sent_emails.csv", "a") as f:
                f.write(f"{datetime.datetime.now()},{candidate['email']}\n")
                
            time.sleep(config['outreach']['delay_seconds'])

if __name__ == "__main__":
    import datetime
    main()
