import { aigLookup, AIGLookup } from "../template-engine/sheets/utils/aig-helper";

const AIG_STORAGE_KEY = 'aig';
const APP_VERSION = import.meta.env.VITE_APP_VERSION;

interface aigStorageData {
  version: string;
  overrides: AIGLookup;
}

export const saveAigOverrides = (overrides: AIGLookup) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const storageData: aigStorageData = {
      version: APP_VERSION,
      overrides: overrides
    };
    localStorage.setItem(AIG_STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.warn('Failed to save AIG overrides to localStorage:', error);
  }
};

export const loadAigOverrides = (): AIGLookup => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...aigLookup };
    }

    const storage = localStorage.getItem(AIG_STORAGE_KEY);

    if (!storage) {
      return { ...aigLookup };
    }

    const { version: storedVersion, overrides } = JSON.parse(storage) as aigStorageData;

    // If version doesn't match or doesn't exist, clear storage and return defaults
    if (storedVersion !== APP_VERSION) {
      clearAigStorage();
      return { ...aigLookup };
    }

    return overrides;
  } catch (error) {
    console.error('Error loading AIG overrides from storage:', error);
    return { ...aigLookup };
  }
};

export const clearAigStorage = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(AIG_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error clearing AIG storage:', error);
  }
};
