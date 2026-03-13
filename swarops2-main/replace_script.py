import os
import re

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False
        
    if 'emergent' not in content.lower():
        return False
        
    # Replace preserving case
    def replacer(match):
        word = match.group()
        if word.islower():
            return 'swarmOps'
        elif word.isupper():
            return 'SWARMOPS'
        elif word.istitle():
            return 'SwarmOps'
        else:
            return 'swarmOps'
            
    new_content = re.sub(r'(?i)emergent', replacer, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def walk_and_replace(start_dir):
    modified = 0
    for root, dirs, files in os.walk(start_dir):
        # Exclude common large/ignored directories
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', 'venv', '__pycache__')]
        
        for file in files:
            # Only process reasonable extensions
            if file.endswith(('.py', '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.md', '.txt', '.yml', '.yaml', '.sh', '.bat', '.env')):
                filepath = os.path.join(root, file)
                if replace_in_file(filepath):
                    print(f"Modified: {filepath}")
                    modified += 1
    print(f"Total files modified: {modified}")

if __name__ == "__main__":
    # Walk ROOT, frontend, and backend separately to be safe
    base_dir = r"c:\Users\Navneet\Downloads\swarops2-main\swarops2-main"
    walk_and_replace(base_dir)
