import React, { createContext, useEffect, useState, useContext } from 'react';

interface ThemeContextProps {
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps>({ isDark: false });

  export const ThemeContextProvider: React.FC<{children: React.ReactNode}> = ( {children} ) => {
  const [isDark, setIsDark] = useState(() => {
    const theme = document.body.dataset.jpThemeName;
    return theme ? theme.includes('Dark') : false;
  });

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-jp-theme-name') {
          const theme = document.body.getAttribute('data-jp-theme-name');
          setIsDark(theme?.includes('Dark') ?? false);
        }
      });
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-jp-theme-name']
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
