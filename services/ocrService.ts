import TextRecognition, { TextRecognitionResult } from '@react-native-ml-kit/text-recognition';
import { OcrResult } from '../types';

function parsePrice(text: string): number | null {
  const matches = text.match(/\d+[.,]\d{2}/g);
  if (!matches || matches.length === 0) return null;
  const values = matches.map((m) => parseFloat(m.replace(',', '.')));
  return Math.max(...values);
}

function parseName(blocks: TextRecognitionResult['blocks']): string {
  const pricePattern = /^\d+([.,]\d{1,2})?$|^\d+[.,]\d{2}$/;
  const candidates = blocks
    .flatMap((block) => block.lines ?? [block])
    .map((line) => ('text' in line ? line.text : (line as { text?: string }).text ?? '').trim())
    .filter((text) => text.length > 0 && !pricePattern.test(text));

  if (candidates.length === 0) return '';
  const longest = candidates.reduce((a, b) => (a.length >= b.length ? a : b));
  return longest.charAt(0).toUpperCase() + longest.slice(1).toLowerCase();
}

export async function extractFromPriceTag(imageUri: string): Promise<OcrResult> {
  try {
    const result = await TextRecognition.recognize(imageUri);
    const rawText = result.blocks.map((b) => b.text).join('\n');
    const price = parsePrice(rawText);
    const name = parseName(result.blocks);
    return { name, price, rawText };
  } catch {
    return { name: '', price: null, rawText: '' };
  }
}
