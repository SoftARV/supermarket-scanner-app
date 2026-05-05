export type RootStackParamList = {
  History: undefined;
  StartTrip: undefined;
  ActiveList: undefined;
  Camera: undefined;
  FinishTrip: undefined;
  TripDetail: { tripId: string };
  // legacy screens — replaced in Phase 5
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

export interface Trip {
  id: string;
  store: string;
  budget: number | null;
  items: ScannedItem[];
  total: number;
  createdAt: number;
  completedAt?: number;
}

export interface ShoppingState {
  items: ScannedItem[];
  total: number;
}

export interface OcrResult {
  name: string;
  price: number | null;
  rawText: string;
  nameCandidates: string[];
  priceCandidates: number[];
}
