import React, { createContext, useState, useMemo, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CircularProgress, Alert, Button, Typography } from '@mui/material';
import App from './components/App';
import './styles/index.css';
import './styles/global.css';
import AuthProvider from './context/AuthContext';

// Класс обработки ошибок для отлова ошибок React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Обновляем состояние, чтобы при следующем рендере показать запасной UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Можно также отправить отчет об ошибке в сервис аналитики
    console.error('Перехвачена ошибка:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Рендерим запасной UI
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            p: 3
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Что-то пошло не так
          </Typography>
          
          <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 600 }}>
            {this.state.error && this.state.error.toString()}
          </Alert>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
          >
            Перезагрузить приложение
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Компонент загрузки
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Проверяем доступность API
console.log('Window API доступен:', window.api ? 'Да' : 'Нет');
if (window.api) {
  console.log('API методы:', Object.keys(window.api));
}

// ВАЖНО: Сбрасываем состояние авторизации при загрузке приложения
try {
  console.log('Принудительная очистка состояния авторизации при запуске приложения');
  localStorage.removeItem('currentUser');
} catch (e) {
  console.error('Ошибка при очистке localStorage:', e);
}

// Создаем контекст для темы и языка
export const ThemeContext = createContext();

// Создаем и экспортируем провайдер контекста
export const ThemeContextProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || true // По умолчанию включена темная тема
  );
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'ru');

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Создаем тему на основе выбранного режима и фиолетово-неоновой цветовой схемы
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#9d4edd',
        light: '#c77dff',
        dark: '#7b2cbf',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#e0aaff',
        light: '#f3d5ff',
        dark: '#b388eb',
        contrastText: '#1a1a2e',
      },
      background: darkMode ? {
        default: '#1a1a2e',
        paper: '#22223b',
      } : {
        default: '#f5f5f7',
        paper: '#ffffff',
      },
      text: darkMode ? {
        primary: '#e2e2e2',
        secondary: '#b8b8b8',
      } : {
        primary: '#333333',
        secondary: '#666666',
      },
      error: {
        main: '#ff5555',
      },
      warning: {
        main: '#fca311',
      },
      info: {
        main: '#3a86ff',
      },
      success: {
        main: '#2ec4b6',
      },
      divider: darkMode ? 'rgba(157, 78, 221, 0.2)' : 'rgba(157, 78, 221, 0.1)',
    },
    typography: {
      fontFamily: '"Roboto", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
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
            textTransform: 'none',
            fontWeight: 500,
          },
          containedPrimary: {
            background: 'linear-gradient(45deg, #7b2cbf 30%, #9d4edd 90%)',
            boxShadow: '0 3px 8px rgba(123, 44, 191, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #9d4edd 30%, #c77dff 90%)',
              boxShadow: '0 4px 10px rgba(157, 78, 221, 0.4)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'rgba(157, 78, 221, 0.1)',
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: '#9d4edd',
              '& + .MuiSwitch-track': {
                backgroundColor: '#7b2cbf',
                opacity: 0.5,
              },
            },
          },
          track: {
            backgroundColor: '#555',
            opacity: 0.3,
          },
          thumb: {
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  }), [darkMode]);

  const themeValue = {
    darkMode,
    setDarkMode,
    language,
    setLanguage
  };

  return (
    <ThemeContext.Provider value={themeValue}>
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
  <ErrorBoundary>
    <ThemeContextProvider>
      <Suspense fallback={<LoadingComponent />}>
        <AuthProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </AuthProvider>
      </Suspense>
    </ThemeContextProvider>
  </ErrorBoundary>
); 