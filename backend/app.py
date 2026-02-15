import sys
import os
import json
import yaml
import subprocess
import threading
from flask import Flask, jsonify, request, Response
import flask
from flask_cors import CORS
import glob

# Add parent directory to path to allow importing agents if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "../config/settings.yaml")
KEYWORDS_PATH = os.path.join(BASE_DIR, "../config/keywords.json")
LOG_DIR = os.path.join(BASE_DIR, "../data/logs")

def load_yaml(path):
    if os.path.exists(path):
        with open(path, 'r') as f:
            return yaml.safe_load(f)
    return {}

def save_yaml(path, data):
    with open(path, 'w') as f:
        yaml.dump(data, f)

def run_agent_script(agent_name):
    """Runs an agent script in a separate thread/process"""
    script_map = {
        "discovery": "agents/discovery_agent.py",
        "profiling": "agents/profiling_agent.py",
        "email": "agents/email_discovery.py",
        "validation": "agents/validation_agent.py",
        "outreach": "agents/outreach_agent.py",
        "logging": "agents/logging_agent.py"
    }
    
    script_path = script_map.get(agent_name)
    if not script_path:
        return False, "Unknown agent"
        
    full_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), script_path)
    
    def run():
        subprocess.run([sys.executable, full_path], check=False)
        
    thread = threading.Thread(target=run)
    thread.start()
    return True, "Agent started"

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({"status": "online", "version": "1.0.0"})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    # Read latest stats from execution log or calculate on fly
    stats = {
        "papers_found": 0,
        "authors_profiled": 0,
        "emails_sent": 0
    }
    
    # Simple counting logic (similar to logging agent)
    try:
        # Papers
        paper_files = glob.glob(os.path.join(BASE_DIR, "../data/raw_papers", "*.json"))
        if paper_files:
            latest = max(paper_files, key=os.path.getctime)
            with open(latest, 'r') as f:
                stats['papers_found'] = len(json.load(f))
        
        # Authors
        authors_path = os.path.join(BASE_DIR, "../data/authors/profiles_latest.json")
        if os.path.exists(authors_path):
             with open(authors_path, 'r') as f:
                stats['authors_profiled'] = len(json.load(f))

        # Emails Sent
        sent_path = os.path.join(BASE_DIR, "../data/logs/sent_emails.csv")
        if os.path.exists(sent_path):
            with open(sent_path, 'r') as f:
                stats['emails_sent'] = sum(1 for line in f)

    except Exception as e:
        print(f"Error reading stats: {e}")
        
    return jsonify(stats)

@app.route('/api/config', methods=['GET'])
def get_config():
    config = load_yaml(CONFIG_PATH)
    if 'discovery' not in config:
        config['discovery'] = {}
        
    if os.path.exists(KEYWORDS_PATH):
        with open(KEYWORDS_PATH, 'r') as f:
            config['discovery']['keywords'] = json.load(f)
    return jsonify(config)

@app.route('/api/config', methods=['POST'])
def update_config():
    data = request.json
    
    # Extract keywords from discovery section if present
    keywords = None
    if 'discovery' in data and 'keywords' in data['discovery']:
        keywords = data['discovery'].pop('keywords')
    
    # Update settings.yaml
    current_config = load_yaml(CONFIG_PATH)
    
    # Ensure sections exist
    if 'discovery' not in current_config: current_config['discovery'] = {}
    if 'outreach' not in current_config: current_config['outreach'] = {}

    if 'discovery' in data:
        current_config['discovery'].update(data['discovery'])
    if 'outreach' in data:
        current_config['outreach'].update(data['outreach'])
        
    save_yaml(CONFIG_PATH, current_config)
    
    # Update keywords.json
    if keywords is not None:
        with open(KEYWORDS_PATH, 'w') as f:
            json.dump(keywords, f, indent=2)
            
    return jsonify({"status": "updated"})

@app.route('/api/agents/<name>/start', methods=['POST'])
def start_agent(name):
    success, msg = run_agent_script(name)
    if success:
        return jsonify({"status": "started", "message": msg})
    return jsonify({"status": "error", "message": msg}), 400

import database

# Initialize DB
database.init_db()

@app.route('/api/authors/sync', methods=['POST'])
def sync_authors():
    try:
        profiles_path = os.path.join(BASE_DIR, "../data/authors/profiles_with_emails.json")
        if os.path.exists(profiles_path):
            with open(profiles_path, 'r') as f:
                profiles = json.load(f)
                count = 0
                for p in profiles:
                    if database.add_author(p):
                        count += 1
                return jsonify({"status": "synced", "added": count})
        return jsonify({"status": "error", "message": "No profiles found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/authors', methods=['GET'])
def get_authors():
    try:
        authors = database.get_all_authors()
        return jsonify(authors)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/authors/export', methods=['GET'])
def export_authors():
    try:
        csv_data = database.export_to_csv()
        return flask.Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=authors.csv"}
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        log_file = os.path.join(LOG_DIR, "bbrc_agent.log")
        if not os.path.exists(log_file):
            return jsonify({"logs": ["Log file not found."]})
            
        with open(log_file, 'r') as f:
            # Read last 100 lines
            lines = f.readlines()[-100:]
            return jsonify({"logs": [l.strip() for l in lines]})
    except Exception as e:
        return jsonify({"items": [], "error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
