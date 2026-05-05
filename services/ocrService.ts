import TextRecognition, { TextRecognitionResult } from '@react-native-ml-kit/text-recognition';
import { OcrResult } from '../types';

function parsePriceAll(text: string): number[] {
  const matches = text.match(/\d+[.,]\d{2}/g);
  if (!matches || matches.length === 0) return [];

  // Deduplicate by normalised toFixed(2) string to avoid float collisions
  const seen = new Set<string>();
  const unique: number[] = [];
  for (const m of matches) {
    const val = parseFloat(m.replace(',', '.'));
    const key = val.toFixed(2);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(val);
    }
  }

  return unique.sort((a, b) => b - a);
}

function parseNameAll(blocks: TextRecognitionResult['blocks']): string[] {
  const pricePattern = /^\d+([.,]\d+)?$|^\d+[.,]\d{2}$/;

  const lines: string[] = [];
  for (const block of blocks) {
    const blockLines: string[] =
      block.lines && block.lines.length > 0
        ? block.lines.map((l) => l.text)
        : block.text.split(/\r?\n/);

    for (const line of blockLines) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && !pricePattern.test(trimmed)) {
        lines.push(trimmed);
      }
    }
  }

  // Deduplicate case-insensitively, preserving original casing of first occurrence
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(line);
    }
  }

  // Sort by length descending and cap at 6 total
  return unique.sort((a, b) => b.length - a.length).slice(0, 6);
}

function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export async function extractFromPriceTag(imageUri: string): Promise<OcrResult> {
  try {
    const result = await TextRecognition.recognize(imageUri);
    const rawText = result.blocks.map((b) => b.text).join('\n');

    const allPrices = parsePriceAll(rawText);
    const allNames = parseNameAll(result.blocks);

    return {
      name: allNames[0] ? capitalize(allNames[0]) : '',
      price: allPrices[0] ?? null,
      rawText,
      nameCandidates: allNames.slice(1),
      priceCandidates: allPrices.slice(1),
    };
  } catch {
    return { name: '', price: null, rawText: '', nameCandidates: [], priceCandidates: [] };
  }
}
