# Supermarket Scanner App — Claude Code Guide

## Project Overview

A React Native (Expo) mobile app that helps the user track spending while shopping.
The user points their camera at a supermarket shelf price tag, the app extracts the
item name and price using on-device OCR (ML Kit — no internet, no cost), the user
reviews and optionally corrects the extracted data, sets a quantity, and the item is
added to a running shopping list with a live total.

## Design System — Mono + Ice (hi-fi mock, May 2026)

The app uses the **Mono + Ice** palette with **Inter Tight** for UI text and **Fraunces** (serif) exclusively for totals and prices. Full light + dark mode support driven by system preference.

### Palette tokens

```typescript
// light
bg: '#f5f7fa'        surface: '#ffffff'       surface2: '#eef2f7'
ink: '#0a0a0a'       muted: '#71717a'          hairline: 'rgba(0,0,0,0.08)'
accent: '#3b82f6'    accentInk: '#ffffff'      accentSoft: '#dbeafe'
pop: '#fb7185'

// dark
bg: '#0a0a0a'        surface: '#161618'        surface2: '#1d1d20'
ink: '#fafafa'       muted: '#a1a1aa'          hairline: 'rgba(255,255,255,0.08)'
accent: '#7dd3fc'    accentInk: '#0a0a0a'      accentSoft: 'rgba(125,211,252,0.15)'
pop: '#fda4af'
```

### Typography rules
- **Inter Tight** — all UI labels, captions, buttons, body text
- **Fraunces** (serif, variable) — ONLY `TotalDisplay` and item price values; gives money real visual weight
- Total display: `€` symbol small + muted, integer large + ink, `.cents` small + muted

### Shape language
- Large radii: cards `16-22px`, buttons `999px` (pills), icons `12px`
- Surface cards with `1px solid hairline` borders (no heavy shadows)
- Bottom sheets: `borderTopLeftRadius: 28`, `borderTopRightRadius: 28`, `36×4` drag handle

### Complete screen flow (11 artboards)

```
① History → ② Start trip → ③ Active list (empty)
→ ④ Camera viewfinder → ⑤ Review sheet (bottom sheet)
→ ⑥ Active list (1 item) → ⑦ Active list (growing)
→ ⑧ Active list (full) → ⑨ Finish trip summary
→ ⑩ History (trip saved) → ⑪ Trip detail (read-only)
```

### New screens vs original
| Screen | Status |
|---|---|
| History (trips list + Start button) | New — becomes app root |
| Start trip (store name + budget) | New |
| Active list | Updated — gains header nav, budget bar, last-added badge |
| Camera viewfinder | New — live feed, corner reticles, total chip overlay |
| Review sheet | Updated — bottom sheet over frozen camera frame |
| Finish trip summary | New |
| Trip detail (read-only) | New |

### Trip data model
```typescript
interface Trip {
  id: string;
  store: string;
  budget: number | null;   // null = no budget set
  items: ScannedItem[];
  total: number;
  createdAt: number;       // epoch ms
  completedAt?: number;    // undefined = still active
}
```

---

## Tech Stack

- **Framework:** React Native with Expo SDK 54 (New Architecture enabled — `newArchEnabled: true`)
- **Language:** TypeScript (strict mode)
- **Camera / Image Picker:** expo-image-picker
- **OCR (on-device, offline):** @react-native-ml-kit/text-recognition
- **Navigation:** React Navigation (Stack) + react-native-gesture-handler
- **Animations:** react-native-reanimated (swipe-to-delete, item transitions)
- **Haptics:** expo-haptics (confirm add, error, destructive feedback)
- **State:** React Context + useReducer (no external state library needed)
- **Styling:** StyleSheet API (no Tailwind — keep it native)

> ⚠️ ML Kit requires a **development build** — it will NOT work in Expo Go.
> Always run with `npx expo run:android` or `npx expo run:ios`.
>
> ⚠️ Android has `edgeToEdgeEnabled: true` — always wrap screens in `<SafeAreaView>` or use `useSafeAreaInsets`.

## Installation

```bash
npx create-expo-app@latest supermarket-scanner --template blank-typescript
cd supermarket-scanner

npx expo install expo-image-picker expo-file-system expo-haptics
npm install @react-native-ml-kit/text-recognition
npm install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-reanimated react-native-gesture-handler

# Build and run on device (required for ML Kit)
npx expo run:android   # or run:ios
```

## Project Structure

