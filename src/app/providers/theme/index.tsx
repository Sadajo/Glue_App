import React, {createContext, useContext, ReactNode} from 'react';
import {lightTheme} from '@app/styles/theme';

// ThemeType 정의
type ThemeType = typeof lightTheme;

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
});

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  // 항상 라이트 테마 사용
  const theme = lightTheme;
  const isDarkMode = false;

  const contextValue = {
    theme,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
