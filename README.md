# 🚀 CodeFix AI – AI-Powered Code Debugger

CodeFix AI is a **Visual Studio Code extension** designed to help developers **automatically detect and fix errors in Python code** using a combination of **static analysis** tools and an advanced **AI model (DeepSeek-Coder R1)**. It integrates seamlessly into the developer workflow, running locally for privacy and performance while leveraging AI through a secure Hugging Face interface.

---

## 🔍 Features

- 🧠 **AI Suggestions**: Fix syntax and logic errors with AI-powered patch generation via DeepSeek-Coder R1.
- 🛠️ **Static Analysis**: Integrated support for Pylint, Mypy, and Bandit for style, type, and security checks.
- 🧩 **VS Code Extension**: Fully functional React-based frontend with Monaco Editor embedded inside a Webview panel.
- 🔁 **Interactive Workflow**: Accept, reject, or modify AI-generated fixes directly within VS Code.
- 🔒 **Privacy-First**: Only minimal code snippets are sent over HTTPS; all static analysis runs locally.

---

## 📐 Architecture Overview

### 🖥️ Frontend (VS Code Extension)

- **Tech Stack**: JavaScript (ES6), React, Monaco Editor, Webpack, Babel
- **UI Components**:
  - Original Code Panel (Monaco)
  - Static Analysis Results
  - AI Fix Suggestions + Explanations
  - Action Buttons: Accept, Reject, Modify

### 🧠 Backend (FastAPI)

- **Tech Stack**: Python 3, FastAPI, Uvicorn
- **Endpoints**:
  - `/analyze`: Run Pylint, Mypy, and Bandit on the submitted code.
  - `/suggest`: Query Hugging Face’s DeepSeek-Coder R1 API for fixes and explanations.
- **Design**: Stateless processing, no code is stored. Linters run in isolated subprocesses.

---

## ⚙️ Installation Requirements

### Developer Machine

- **VS Code** (with Webview API support)
- **Node.js** (for frontend bundling)
- **Python 3.7+** (64-bit recommended)
- **OS**: Windows, Linux, or macOS
- **Internet**: Required for DeepSeek-Coder R1 API (minimal usage)

### Dependencies

**JavaScript (Frontend)**:
- `react`, `react-dom`, `webpack`, `babel`, `monaco-editor`, etc.

**Python (Backend)**:
```bash
fastapi
uvicorn
pylint
mypy
bandit
requests
```

---

## 🧪 How It Works
Upon activating the “Run CodeFix AI” command in Visual Studio Code, the extension launches an integrated interface powered by Monaco Editor and organized into three functional tabs that streamline the debugging workflow:

### 🔧 AI Fix Tab
Displays the AI-generated corrected version of the user's code in a read-only Monaco Editor.

Provides intuitive action buttons:

- **Accept**: Automatically applies the AI-suggested fix into the main editor.

- **Reject**: Closes the extension and discards the proposed fix.

- **Modify**: Enables editing within the AI fix panel, allowing users to refine the suggestion manually. Once modified, users can still apply the changes using the Accept button.

This tab ensures full control and flexibility when reviewing and applying code fixes.

### 💡 Explanation Tab
Offers a structured, human-readable breakdown of the detected issue:

- **Issue**: Identifies the specific bug or problem in the original code.

- **Cause**: Explains the underlying reason or logic flaw that led to the issue.

- **Fix**: Describes how the AI-generated solution resolves the problem.

This educational breakdown helps users not only fix code but also understand the rationale behind each correction.

### 🔍 Static Analysis Tab
Integrates static analysis tools (Pylint, Mypy, and Bandit) to examine the submitted code for:

- **Syntax and logical errors**

- **Type inconsistencies**

- **Security vulnerabilities**

  Results are displayed in an interactive panel, showing:

- **Line numbers**

- **Severity levels**

- **Descriptive messages for each issue**

  This helps ensure adherence to Python best practices and enhances code reliability.

---

## 💡 Use Cases

- **Educational**: Helps beginners understand code issues with explanations.
- **Productivity**: Reduces debugging time through automation.
- **Quality Assurance**: Enforces consistent style and security checks.
- **Team Standards**: Applies standardized code fixes across teams.

---

## 📊 System Performance

- Memory Usage: ~50–100 MB
- AI Model: DeepSeek-Coder R1 runs remotely (no local model required)
- No GPU required
- FastAPI is stateless and lightweight

---

## 🧱 Project Structure

```
codefix-ai/
│
├── frontend/
│   ├── extension.js
│   ├── package.json
│   ├── dist/
|       ├──index.html
│   ├── media/
│   ├── src/
|       ├──App.jsx
|       ├──ExplanationPanel.jsx
|       ├──StaticAnalysisPanel.jsx
|       ├──App.css
│   └── test/
├── backend/
│   ├── main.py
│   ├── static_analysis.py
│   ├── requirements.txt
│   ├── source/
└── README.md
```

---

## 📚 References

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Pylint](https://en.wikipedia.org/wiki/Pylint)
- [Mypy](https://mypy-lang.org)
- [Bandit](https://bandit.readthedocs.io)
- [Monaco Editor](https://github.com/microsoft/monaco-editor)
- [DeepSeek-Coder R1 – Hugging Face](https://huggingface.co/deepseek-ai/deepseek-coder-1.3b)

---

## 📌 License

This project is for academic purposes. All external libraries and APIs are used under their respective licenses.