```
supermarket-scanner/
├── app/                        # Screens
│   ├── index.tsx               # Shopping list (home screen)
│   └── scanner.tsx             # Camera + OCR extraction screen
├── components/
│   ├── ShoppingList.tsx        # FlatList with all perf optimizations
│   ├── ItemCard.tsx            # Single list item row (React.memo)
│   └── QuantityPicker.tsx      # +/- quantity control
├── constants/
│   └── theme.ts                # Colors, spacing, typography tokens
├── context/
│   └── ShoppingContext.tsx     # Global state: items[], total
├── hooks/
│   └── useOcrExtraction.ts     # OCR + parsing logic, loading/error state
├── services/
│   └── ocrService.ts           # ML Kit OCR + price/name parsing logic
├── types/
│   └── index.ts                # Shared TypeScript interfaces
├── App.tsx                     # NavigationContainer + Stack + ShoppingProvider
├── CLAUDE.md
└── app.json
```

### Why these additions?

- **`constants/theme.ts`** — Single source of truth for colors, spacing, and font sizes. Supermarket context needs high-contrast, large-target UI; hardcoding values across files makes that impossible to maintain.
- **`hooks/useOcrExtraction.ts`** — Extracts the async loading/error state machine out of `scanner.tsx`, keeping the screen under 150 lines and making the OCR logic independently testable.
- **`react-native-reanimated`** — Required for swipe-to-delete on `ItemCard`. Native-thread animations (no JS jank), and gesture-handler integration for the swipe gesture.
- **`expo-haptics`** — Haptic feedback on "Add to list" (success), validation errors, and "Clear list" (warning). Critical for premium feel and supermarket environment where users may not be looking at the screen.

## Core Data Types

```typescript
// types/index.ts

export interface ScannedItem {
  id: string;
  name: string;
  pricePerUnit: number;   // in euros, e.g. 1.99
  quantity: number;
  imageUri?: string;
}

export interface ShoppingState {
  items: ScannedItem[];
  total: number;
}

export interface OcrResult {
  name: string;
  price: number | null;
  rawText: string;        // full raw OCR output, useful for debugging
}
```

## Key Features to Implement

### 1. Camera / Image Picker (scanner.tsx)

