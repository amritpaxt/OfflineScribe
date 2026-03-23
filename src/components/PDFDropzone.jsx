/**
 * PDFDropzone.jsx
 * Drag-and-drop PDF upload with text extraction
 */

import React, { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for PDF parsing
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function PDFDropzone({ onTextExtracted, isProcessing }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [extractionError, setExtractionError] = useState(null);
  const fileInputRef = useRef(null);

  /**
   * Extract text from PDF
   */
  const extractTextFromPDF = async (file) => {
    try {
      setExtractionError(null);

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      setExtractedText(fullText);
      setFileName(file.name);

      // Call the parent callback
      if (onTextExtracted) {
        onTextExtracted(fullText);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setExtractionError(`Failed to extract PDF: ${errorMsg}`);
      console.error('PDF extraction error:', err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        extractTextFromPDF(file);
      } else {
        setExtractionError('Please drop a PDF file');
      }
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        extractTextFromPDF(file);
      } else {
        setExtractionError('Please select a PDF file');
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setExtractedText('');
    setFileName('');
    setExtractionError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pdf-dropzone-container">
      <div className="pdf-dropzone-header">
        <h3>📄 Extract from PDF</h3>
        <p>Drop a PDF or click to browse</p>
      </div>

      {!extractedText ? (
        <div
          className={`pdf-dropzone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          <div className="dropzone-content">
            <p className="dropzone-icon">📥</p>
            <p className="dropzone-text">Drop PDF here or click to browse</p>
            <p className="dropzone-hint">Max file size: 50MB</p>
          </div>
        </div>
      ) : (
        <div className="pdf-extraction-result">
          <div className="extraction-header">
            <div>
              <p className="file-name">{fileName}</p>
              <p className="text-stats">
                {extractedText.length} characters | {extractedText.split('\n').filter((l) => l.trim()).length} lines
              </p>
            </div>
            <button onClick={handleClear} className="clear-button" title="Clear">
              ✕
            </button>
          </div>
          <div className="extraction-preview">
            <p className="preview-label">Extracted Text (Preview):</p>
            <div className="preview-text">{extractedText.substring(0, 500)}...</div>
          </div>
          <button onClick={handleClear} className="btn-secondary">
            Upload Different PDF
          </button>
        </div>
      )}

      {extractionError && (
        <div className="extraction-error">
          <strong>⚠️ Error:</strong>
          <p>{extractionError}</p>
        </div>
      )}
    </div>
  );
}
