# Supermarket Scanner

A React Native (Expo) app for tracking spending while grocery shopping. Point your camera at a price tag, review the extracted name and price, set a quantity, and it gets added to a running shopping list with a live total — all 100% offline.

## Features

- **On-device OCR** — scans price tags with ML Kit, no internet required
- **Editable fields** — always correct OCR mistakes before adding
- **Live total** — running basket total updates instantly
- **Quantity control** — set quantity per item, edit inline from the list
- **Haptic feedback** — confirms adds, warns on delete/clear

## Tech stack

| Layer | Library |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript (strict) |
| Camera | expo-image-picker |
| OCR | @react-native-ml-kit/text-recognition |
| Navigation | React Navigation (Native Stack) |
| Animations | react-native-reanimated |
| Haptics | expo-haptics |
| State | React Context + useReducer |

## Prerequisites

- Node.js 18+
- Android Studio (for Android) or Xcode (for iOS)
- A physical device or emulator/simulator

> **Note:** ML Kit requires a development build — it does **not** work in Expo Go.

## Getting started

```bash
# Install dependencies
npm install

# Build and run on Android (required for ML Kit)
npx expo run:android

# Build and run on iOS
npx expo run:ios

# Rebuild after changing native dependencies
npx expo run:android --clean
```

## Project structure

```
supermarket-scanner/
├── app/
│   ├── index.tsx          # Home screen — shopping list + total footer + scan FAB
│   └── scanner.tsx        # Scanner screen — camera, OCR, editable form
├── components/
│   ├── ShoppingList.tsx   # Optimised FlatList (memoized, getItemLayout)
│   ├── ItemCard.tsx       # List row — name, price, quantity, delete
│   └── QuantityPicker.tsx # +/− quantity control with 48dp touch targets
├── constants/
│   └── theme.ts           # Colors, spacing, font sizes, touch target sizes
├── context/
│   └── ShoppingContext.tsx # Global state with useReducer
├── hooks/
│   └── useOcrExtraction.ts # Async OCR state machine (loading, result, error)
├── services/
│   └── ocrService.ts      # ML Kit OCR + price/name parsing, never throws
├── types/
│   └── index.ts           # Shared TypeScript interfaces
└── App.tsx                # Root — providers + navigation stack
```

## How it works

1. Tap **Scan item** on the home screen
2. The camera opens automatically — point it at a supermarket price tag
3. ML Kit extracts text on-device; name and price are pre-filled
4. Review and correct the fields if needed, set quantity
5. Tap **Add to list** — item appears in the basket and the total updates
6. Tap **Retake** to photograph the tag again if OCR was unclear

## Currency

Prices are displayed in **€ (Euro)** with the symbol first (`€1.99`). Both `.` and `,` are accepted as decimal separators when typing — consistent with Spanish keyboard layouts.

## No backend, no keys

There is no `.env` file, no API keys, and no network calls. Everything runs on-device.
