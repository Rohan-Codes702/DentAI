import React, { createContext, useMemo } from 'react';
import { lightColors } from '../theme/colors';

export const ThemeContext = createContext();

// DentAI is a light-only, sky-blue + white healthcare product — dark mode has
// been removed. This provider still exposes the same shape (`theme`, `isDark`,
// `themeMode`, `setThemeMode`, `toggleTheme`, `hydrated`) that the rest of the
// app already consumes via useTheme(), so no other screen needs to change.
export const ThemeProvider = ({ children }) => {
  const theme = useMemo(
    () => ({
      mode: 'light',
      colors: lightColors,
    }),
    [],
  );

  // No-ops kept so any existing call site (e.g. a settings screen) that still
  // calls setThemeMode/toggleTheme doesn't crash — they simply do nothing now.
  const setThemeMode = () => {};
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: false,
        themeMode: 'light',
        setThemeMode,
        toggleTheme,
        hydrated: true,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
