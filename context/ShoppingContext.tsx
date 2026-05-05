import React, { createContext, useContext, useReducer } from 'react';
import { ScannedItem, ShoppingState } from '../types';

type Action =
  | { type: 'ADD_ITEM'; payload: ScannedItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_LIST' };

function computeTotal(items: ScannedItem[]): number {
  return items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
}

function reducer(state: ShoppingState, action: Action): ShoppingState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const items = [...state.items, action.payload];
      return { items, total: computeTotal(items) };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.id !== action.payload);
      return { items, total: computeTotal(items) };
    }
    case 'UPDATE_QUANTITY': {
      const items = state.items.map((i) =>
        i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i,
      );
      return { items, total: computeTotal(items) };
    }
    case 'CLEAR_LIST':
      return { items: [], total: 0 };
    default:
      return state;
  }
}

interface ShoppingContextValue extends ShoppingState {
  addItem: (item: ScannedItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearList: () => void;
}

const ShoppingContext = createContext<ShoppingContextValue | null>(null);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], total: 0 });

  const addItem = (item: ScannedItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearList = () => dispatch({ type: 'CLEAR_LIST' });

  return (
    <ShoppingContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clearList }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShoppingContext(): ShoppingContextValue {
  const ctx = useContext(ShoppingContext);
  if (!ctx) throw new Error('useShoppingContext must be used inside ShoppingProvider');
  return ctx;
}
