---
name: Data Processing Skill
description: Best practices for handling biological data and logs with Pandas.
---

# Pandas Data Processing

## Overview

Efficiently manage list-based data (authors, papers) using Pandas.

## Best Practices

### 1. JSON Normalization

When loading nested JSON (like author lists inside papers), use `pd.json_normalize`.

```python
import pandas as pd
import json

with open('papers.json') as f:
    data = json.load(f)

# Flatten authors
df_authors = pd.json_normalize(data, record_path=['authors'], meta=['id', 'title'])
```

### 2. Deduplication

Remove duplicates based on specific subsets (e.g., email address).

```python
df_clean = df.drop_duplicates(subset=['email'], keep='first')
```

### 3. CSV I/O

- Use `index=False` when saving to avoid creating an unnamed index column.
- Use `mode='a'` to append to logs, but write headers only if file doesn't exist.

```python
import os
header = not os.path.exists('log.csv')
df.to_csv('log.csv', mode='a', header=header, index=False)
```
