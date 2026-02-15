import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data/authors.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS authors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            affiliations TEXT,
            paper_title TEXT,
            paper_id TEXT,
            journal TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(email)
        )
    ''')
    conn.commit()
    conn.close()

def add_author(author_data):
    """
    Upserts an author into the database.
    author_data: dict containing name, email, etc.
    """
    if not author_data.get('emails'):
        return False
        
    conn = get_db_connection()
    c = conn.cursor()
    
    # Flatten emails if list, take first one for main email field for simple export
    # Or we could have a separate emails table. For now, flat is fine for "export csv".
    email = author_data['emails'][0] if isinstance(author_data['emails'], list) and author_data['emails'] else author_data.get('email')
    
    if not email:
        conn.close()
        return False

    affiliations = json.dumps(author_data.get('affiliations', []))
    
    try:
        c.execute('''
            INSERT OR REPLACE INTO authors (name, email, affiliations, paper_title, paper_id, journal)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            author_data.get('name'),
            email,
            affiliations,
            author_data.get('paper_title'),
            author_data.get('paper_id'),
            author_data.get('journal')
        ))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_all_authors():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM authors')
    authors = c.fetchall()
    conn.close()
    return [dict(a) for a in authors]

def export_to_csv():
    import csv
    import io
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT name, email, affiliations, paper_title, paper_id, journal FROM authors')
    rows = c.fetchall()
    conn.close()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Name', 'Email', 'Affiliations', 'Paper Title', 'Paper ID', 'Journal'])
    
    for row in rows:
        writer.writerow(row)
        
    return output.getvalue()
