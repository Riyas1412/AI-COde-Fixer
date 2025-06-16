import tempfile
import subprocess
import json
import os
import ast
import platform
import time
import re
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from concurrent.futures import TimeoutError as FuturesTimeoutError


def parse_mypy_output(output: str) -> List[Dict[str, Any]]:
    pattern = re.compile(r'^(.*?):(\d+):\s*(error|warning):\s*(.*?)(?:\s*\[.*\])?$')
    results = []
    for line in output.splitlines():
        m = pattern.match(line)
        if not m:
            continue
        _, lineno, severity, msg = m.groups()
        results.append({
            "line": int(lineno),
            "message": msg,
            "severity": severity.lower()
        })
    return results


def run_bandit(file_path: str) -> List[Dict[str, Any]]:
    try:
        print(f"📄 Bandit scanning: {file_path}")
        with open(file_path, "r") as f:
            print(f"📄 File content:\n{f.read()}")

        cmd = ["bandit", "-vv", "-f", "json", "-ll", file_path]
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=15,
            text=True
        )

        print(f"📤 Bandit stdout:\n{result.stdout}")
        print(f"📥 Bandit stderr:\n{result.stderr}")

        if result.returncode in [0, 1]:
            try:
                data = json.loads(result.stdout)
                return [
                    {
                        "line": issue.get("line_number", 0),
                        "message": issue.get("issue_text", ""),
                        "severity": issue.get("issue_severity", "low").lower()
                    }
                    for issue in data.get("results", [])
                ]
            except json.JSONDecodeError:
                return [{"line": 0, "message": "Bandit output parse error", "severity": "error"}]

        return [{
            "line": 0,
            "message": f"Bandit error ({result.returncode}): {result.stderr.strip() or 'See logs'}",
            "severity": "error"
        }]
    except Exception as e:
        return [{"line": 0, "message": f"Bandit failed: {str(e)}", "severity": "error"}]


def run_static_analysis(code: str) -> Dict[str, List[Dict[str, Any]]]:
    results = {"pylint": [], "mypy": [], "bandit": []}
    file_path = None

    try:
        with tempfile.NamedTemporaryFile(mode="w+", suffix=".py", delete=False) as temp_file:
            temp_file.write(code)
            file_path = temp_file.name

        if platform.system() == "Windows":
            time.sleep(1)
            try:
                os.system(f'attrib -R "{file_path}"')
            except Exception:
                pass

        def run_pylint():
            try:
                cmd = [
                    "pylint",
                    file_path,
                    "-f", "json",
                    "--disable=all",
                    "--enable=E,W",
                    "--unsafe-load-any-extension=y",
                    "--persistent=no"
                ]
                result = subprocess.run(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=15,
                    text=True,
                    shell=(platform.system() == "Windows")
                )
                if result.stderr.strip():
                    return [{"line": 0, "message": f"Pylint: {result.stderr.strip()}", "severity": "error"}]
                try:
                    output = json.loads(result.stdout)
                    return [
                        {
                            "line": issue.get("line", 0),
                            "message": issue.get("message", ""),
                            "severity": issue.get("type", "info").lower()
                        } for issue in output
                    ]
                except json.JSONDecodeError:
                    return [{"line": 0, "message": "Pylint output parse error", "severity": "error"}]
            except Exception as e:
                return [{"line": 0, "message": f"Pylint crashed: {str(e)}", "severity": "error"}]

        def run_mypy():
            try:
                cmd = [
                    "mypy",
                    "--hide-error-context",
                    "--show-error-codes",
                    "--no-color-output",
                    "--no-error-summary",
                    "--ignore-missing-imports",
                    "--no-incremental",
                    "--python-version", "3.9",
                    file_path
                ]

                print(f"Running mypy on file: {file_path}")

                result = subprocess.run(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    timeout=10,
                    text=True
                )
                return parse_mypy_output(result.stdout)
            except Exception as e:
                return [{"line": 0, "message": f"Mypy failed: {str(e)}", "severity": "error"}]

        tools = {
            "pylint": run_pylint,
            "mypy": run_mypy,
            "bandit": lambda: run_bandit(file_path)
        }

        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = {executor.submit(func): name for name, func in tools.items()}
            for future in as_completed(futures):
                name = futures[future]
                try:
                    results[name] = future.result(timeout=20)
                except FuturesTimeoutError:
                    results[name] = [{"line": 0, "message": f"{name} timed out", "severity": "error"}]
                except Exception as e:
                    results[name] = [{"line": 0, "message": f"{name} failed: {str(e)}", "severity": "error"}]

    finally:
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Warning: Failed to delete temp file: {str(e)}")

    return results
