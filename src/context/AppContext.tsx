import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { type ScannedItem, type Trip } from '@/types';

// ─── State ────────────────────────────────────────────────────────
interface AppState {
  trips: Trip[];
  activeTrip: Trip | null;
}

// ─── Actions ──────────────────────────────────────────────────────
type Action =
  | { type: 'START_TRIP'; payload: { store: string; budget: number | null } }
  | { type: 'ADD_ITEM'; payload: ScannedItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'FINISH_TRIP' }
  | { type: 'DISCARD_TRIP' };

function computeTotal(items: ScannedItem[]): number {
  return items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0);
}

function tripReducer(trip: Trip, action: Action): Trip {
  switch (action.type) {
    case 'ADD_ITEM': {
      const items = [...trip.items, action.payload];
      return { ...trip, items, total: computeTotal(items) };
    }
    case 'REMOVE_ITEM': {
      const items = trip.items.filter((i) => i.id !== action.payload);
      return { ...trip, items, total: computeTotal(items) };
    }
    case 'UPDATE_QUANTITY': {
      const items = trip.items.map((i) =>
        i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i,
      );
      return { ...trip, items, total: computeTotal(items) };
    }
    default:
      return trip;
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_TRIP': {
      const trip: Trip = {
        id: Date.now().toString(),
        store: action.payload.store,
        budget: action.payload.budget,
        items: [],
        total: 0,
        createdAt: Date.now(),
      };
      return { ...state, activeTrip: trip };
    }
    case 'ADD_ITEM':
    case 'REMOVE_ITEM':
    case 'UPDATE_QUANTITY': {
      if (!state.activeTrip) return state;
      return { ...state, activeTrip: tripReducer(state.activeTrip, action) };
    }
    case 'FINISH_TRIP': {
      if (!state.activeTrip) return state;
      const completed: Trip = { ...state.activeTrip, completedAt: Date.now() };
      return { trips: [completed, ...state.trips], activeTrip: null };
    }
    case 'DISCARD_TRIP':
      return { ...state, activeTrip: null };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────
interface AppContextValue {
  trips: Trip[];
  activeTrip: Trip | null;
  startTrip: (store: string, budget: number | null) => void;
  addItem: (item: ScannedItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  finishTrip: () => void;
  discardTrip: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: AppState = { trips: [], activeTrip: null };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startTrip = useCallback(
    (store: string, budget: number | null) =>
      dispatch({ type: 'START_TRIP', payload: { store, budget } }),
    [],
  );
  const addItem = useCallback(
    (item: ScannedItem) => dispatch({ type: 'ADD_ITEM', payload: item }),
    [],
  );
  const removeItem = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
    [],
  );
  const updateQuantity = useCallback(
    (id: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
    [],
  );
  const finishTrip = useCallback(() => dispatch({ type: 'FINISH_TRIP' }), []);
  const discardTrip = useCallback(() => dispatch({ type: 'DISCARD_TRIP' }), []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        startTrip,
        addItem,
        removeItem,
        updateQuantity,
        finishTrip,
        discardTrip,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
