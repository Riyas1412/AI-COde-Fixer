import React from "react";
import "./App.css";

const ExplanationPanel = ({ explanationText, loading }) => {
  const parseExplanation = (text) => {
    if (!text) return null;
    
    // Split into sections if there are clear labels
    const sections = text.split(/(Issue:|Cause:|Fix:)/).filter(Boolean);
    
    return sections.reduce((acc, section, index) => {
      if (section.match(/Issue:|Cause:|Fix:/)) {
        acc.push({
          type: section.replace(':', '').toLowerCase(),
          content: sections[index + 1]?.trim() || ''
        });
      }
      return acc;
    }, []);
  };

  const explanationSections = parseExplanation(explanationText);

  return (
    <div className="explanation-container">
      {loading ? (
        <div className="spinner"></div>
      ) : explanationSections ? (
        <div className="explanation-content">
          {explanationSections.map((section, index) => (
            <div key={index} className={`explanation-section ${section.type}`}>
              <div className="section-header">
                {section.type === 'issue' && '🚨 Issue'}
                {section.type === 'cause' && '🔍 Cause'}
                {section.type === 'fix' && '🛠 Fix'}
              </div>
              <div className="section-content">{section.content}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-explanation">
          No explanation available. Try debugging your code first.
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;