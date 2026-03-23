import { useState } from 'react';
import { useRunAnywhere } from '../hooks/useRunAnywhere';
import { PromptEditor } from './PromptEditor';
import { OutputPanel } from './OutputPanel';
import { LocalBadge } from './LocalBadge';
import { ToneRewriter } from './ToneRewriter';
import { PDFDropzone } from './PDFDropzone';
import { modes } from '../prompts/systemPrompts';

export function ChatTab() {
  const { isLoading, isModelLoaded, output, error, generate, setOutput, loaderState, loaderProgress } = useRunAnywhere();
  const [mode, setMode] = useState('email');
  const [prompt, setPrompt] = useState('');
  const [showToneRewriter, setShowToneRewriter] = useState(false);
  const [showPDFDropzone, setShowPDFDropzone] = useState(false);

  const handleGenerate = async () => {
    const systemPrompt = modes[mode].systemPrompt;
    await generate(systemPrompt, prompt, null);
  };

  const handlePDFExtracted = (text) => {
    if (mode === 'summary') {
      setPrompt(text);
    } else {
      setMode('summary');
      setPrompt(text);
    }
    setShowPDFDropzone(false);
  };

  return (
    <div className="tab-panel offlinescribe-panel">
      <div className="offlinescribe-header">
        <h1>✍️ OfflineScribe</h1>
        <LocalBadge isModelLoaded={isModelLoaded} isLoading={isLoading} loaderState={loaderState} loaderProgress={loaderProgress} />
      </div>

      <div className="offlinescribe-content">
        <div className="editor-output-layout">
          <PromptEditor
            mode={mode}
            setMode={setMode}
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          <OutputPanel output={output} isLoading={isLoading} error={error} />
        </div>

        <div className="feature-section">
          <div className="section-toggle">
            <button
              onClick={() => setShowToneRewriter(!showToneRewriter)}
              className="toggle-button"
            >
              {showToneRewriter ? '▼' : '▶'} Tone Rewriter
            </button>
          </div>
          {showToneRewriter && (
            <ToneRewriter
              generate={generate}
              isLoading={isLoading}
              output={output}
              setOutput={setOutput}
            />
          )}
        </div>

        <div className="feature-section">
          <div className="section-toggle">
            <button
              onClick={() => setShowPDFDropzone(!showPDFDropzone)}
              className="toggle-button"
            >
              {showPDFDropzone ? '▼' : '▶'} Extract from PDF
            </button>
          </div>
          {showPDFDropzone && (
            <PDFDropzone
              onTextExtracted={handlePDFExtracted}
              isProcessing={isLoading}
            />
          )}
        </div>
      </div>

      <footer className="offlinescribe-footer">
        <p>
          🔒 <strong>Privacy First:</strong> All processing happens on your device. Your data never leaves your browser.
        </p>
      </footer>
    </div>
  );
}