- Use `expo-image-picker` (`ImagePicker.launchCameraAsync`) for camera access
- After capture, immediately show a preview of the photo
- Pass the image URI to `ocrService.ts` for text extraction
- Show a loading indicator while OCR runs (it's fast but not instant)
- Display the extracted name + price in **editable TextInput fields** — the user
  must always be able to correct OCR mistakes before adding the item
- Let user set quantity with the QuantityPicker (default: 1)
- "Add to list" button saves the item and navigates back to the list screen
- "Retake" button lets the user try again if the photo was bad

### 2. OCR Extraction (services/ocrService.ts)

Use `@react-native-ml-kit/text-recognition` for fully offline, on-device OCR.

```typescript
import TextRecognition from '@react-native-ml-kit/text-recognition';

export async function extractFromPriceTag(imageUri: string): Promise<OcrResult> {
  const result = await TextRecognition.recognize(imageUri);
  const rawText = result.blocks.map(b => b.text).join('\n');
  const price = parsePrice(rawText);
  const name = parseName(result.blocks);
  return { name, price, rawText };
}
```

**Price parsing — `parsePrice(text: string): number | null`**
- Match pattern: `/\d+[.,]\d{2}/g` — this catches `1.99`, `1,99`, `12,50`, etc.
- Normalize: replace comma with dot before `parseFloat`
- If multiple matches, take the largest number (main price, not weight price)
- Return `null` if no match found

**Name parsing — `parseName(blocks): string`**
- Filter out blocks that are purely numeric or contain only price-like patterns
- From the remaining blocks, return the longest text line — it's usually the
  product name on a Spanish supermarket tag
- Trim and capitalize the result
- Return empty string `''` if nothing useful found — the user will type it

**Important:** Always return an `OcrResult` even if parsing fails — never throw
from this service. Failures are handled by showing empty editable fields.

### 3. Shopping List (index.tsx + ShoppingContext)

- Show all added items in a scrollable list
- Each row (ItemCard) shows: item name, unit price, quantity, and line total
- Grand total in a sticky footer at the bottom of the screen
- Swipe-to-delete OR a trash icon button on each row
- Tapping the quantity in a row allows inline editing
- "Clear list" button (top right) with a confirmation Alert before clearing
- Empty state: show a friendly message + big camera button when list is empty

### 4. ShoppingContext (context/ShoppingContext.tsx)

```typescript
type Action =
  | { type: 'ADD_ITEM'; payload: ScannedItem }
  | { type: 'REMOVE_ITEM'; payload: string }        // id
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_LIST' };
```

- Compute `total` inside the reducer (sum of pricePerUnit × quantity for all items)
- Wrap the app in `<ShoppingProvider>` in the root layout
- Export a `useShoppingContext()` hook — throw if used outside the provider

## Theme Constants (constants/theme.ts)

```typescript
export const colors = {
  primary: '#1A7F37',       // Green — scan/add action
  danger: '#C0392B',        // Red — delete/clear
  background: '#F5F5F5',    // Off-white — easy on eyes in bright light
  surface: '#FFFFFF',
  textPrimary: '#111111',   // High contrast for bright supermarket lighting
  textSecondary: '#555555',
  border: '#E0E0E0',
  total: '#1A7F37',         // Total price = prominent green
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};

export const fontSizes = {
  body: 16, title: 20, large: 24, price: 28,
};

export const touchTarget = {
  min: 48,   // 48dp Android / 44pt iOS minimum
  fab: 64,   // FAB must be generous — user holds phone one-handed in supermarket
};
```

## Performance Conventions

- **`ItemCard` must be wrapped in `React.memo`** — list re-renders on every ADD/REMOVE/UPDATE
- **`renderItem` in `ShoppingList` must use `useCallback`** — prevents function recreation on every render
- **`keyExtractor` must use `item.id`** — never use array index; items can be deleted mid-list
- **`getItemLayout` must be provided** — item height is fixed; skip async layout calculation
- **All animations must use `useNativeDriver: true`** or Reanimated — JS-thread animation in a list = jank
- **`useOcrExtraction` must not set state after unmount** — user may navigate back while OCR runs

## Coding Conventions

- All components are functional with fully typed props interfaces
- No `any` types anywhere — use proper interfaces from `types/index.ts`
- Use `async/await` with `try/catch` for all OCR calls
- Show an `ActivityIndicator` while OCR is processing
- Show user-friendly error messages (not raw error objects)
- Currency formatting: `€${price.toFixed(2)}` — symbol before, 2 decimal places
- Keep components under ~150 lines — extract sub-components when needed
- Use `useCallback` and `useMemo` where re-renders are a concern (list screen)

## Currency & Locale

The user is based in **Spain**. Use **€ (Euro)** for all prices.

- Format: `€1.99` (symbol first, period as decimal separator in display)
- Input: accept both `.` and `,` as decimal separator (Spanish keyboards use comma)
- Always normalize to `.` before `parseFloat`

## UX Guidelines

- The scanner screen should feel fast — minimize taps between photo and adding to list
- After the user taps "Add to list", auto-navigate back to the home list screen
- Show a brief success message (Alert or toast) when an item is added
- The camera/scan button on the home screen should be large, prominent, and
  thumb-friendly (bottom center FAB style)
- Use high-contrast text and large font sizes — supermarkets are bright and busy
- Price field keyboard type: `decimal-pad`
- If OCR returns empty name or null price, focus the empty field automatically
  so the user knows they need to fill it in

## Error Handling

| Situation | Behavior |
|---|---|
| Camera permission denied | Show explanation Alert with link to Settings |
| OCR finds no text | Show empty editable fields + message "Couldn't read tag — please type manually" |
| OCR finds text but no price | Pre-fill name, leave price empty, focus price field |
| Image too blurry | OCR will return garbled text — treat as "no price" case |
| User adds item with empty name | Validate before submit, show inline error |
| User adds item with 0 or null price | Allow it (some items may be free or user tracks by name only) |

## What NOT to Do

- Do not use Redux, MobX, or any heavy state library — Context + useReducer is enough
- Do not use Expo Router — use React Navigation Stack
- Do not store data to disk / AsyncStorage — in-memory state is fine for a shopping session
- Do not call any external API or network service — the app must work 100% offline
- Do not show raw OCR output or error stack traces to the user
- Do not require the user to confirm OCR results in a separate step — editable fields
  in the same screen are enough

## Running the App

```bash
# Development build on Android (required — Expo Go won't work with ML Kit)
npx expo run:android

# Development build on iOS
npx expo run:ios

# If you change native dependencies, rebuild:
npx expo run:android --clean
```

## No Environment Variables Needed

This app has no API keys, no backend, and no internet dependency.
Everything runs on-device. There is no `.env` file.
