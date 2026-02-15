---
name: API Integration Skill
description: Guidelines for robust API interactions, specifically for PubMed/Entrez.
---

# Robust API Integration

## Overview

Guidelines for building reliable API clients, focused on compliance and stability.

## key Principles

### 1. Rate Limiting

APIs often have strict limits (e.g., PubMed allows 3 requests/sec without API key).

- Use `time.sleep()` to throttle requests.
- Use `Tenacity` or custom retry decorators for exponential backoff on failures.

### 2. Identification

Always identify your client. For PubMed, set `Entrez.email`.

```python
from Bio import Entrez
Entrez.email = "your.email@example.com"
Entrez.tool = "MyToolName"
```

### 3. Error Handling

Handle network errors and API errors gracefully.

```python
try:
    response = requests.get(url)
    response.raise_for_status()
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 429:
        # Rate limit exceeded
        wait_and_retry()
```

### 4. Data Parsing

- Validate JSON schema if possible.
- Handle missing fields gracefully (use `.get()`).
