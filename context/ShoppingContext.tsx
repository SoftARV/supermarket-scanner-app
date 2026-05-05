// Backward-compat shim — proxies the active trip from AppContext.
// Existing screens (Home, Scanner) use this until Phase 5 replaces them.
import { useAppContext } from './AppContext';
import { ScannedItem } from '../types';

interface ShoppingContextValue {
  items: ScannedItem[];
  total: number;
  addItem: (item: ScannedItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearList: () => void;
}

export function useShoppingContext(): ShoppingContextValue {
  const { activeTrip, addItem, removeItem, updateQuantity, discardTrip } = useAppContext();
  return {
    items: activeTrip?.items ?? [],
    total: activeTrip?.total ?? 0,
    addItem,
    removeItem,
    updateQuantity,
    clearList: discardTrip,
  };
}

// Re-export provider under old name so App.tsx import keeps working
export { AppProvider as ShoppingProvider } from './AppContext';
