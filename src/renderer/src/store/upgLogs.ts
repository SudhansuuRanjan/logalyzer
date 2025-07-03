import { create } from 'zustand';
import { UpgradeLogs } from '../types/index'; // path to the types

interface StoreState {
  upgradeLogs: UpgradeLogs | null;
  setUpgradeLogs: (logs: UpgradeLogs) => void;
}

export const useStore = create<StoreState>((set) => ({
  upgradeLogs: null,
  setUpgradeLogs: (logs) => set({ upgradeLogs: logs }),
}));
