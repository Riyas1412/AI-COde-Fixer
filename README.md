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

1. User selects **“Run CodeFix AI”** in VS Code.
2. Code is shown in a Monaco Editor split-panel view.
3. On analysis:
   - **Locally** runs Pylint, Mypy, and Bandit.
   - **Remotely** calls DeepSeek-Coder R1 API with code snippet.
4. Results and AI suggestions are displayed side-by-side.
5. User can apply or tweak suggestions in one click.

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
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   └── ...
│   ├── dist/                 # webpack output
│   ├── media/
│   ├── test/
│   ├── extension.js
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── main.py
│   ├── static_analysis.py
│   ├── requirements.txt
│   ├── source/
│   └── test1.py
│
└── README.md

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
