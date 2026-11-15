import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  isSyncingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'apex_tesla_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'dark';
  });
  const [isSyncingTheme, setIsSyncingTheme] = useState<boolean>(false);
  const latestThemeRef = useRef<ThemeMode>(theme);

  useEffect(() => {
    latestThemeRef.current = theme;
  }, [theme]);

  const applyLocalTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    latestThemeRef.current = nextTheme;
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // ignore storage errors
    }
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
    const nextTheme: ThemeMode = latestThemeRef.current === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [setTheme]);

  // Synchronize themePreference from Firestore user profile across auth sessions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) return;
      const userDocPath = `users/${fbUser.uid}`;
      const userDocRef = doc(db, 'users', fbUser.uid);
      setIsSyncingTheme(true);
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const remotePref = snap.data()?.themePreference;
          if (remotePref === 'light' || remotePref === 'dark') {
            applyLocalTheme(remotePref);
          } else {
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

  // Listen to cross-context theme hydration events (e.g. from AppContext login/profile sync)
  useEffect(() => {
    const handleRemoteSync = (event: Event) => {
      const customEvent = event as CustomEvent<unknown>;
      if (customEvent.detail === 'light' || customEvent.detail === 'dark') {
        applyLocalTheme(customEvent.detail);
      }
    };
    window.addEventListener('apex:theme-sync', handleRemoteSync);
    return () => window.removeEventListener('apex:theme-sync', handleRemoteSync);
  }, [applyLocalTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      body.classList.add('light');
      body.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      body.classList.add('dark');
      body.classList.remove('light');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
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
