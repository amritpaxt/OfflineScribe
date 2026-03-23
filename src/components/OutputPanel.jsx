/**
 * OutputPanel.jsx
 * Right panel component for displaying AI-generated output
 */

import React, { useRef } from 'react';

export function OutputPanel({ output, isLoading, error }) {
  const outputRef = useRef(null);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output).then(() => {
        alert('Copied to clipboard!');
      });
    }
  };

  const handleExportTxt = () => {
    if (output) {
      const element = document.createElement('a');
      const file = new Blob([output], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `offlinescribe-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleExportMd = () => {
    if (output) {
      const element = document.createElement('a');
      const file = new Blob([output], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = `offlinescribe-${Date.now()}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="output-panel">
      <div className="panel-header">
        <h2>Output</h2>
        {output && !isLoading && (
          <div className="output-actions">
            <button onClick={handleCopy} title="Copy to clipboard" className="action-btn">
              📋 Copy
            </button>
            <button onClick={handleExportTxt} title="Export as .txt" className="action-btn">
              📄 .txt
            </button>
            <button onClick={handleExportMd} title="Export as .md" className="action-btn">
              📝 .md
            </button>
          </div>
        )}
      </div>

      <div className="output-area">
        {error && (
          <div className="error-box">
            <strong>⚠️ Error:</strong>
            <p>{error}</p>
          </div>
        )}

        {isLoading && !output && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Generating with local AI...</p>
            <small>Running entirely on your device - no cloud calls</small>
          </div>
        )}

        {output && (
          <div ref={outputRef} className="output-content">
            {output}
          </div>
        )}

        {!isLoading && !output && !error && (
          <div className="empty-state">
            <p>💬 Your AI-generated output will appear here</p>
            <small>Everything runs locally on your device</small>
          </div>
        )}
      </div>
    </div>
  );
}
