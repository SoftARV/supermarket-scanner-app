export type RootStackParamList = {
  Home: undefined;
  Scanner: undefined;
};

export interface ScannedItem {
  id: string;
  name: string;
  pricePerUnit: number;
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
  rawText: string;
}
