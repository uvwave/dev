import React, { createContext, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './components/App';
import './styles/index.css';

// Проверяем доступность API
console.log('Window API доступен:', window.api ? 'Да' : 'Нет');
if (window.api) {
  console.log('API методы:', Object.keys(window.api));
}

// Создаем контекст для темы и языка
export const ThemeContext = createContext();

// Создаем и экспортируем провайдер контекста
export const ThemeContextProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ru');

  // Создаем тему в зависимости от режима
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#303030' : '#f5f5f5',
        paper: darkMode ? '#424242' : '#fff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  }), [darkMode]);

  const contextValue = {
    darkMode,
    setDarkMode,
    language,
    setLanguage,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Рендерим приложение
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeContextProvider>
  </React.StrictMode>
); 