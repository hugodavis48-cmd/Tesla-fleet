import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

export type ThemeMode = 'dark' | 'light' | 'blue';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  isBlue: boolean;
  isSyncingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'apex_tesla_theme';

const isValidThemeMode = (val: unknown): val is ThemeMode =>
  val === 'dark' || val === 'light' || val === 'blue';

const readStoredTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isValidThemeMode(saved)) {
      return saved;
    }
  } catch {
    // ignore storage access errors
  }
  return null;
};

const writeStoredTheme = (nextTheme: ThemeMode): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  } catch {
    // ignore storage access errors
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme() ?? 'dark');
  const [isSyncingTheme, setIsSyncingTheme] = useState<boolean>(false);
  const latestThemeRef = useRef<ThemeMode>(theme);

  useEffect(() => {
    latestThemeRef.current = theme;
  }, [theme]);

  const applyLocalTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    latestThemeRef.current = nextTheme;
    writeStoredTheme(nextTheme);
  }, []);

  const persistThemeToFirestore = useCallback(async (nextTheme: ThemeMode) => {
    const fbUser = auth.currentUser;
    if (!fbUser) return;

    const userDocPath = `users/${fbUser.uid}`;
    const userDocRef = doc(db, 'users', fbUser.uid);
    setIsSyncingTheme(true);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        await updateDoc(userDocRef, {
          themePreference: nextTheme,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, userDocPath);
      } catch {
        // Non-blocking fallback: localStorage & backend profile mirror remain active
      }
    } finally {
      setIsSyncingTheme(false);
    }
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      applyLocalTheme(newTheme);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('apex:theme-changed', { detail: newTheme }));
      }
      void persistThemeToFirestore(newTheme);
    },
    [applyLocalTheme, persistThemeToFirestore]
  );

  const toggleTheme = useCallback(() => {
    const current = latestThemeRef.current;
    const nextTheme: ThemeMode = current === 'dark' ? 'light' : current === 'light' ? 'blue' : 'dark';
    setTheme(nextTheme);
  }, [setTheme]);

  // Synchronize themePreference with Firestore without overriding explicit localStorage choices
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) return;
      const userDocPath = `users/${fbUser.uid}`;
      const userDocRef = doc(db, 'users', fbUser.uid);
      const localPref = readStoredTheme();
      setIsSyncingTheme(true);
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const remotePref = snap.data()?.themePreference;
          if (!localPref && isValidThemeMode(remotePref)) {
            applyLocalTheme(remotePref);
          } else if (remotePref !== latestThemeRef.current) {
            await updateDoc(userDocRef, {
              themePreference: latestThemeRef.current,
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.GET, userDocPath);
        } catch {
          // Graceful skip if Firestore rules reject unverified session or offline
        }
      } finally {
        setIsSyncingTheme(false);
      }
    });

    return () => unsubscribe();
  }, [applyLocalTheme]);

  // Listen to explicit remote login sync events only when no localStorage preference is set
  useEffect(() => {
    const handleRemoteSync = (event: Event) => {
      const customEvent = event as CustomEvent<unknown>;
      if (isValidThemeMode(customEvent.detail)) {
        if (!readStoredTheme()) {
          applyLocalTheme(customEvent.detail);
        }
      }
    };
    window.addEventListener('apex:theme-sync', handleRemoteSync);
    return () => window.removeEventListener('apex:theme-sync', handleRemoteSync);
  }, [applyLocalTheme]);

  // Keep theme synchronized across open browser tabs/windows via localStorage storage events
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (isValidThemeMode(event.newValue)) {
        setThemeState(event.newValue);
        latestThemeRef.current = event.newValue;
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync DOM attributes and persist active selection in localStorage
  useEffect(() => {
    writeStoredTheme(theme);
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'blue') {
      root.classList.add('light', 'blue');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'blue');
      root.style.colorScheme = 'light';
      body.classList.add('light', 'blue');
      body.classList.remove('dark');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark', 'blue');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      body.classList.add('light');
      body.classList.remove('dark', 'blue');
    } else {
      root.classList.add('dark');
      root.classList.remove('light', 'blue');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      body.classList.add('dark');
      body.classList.remove('light', 'blue');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light' || theme === 'blue',
        isBlue: theme === 'blue',
        isSyncingTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
