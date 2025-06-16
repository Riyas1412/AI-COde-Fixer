import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import "./App.css";
import StaticAnalysisPanel from "./StaticAnalysisPanel.jsx";
import ExplanationPanel from "./ExplanationPanel.jsx";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const vscode = window.acquireVsCodeApi();

async function fetchFixedCode(code) {
  const response = await fetch("http://localhost:4000/api/fix-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) throw new Error("Failed to fetch fix from backend");

  const data = await response.json();
  return { fixedCode: data.fixedCode, explanation: data.shortExplanation };
}

async function fetchStaticAnalysis(code) {
  const response = await fetch("http://localhost:4000/api/static-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) throw new Error("Static analysis failed");
  return await response.json();
}

const App = () => {
  const [originalCode, setOriginalCode] = useState("");
  const [fixedCode, setFixedCode] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fix");
  const [analysisResults, setAnalysisResults] = useState({ pylint: [], mypy: [], bandit: [] });
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      const message = event.data;
      if (message.type === "initialCode") {
        setOriginalCode(message.code);
        setFixedCode("");
      }
    };

    window.addEventListener("message", handleMessage);
    vscode.postMessage({ type: "webviewReady" });

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const runStaticAnalysis = async () => {
      if (activeTab === "analysis" && originalCode) {
        try {
          setAnalysisLoading(true);
          const analysis = await fetchStaticAnalysis(originalCode);
          setAnalysisResults(analysis);
        } catch (err) {
          console.error("Static analysis failed:", err);
          toast.error("❌ Static analysis failed.");
        } finally {
          setAnalysisLoading(false);
        }
      }
    };

    runStaticAnalysis();
  }, [activeTab, originalCode]);

  const handleDebug = async () => {
    try {
      setLoading(true);
      const aiResponse = await fetchFixedCode(originalCode);

      setFixedCode(aiResponse.fixedCode);
      setExplanationText(aiResponse.explanation);
      setActiveTab("fix");

      toast.success("✅ Code debugged successfully!");
    } catch (err) {
      console.error("AI Debug failed:", err);
      toast.error("❌ Debugging failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    setIsEditing(false);
    vscode.postMessage({ type: "applyFix", code: fixedCode });
  };

  const handleReject = () => vscode.postMessage({ type: "closePanel" });
  const handleModify = () => {
    setIsEditing(true);
    setActiveTab("fix");
  };
  const handleSave = () => setIsEditing(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case "fix":
        return fixedCode ? (
          <MonacoEditor
            height="300px"
            language="python"
            value={fixedCode}
            onChange={(value) => setFixedCode(value)}
            options={{
              readOnly: false,
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              theme: "vs-dark",
            }}
          />
        ) : (
          <div className="placeholder-message animate-fade-in">
            🧪 Click "Debug" to see the AI fix here.
          </div>
        );

      case "explanation":
        return <ExplanationPanel explanationText={explanationText} loading={loading} />;

      case "analysis":
        return (
          <StaticAnalysisPanel
            pylint={analysisResults.pylint}
            mypy={analysisResults.mypy}
            bandit={analysisResults.bandit}
            loading={analysisLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <h2 className="title">CodeFix AI</h2>

      <div className="tab-bar">
        <button onClick={handleDebug} disabled={loading} className="debug-btn">
          {loading ? "🔄 Debugging..." : "Debug"}
        </button>
      </div>

      <div className="tab-bar">
        {["fix", "explanation", "analysis"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active tab-btn" : "tab-btn"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "fix"
              ? "🛠 AI Fix"
              : tab === "explanation"
              ? "📝 Explanation"
              : "📋 Static Analysis"}
          </button>
        ))}
      </div>

      <div className="fix-container animate-fade-in">{renderTabContent()}</div>

      {activeTab === "fix" && (
        <div className="button-group animate-fade-in">
          <button className="accept-btn" onClick={handleAccept}>
            ✅ Accept
          </button>
          <button className="reject-btn" onClick={handleReject}>
            ❌ Reject
          </button>
          {isEditing ? (
            <button className="modify-btn" onClick={handleSave}>
              💾 Save
            </button>
          ) : (
            <button className="modify-btn" onClick={handleModify}>
              ✏ Modify
            </button>
          )}
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        transition={Slide}
      />
    </div>
  );
};

export default App;
