# test_static_analysis.py

import os  # unused import to trigger pylint
import subprocess

def insecure_function():
    user_input = input("Enter a shell command: ")
    # Bandit should warn about using shell=True with user input (injection risk)
    subprocess.call(user_input, shell=True)  # nosec

def add_numbers(a: int, b: int) -> int:
    return a + b

x = "hello"
y = 5

# Mypy should catch this type mismatch
result = add_numbers(x, y)

print(result)

### Task:
1. Fix the code. Output ONLY the corrected code first inside a Python code block:
```python
# your fixed code here
2. After the code block, return a three-line explanation **in plain text**:

Issue: ...
Cause: ...
Fix: ...

Do NOT mix explanations inside the code block.Do not skip code.
"""