/**
 * PromptEditor.jsx
 * Left panel component for user input
 */

import React from 'react';
import { modes } from '../prompts/systemPrompts';

export function PromptEditor({ mode, setMode, prompt, setPrompt, onGenerate, isLoading }) {
  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate();
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="prompt-editor">
      <div className="editor-header">
        <h2>Write with AI</h2>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector-group">
        <label htmlFor="mode-select">Select Mode:</label>
        <select
          id="mode-select"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          disabled={isLoading}
          className="mode-select"
        >
          {Object.entries(modes).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Input Textarea */}
      <div className="input-area">
        <textarea
          placeholder={modes[mode]?.placeholder || 'Enter your prompt...'}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={12}
          className="prompt-textarea"
        />
        <div className="input-hints">
          <small>💡 Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to generate</small>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="generate-button"
      >
        {isLoading ? (
          <>
            <span className="spinner-small" />
            Generating...
          </>
        ) : (
          '✨ Generate'
        )}
      </button>
    </div>
  );
}
