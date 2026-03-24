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

      const timeoutId = setTimeout(() => {
        setIsGenerating(false);
        setError('⏱️ Generation timeout (>90 sec). Model may be overloaded.');
      }, 90000); // 90 sec hard stop

      try {
        const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
        
        console.log('[generate] Starting with prompt:', fullPrompt.slice(0, 80));
        
        const result = await TextGeneration.generateStream(fullPrompt, {
          maxTokens: 128,
          temperature: 0.9,
        });

        if (!result?.stream) {
          throw new Error('Stream not available');
        }

        cancelRef.current = result.cancel;
        let accumulated = '';
        let tokenCount = 0;

        for await (const token of result.stream) {
          if (!token || typeof token !== 'string') continue;
          
          accumulated += token;
          setOutput(accumulated);
          tokenCount++;

          // Safety: Hard stop after 128 tokens
          if (tokenCount >= 128) break;
        }

        console.log('[generate] Completed with', tokenCount, 'tokens');
        clearTimeout(timeoutId);
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('[generate] Error:', err);
        if (err.name !== 'AbortError') {
          setError(`Failed: ${err.message || String(err)}`);
        }
      } finally {
        setIsGenerating(false);
        clearTimeout(timeoutId);
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
