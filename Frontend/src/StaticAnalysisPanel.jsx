import React from "react";
import PropTypes from "prop-types";
import "./App.css";

const StaticAnalysisPanel = ({ pylint = [], mypy = [], bandit = [], loading }) => {
  const getSeverityDetails = (severity) => {
    const normalizedSeverity = severity.toLowerCase();
    
    switch(normalizedSeverity) {
      case "error":
      case "high":
      case "critical":
        return { color: "#ff4444", icon: "❌" };
      case "warning":
      case "medium":
        return { color: "#ff9900", icon: "⚠️" };
      case "info":
      case "low":
        return { color: "#4CAF50", icon: "ℹ️" };
      default:
        return { color: "#666666", icon: "🔍" };
    }
  };

  const renderIssues = (issues, toolName) => {
    if (!Array.isArray(issues)) {
      return (
        <div className="error-message">
          {toolName} analysis failed to run. Please check the backend service.
        </div>
      );
    }

    if (issues.length === 0) {
      return (
        <div className="success-message">
          No issues found in {toolName.toLowerCase()} analysis ✅
        </div>
      );
    }

    return (
      <ul className="issue-list">
        {issues.map((item, index) => {
          const { color, icon } = getSeverityDetails(item.severity);
          return (
            <li key={`${toolName}-${index}`} style={{ color }}>
              <span className="issue-icon">{icon}</span>
              <span className="issue-content">
                <span className="line-number">Line {item.line || 0}:</span>
                {item.message}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="analysis-box loading-state">
        <h4>📋 Analyzing Code...</h4>
        <div className="spinner-container">
          <div className="loading-spinner" />
          <p>Running static analysis tools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-box">
      <h4>📋 Static Analysis Results</h4>

      <div className="tool-section">
        <div className="tool-header pylint-header">
          <h5>🔧 Pylint Analysis</h5>
          <span className="tool-subtitle">Code Quality &amp; Style Checks</span>
        </div>
        {renderIssues(pylint, "Pylint")}
      </div>

      <div className="tool-section">
        <div className="tool-header mypy-header">
          <h5>🔢 Mypy Analysis</h5>
          <span className="tool-subtitle">Type Checking &amp; Validation</span>
        </div>
        {renderIssues(mypy, "Mypy")}
      </div>

      <div className="tool-section">
        <div className="tool-header bandit-header">
          <h5>🛡 Bandit Analysis</h5>
          <span className="tool-subtitle">Security Vulnerability Scanning</span>
        </div>
        {renderIssues(bandit, "Bandit")}
      </div>
    </div>
  );
};

StaticAnalysisPanel.propTypes = {
  pylint: PropTypes.arrayOf(
    PropTypes.shape({
      line: PropTypes.number,
      message: PropTypes.string,
      severity: PropTypes.string,
    })
  ),
  mypy: PropTypes.arrayOf(
    PropTypes.shape({
      line: PropTypes.number,
      message: PropTypes.string,
      severity: PropTypes.string,
    })
  ),
  bandit: PropTypes.arrayOf(
    PropTypes.shape({
      line: PropTypes.number,
      message: PropTypes.string,
      severity: PropTypes.string,
    })
  ),
  loading: PropTypes.bool.isRequired,
};

export default StaticAnalysisPanel;