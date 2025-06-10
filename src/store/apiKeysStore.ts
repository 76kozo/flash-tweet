import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ApiKeysState {
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string) => void;
  clearApiKeys: () => void;
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set) => ({
      geminiApiKey: null,
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      clearApiKeys: () => set({ geminiApiKey: null }),
    }),
    {
      name: 'tweetmaster-api-keys',
      storage: createJSONStorage(() => localStorage),
    }
  )
);