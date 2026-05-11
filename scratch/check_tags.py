
import sys

def check_balance(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
    
    stack = []
    for i, line in enumerate(lines):
        # Simplistic tag finder
        start = 0
        while True:
            idx = line.find('<', start)
            if idx == -1: break
            
            end_idx = line.find('>', idx)
            if end_idx == -1: break
            
            tag = line[idx+1:end_idx].split()[0]
            if tag.startswith('/'):
                tag_name = tag[1:]
                if stack and stack[-1][0] == tag_name:
                    stack.pop()
                else:
                    print(f"Mismatch at line {i+1}: closing {tag_name} but stack is {stack[-5:]}")
            elif not tag.endswith('/') and tag in ['div', 'form', 'select', 'Link', 'Autocomplete', 'button', 'input']:
                # Input is self closing in some JSX but here let's assume it might not be if it's not />
                if not line[idx:end_idx+1].endswith('/>') and tag != 'input':
                    stack.append((tag, i+1))
            
            start = end_idx + 1
            
    print(f"Remaining stack: {stack}")

check_balance(sys.argv[1])
