/**
 * useRunAnywhere hook - simplified version
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import { ModelCategory } from '@runanywhere/web';
import { useModelLoader } from './useModelLoader';

export function useRunAnywhere() {
  const loader = useModelLoader(ModelCategory.Language);
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const cancelRef = useRef(null);
  const initRef = useRef(false);

  // Auto-load model once on mount
  useEffect(() => {
    if (initRef.current) return;
    if (loader.state === 'ready') return;

    initRef.current = true;
    loader.ensure().catch(() => {});
  }, [loader.state]);

  const generate = useCallback(
    async (systemPrompt, userMessage, onChunk) => {
      if (loader.state !== 'ready') {
        setError('Model not ready. Please wait...');
        return;
      }

      setIsGenerating(true);
      setError(null);
      setOutput('');

      try {
        const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
        
        let result = await TextGeneration.generateStream(
          fullPrompt,
          { maxTokens: 256, temperature: 0.9 }
        );
        
        if (!result || !result.stream) {
          throw new Error('Invalid TextGeneration response');
        }

        const { stream, cancel } = result;
        cancelRef.current = cancel;
        
        let accumulated = '';
        let tokenCount = 0;
        const startTime = Date.now();
        const maxTime = 120000; // 2 min timeout

        for await (const token of stream) {
          if (Date.now() - startTime > maxTime) {
            setError('Generation timeout - took too long');
            break;
          }
          
          if (!token) continue;
          
          accumulated += token;
          setOutput(accumulated);
          tokenCount++;
          
          if (tokenCount >= 256) break; // Safety: stop after 256 tokens
        }
      } catch (err) {
        console.error('[generate] Error:', err);
        if (err.name !== 'AbortError') {
          const msg = err instanceof Error ? err.message : String(err);
          setError(`Generation failed: ${msg}`);
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [loader.state]
  );

  const cancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      setIsGenerating(false);
    }
  }, []);

  return {
    isLoading: loader.state === 'downloading' || loader.state === 'loading' || isGenerating,
    isModelLoaded: loader.state === 'ready',
    output,
    error: error || loader.error,
    generate,
    cancel,
    setOutput,
    loaderState: loader.state,
    loaderProgress: Math.round(loader.progress * 100),
  };
}
