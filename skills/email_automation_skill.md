---
name: Email Automation Skill
description: Best practices for sending automated emails using Python's smtplib and email libraries.
---

# Email Automation using Python

## Overview

This skill outlines the best practices for sending emails programmatically, including HTML content, attachments, and handling SMTP connections securely.

## Dependencies

- `smtplib` (Standard library)
- `email` (Standard library)
- `dnspython` (For validation)

## Best Practices

### 1. Connection Management

Always use a context manager (`with` statement) or `try/finally` block to ensure the SMTP connection is closed, even if errors occur.

```python
import smtplib
import ssl

context = ssl.create_default_context()
with smtplib.SMTP_SSL("smtp.example.com", 465, context=context) as server:
    server.login(user, password)
    server.send_message(msg)
```

### 2. Message Construction

Use `EmailMessage` or `MIMEMultipart` for complex emails. preferred `EmailMessage` for modern Python (3.6+).

```python
from email.message import EmailMessage

msg = EmailMessage()
msg.set_content("Plain text content")
msg.add_alternative("<b>HTML</b> content", subtype='html')
msg["Subject"] = "Subject"
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"
```

### 3. Rate Limiting

Respect the limits of the SMTP provider. Implement pauses between batch sends.

```python
import time
for recipient in recipients:
    send_email(recipient)
    time.sleep(1) # 1 second delay
```

### 4. Security

- Never hardcode passwords. Use environment variables.
- Always use SSL/TLS.
