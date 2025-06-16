from fastapi import FastAPI, HTTPException 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from huggingface_hub import InferenceClient
from static_analysis import run_static_analysis
import re

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_API_TOKEN = "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"

client = InferenceClient(
    model="deepseek-ai/DeepSeek-R1",
    token=HF_API_TOKEN
)

class CodeRequest(BaseModel):
    code: str

def extract_code_block(text: str) -> str:
    """
    Extracts Python code from a text response, handling various formats:
    1. Proper ```python code blocks
    2. Code blocks without language specification (```)
    3. Inline code without block markers
    4. Mixed responses with explanations
    """
    # Clean the text first
    text = text.strip()
    
    # Case 1: Proper ```python code block
    python_blocks = re.findall(r"```python\s*(.*?)\s*```", text, re.DOTALL)
    if python_blocks:
        return python_blocks[0].strip()
    
    # Case 2: Generic ``` code block (might be Python)
    generic_blocks = re.findall(r"```\s*(.*?)\s*```", text, re.DOTALL)
    if generic_blocks:
        # Check if it looks like Python code
        block = generic_blocks[0].strip()
        if any(keyword in block for keyword in 
              ['def ', 'import ', 'class ', 'print(', 'return ', 'if ']):
            return block
    
    # Case 3: No code blocks but code-looking content
    code_lines = []
    in_code_block = False
    
    for line in text.splitlines():
        line = line.strip()
        
        # Toggle code block state
        if line.startswith('```'):
            in_code_block = not in_code_block
            continue
            
        # Include line if in code block or looks like code
        if (in_code_block or 
            re.match(r'^\s*(def |class |import |from |if |for |while |try|except|print\(|return)', line) or
            (line and not line.startswith(('#', '//')) and '=' in line and not line.endswith(':'))):
            code_lines.append(line)
    
    extracted_code = '\n'.join(code_lines).strip()
    
    # Final validation - should contain at least one Python keyword or structure
    if (re.search(r'\b(def|class|import|from|if|for|while|try|except|return)\b', extracted_code) or
        any(c in extracted_code for c in ['=', ':', '(', ')'])):
        return extracted_code
    
    # If nothing found, return empty string
    return ""


def extract_short_explanation(text: str) -> str:
    """
    Format explanation in 'Issue / Cause / Fix' style from non-code part of AI output.
    """
    text = re.sub(r"<.*?>", "", text)  # Remove <think> or similar tags
    non_code_parts = re.split(r"```python.*?```", text, flags=re.DOTALL)

    for part in non_code_parts:
        lines = [line.strip() for line in part.strip().splitlines() if line.strip()]
        if not lines:
            continue

        issue = cause = fix = ""
        for line in lines:
            if not issue and ("problem" in line.lower() or "bug" in line.lower() or "error" in line.lower()):
                issue = line
            elif not cause and ("because" in line.lower() or "due to" in line.lower()):
                cause = line
            elif not fix and ("fix" in line.lower() or "solution" in line.lower() or "change" in line.lower()):
                fix = line
            elif not issue:
                issue = line  # fallback to first available line

        explanation = f"Issue: {issue or 'Not clearly stated.'}\nCause: {cause or 'Not explicitly explained.'}\nFix: {fix or 'Fix applied as per AI.'}"
        return explanation

    return "Issue: Not found.\nCause: Not found.\nFix: Not found."

@app.post("/api/fix-code")
def fix_code(req: CodeRequest):
    prompt = f"""
### Python Buggy Code:
{req.code}

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


    try:
        print("📤 Sending to DeepSeek-R1 (streaming)...")
        stream = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            stream=True
        )

        # Accumulate streamed chunks
        full_response = ""
        for chunk in stream:
            content_piece = chunk.choices[0].delta.content or ""
            full_response += content_piece

        print("✅ Stream complete.")
        fixed_code = extract_code_block(full_response)
        short_explanation = extract_short_explanation(full_response)

        return {
            "fixedCode": fixed_code,
            "shortExplanation": short_explanation
        }

    except Exception as e:
        print("❌ Error during AI stream:", str(e))
        raise HTTPException(status_code=500, detail=f"AI code fixing failed: {str(e)}")

@app.post("/api/static-analysis")
def static_analysis(req: CodeRequest):
    try:
        print("🔍 Static analysis input code:")
        print(req.code)
        results = run_static_analysis(req.code)
        print("✅ Analysis results:", results)
        return results
    except Exception as e:
        print("❌ Static analysis error:", str(e))  # <--- Log this
        raise HTTPException(status_code=500, detail=f"Static analysis failed: {str(e)}")
