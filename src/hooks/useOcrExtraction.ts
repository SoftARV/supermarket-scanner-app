import { useCallback, useRef, useState } from 'react';
import { extractFromPriceTag } from '@/services/ocrService';
import { OcrResult } from '@/types';

interface OcrState {
  result: OcrResult | null;
  loading: boolean;
  error: string | null;
}

export function useOcrExtraction() {
  const [state, setState] = useState<OcrState>({ result: null, loading: false, error: null });
  const mountedRef = useRef(true);

  const extract = useCallback(async (imageUri: string) => {
    mountedRef.current = true;
    setState({ result: null, loading: true, error: null });
    const ocr = await extractFromPriceTag(imageUri);
    if (!mountedRef.current) return;
    setState({ result: ocr, loading: false, error: null });
  }, []);

  const reset = useCallback(() => {
    mountedRef.current = false;
    setState({ result: null, loading: false, error: null });
  }, []);

  return { ...state, extract, reset };
}
