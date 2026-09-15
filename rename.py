import os
import re

def replace_in_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {path}")

replacements = [
    ('نكسس', 'بارتو'),
    ('Nexus KSA', 'Parto KSA'),
    ('Nexus is Saudi Arabia', 'Parto is Saudi Arabia'),
    ('Nexus Marketplace Inc.', 'Parto Marketplace Inc.'),
    ('.nexus.io', '.parto.com'),
    ('authorize Nexus', 'authorize Parto'),
    ('Nexus AI Assistant', 'Parto AI Assistant'),
    ('Nexus', 'Parto'),
    ('NEXUS', 'PARTO')
]

paths = [
    'frontend/src/app/[locale]/layout.tsx',
    'frontend/src/app/[locale]/admin/page.tsx',
    'frontend/src/app/[locale]/portal/page.tsx',
    'frontend/src/app/[locale]/register/page.tsx',
    'frontend/src/components/AIChatWidget.tsx'
]

for p in paths:
    if os.path.exists(p):
        replace_in_file(p, replacements)
    else:
        print(f"Not found: {p}")
