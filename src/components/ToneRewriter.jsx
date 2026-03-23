/**
 * ToneRewriter.jsx
 * Component for rewriting text in different tones
 */

import React, { useState } from 'react';
import { toneVariants, systemPrompts } from '../prompts/systemPrompts';

export function ToneRewriter({ generate, isLoading, output, setOutput }) {
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('formal');

  const handleRewrite = () => {
    if (inputText.trim()) {
      const toneInstruction = toneVariants[selectedTone].instruction;
      const fullPrompt = `${toneInstruction}\n\nText to rewrite:\n${inputText}`;
      generate(systemPrompts.toneRewriter, fullPrompt);
    }
  };

  return (
    <div className="tone-rewriter">
      <div className="rewriter-header">
        <h3>✏️ Tone Rewriter</h3>
        <p>Paste text and rewrite it in a different tone</p>
      </div>

      <div className="rewriter-layout">
        {/* Input section */}
        <div className="rewriter-section input-section">
          <label htmlFor="input-text">Paste your text:</label>
          <textarea
            id="input-text"
            placeholder="Paste the text you want to rewrite..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            rows={8}
            className="rewriter-input"
          />
        </div>

        {/* Controls section */}
        <div className="rewriter-controls">
          <div className="tone-selector">
            <label htmlFor="tone-select">Choose tone:</label>
            <select
              id="tone-select"
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              disabled={isLoading}
              className="tone-select"
            >
              {Object.entries(toneVariants).map(([key, variant]) => (
                <option key={key} value={key}>
                  {variant.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRewrite}
            disabled={isLoading || !inputText.trim()}
            className="rewrite-button"
          >
            {isLoading ? '🔄 Rewriting...' : '🔄 Rewrite'}
          </button>
        </div>

        {/* Output section */}
        <div className="rewriter-section output-section">
          <div className="rewriter-output-header">
            <label>Rewritten as {toneVariants[selectedTone].label}:</label>
            {output && (
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="copy-button"
              >
                📋 Copy
              </button>
            )}
          </div>
          <div className="rewriter-output">
            {output || (
              <p className="placeholder">Rewritten text will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
