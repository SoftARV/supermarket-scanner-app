import TextRecognition, { type TextRecognitionResult } from '@react-native-ml-kit/text-recognition';
import { type OcrResult } from '@/types';

// Per-unit suffixes that indicate a price-per-weight/volume, not the item price
const PER_UNIT_PATTERN = /\s*[€£$]?\s*\/\s*(kg|l|lt|g|ml|u|ud|uni|unid|piece|pièce)/i;

interface PriceMatch {
  value: number;
  endIndex: number;
}

function collectPriceMatches(text: string): PriceMatch[] {
  const results: PriceMatch[] = [];

  // Pattern 1: standard decimal — "1.99" or "1,99"
  const decimalRe = /\d+[.,]\d{2}/g;
  let m: RegExpExecArray | null;
  while ((m = decimalRe.exec(text)) !== null) {
    results.push({
      value: parseFloat(m[0].replace(',', '.')),
      endIndex: m.index + m[0].length,
    });
  }

  // Pattern 2: split-euro — "1 € 89", "1€89", "1 €89", "1€ 89"
  // Matches integer euros, optional spaces, euro/pound/dollar sign, optional spaces, two-digit cents
  // Negative lookahead (?!\d) prevents matching inside longer numbers
  const splitRe = /(\d+)\s*[€£$]\s*(\d{2})(?!\d)/g;
  while ((m = splitRe.exec(text)) !== null) {
    const euros = parseInt(m[1], 10);
    const cents = parseInt(m[2], 10);
    results.push({
      value: euros + cents / 100,
      endIndex: m.index + m[0].length,
    });
  }

  return results;
}

function isPerUnitPrice(text: string, endIndex: number): boolean {
  // Check the 15 characters immediately after the match for per-unit indicators
  const window = text.slice(endIndex, endIndex + 15);
  return PER_UNIT_PATTERN.test(window);
}

function parsePriceAll(text: string): number[] {
  const matches = collectPriceMatches(text);

  // Filter out per-unit prices (€/kg, €/l, etc.)
  const itemPrices = matches.filter((m) => !isPerUnitPrice(text, m.endIndex));

  // Deduplicate by toFixed(2) string to avoid float collisions
  const seen = new Set<string>();
  const unique: number[] = [];
  for (const { value } of itemPrices) {
    const key = value.toFixed(2);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(value);
    }
  }

  // Smallest first — item prices are almost always lower than per-kg/per-l prices.
  // After filtering, the smallest surviving candidate is typically the shelf price.
  return unique.sort((a, b) => a - b);
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
