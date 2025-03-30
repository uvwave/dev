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
  // Инициализируем состояние из localStorage или используем темную тему по умолчанию
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('darkMode');
      // Если в localStorage есть значение, преобразуем его в boolean
      if (savedMode !== null) {
        return savedMode === 'true';
      }
      // Если нет, используем тёмную тему по умолчанию
      return true;
    } catch (e) {
      console.error('Ошибка при чтении darkMode из localStorage:', e);
      return true;
    }
  });
  
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('language') || 'ru';
    } catch (e) {
      console.error('Ошибка при чтении language из localStorage:', e);
      return 'ru';
    }
  });

  // Сохраняем darkMode в localStorage при его изменении
  useEffect(() => {
    try {
      localStorage.setItem('darkMode', String(darkMode));
      console.log('Saved darkMode to localStorage:', darkMode);
    } catch (e) {
      console.error('Ошибка при сохранении darkMode в localStorage:', e);
    }
  }, [darkMode]);

  // Сохраняем language в localStorage при его изменении
  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (e) {
      console.error('Ошибка при сохранении language в localStorage:', e);
    }
  }, [language]);

  // Создаем тему на основе выбранного режима и цветовой схемы
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        // В темной теме основной цвет - фиолетовый, в светлой - синий
        main: darkMode ? '#9d4edd' : '#0072e5',
        light: darkMode ? '#c77dff' : '#42a5f5',
        dark: darkMode ? '#7b2cbf' : '#0059b2',
        contrastText: '#ffffff',
      },
      secondary: {
        // В темной теме - светло-фиолетовый, в светлой - фиолетовый (акцентный)
        main: darkMode ? '#e0aaff' : '#5d00e0',
        light: darkMode ? '#f3d5ff' : '#8f7fff',
        dark: darkMode ? '#b388eb' : '#4600a8',
        contrastText: darkMode ? '#1a1a2e' : '#ffffff',
      },
      background: darkMode ? {
        // Темная тема - черный фон
        default: '#000000',
        paper: '#121212',
      } : {
        // Светлая тема - белый с голубыми оттенками
        default: '#ffffff',
        paper: '#f8fbff',
      },
      text: darkMode ? {
        // Текст для темной темы - белый и светло-серый
        primary: '#ffffff',
        secondary: '#cccccc',
      } : {
        // Текст для светлой темы - темно-синий и серый
        // Делаем текст более темным, чтобы его было лучше видно
        primary: '#0a1929', // Темно-синий
        secondary: '#3a4a5c', // Темно-серый с синим оттенком
      },
      error: {
        main: '#ff5555',
      },
      warning: {
        main: '#fca311',
      },
      info: {
        main: darkMode ? '#8ecae6' : '#0099ff',
      },
      success: {
        main: '#2ec4b6',
      },
      divider: darkMode ? 'rgba(157, 78, 221, 0.3)' : 'rgba(0, 114, 229, 0.15)',
    },
    typography: {
      fontFamily: '"Roboto", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        color: darkMode ? '#ffffff' : '#0a1929',
      },
      h2: {
        fontWeight: 600,
        color: darkMode ? '#ffffff' : '#0a1929',
      },
      h3: {
        fontWeight: 600,
        color: darkMode ? '#ffffff' : '#0a1929',
      },
      h4: {
        fontWeight: 600,
        color: darkMode ? '#ffffff' : '#0a1929',
      },
      h5: {
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#0a1929',
      },
      h6: {
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#0a1929',
      },
      subtitle1: {
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#0a1929',
      },
      subtitle2: {
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#0a1929',
      },
      body1: {
        fontWeight: darkMode ? 400 : 500,
        color: darkMode ? '#ffffff' : '#0a1929',
      },
      body2: {
        fontWeight: darkMode ? 400 : 500,
        color: darkMode ? '#cccccc' : '#3a4a5c',
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        color: darkMode ? '#cccccc' : '#3a4a5c',
        fontWeight: darkMode ? 400 : 500,
      },
      overline: {
        textTransform: 'uppercase',
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
            background: darkMode 
              ? 'linear-gradient(45deg, #7b2cbf 30%, #9d4edd 90%)'
              : 'linear-gradient(45deg, #0059b2 30%, #42a5f5 90%)',
            boxShadow: darkMode 
              ? '0 3px 8px rgba(123, 44, 191, 0.3)'
              : '0 3px 8px rgba(0, 114, 229, 0.3)',
            '&:hover': {
              background: darkMode 
                ? 'linear-gradient(45deg, #9d4edd 30%, #c77dff 90%)'
                : 'linear-gradient(45deg, #0072e5 30%, #64b5f6 90%)',
              boxShadow: darkMode 
                ? '0 4px 10px rgba(157, 78, 221, 0.4)'
                : '0 4px 10px rgba(0, 114, 229, 0.4)',
            },
          },
          outlined: {
            borderColor: darkMode ? 'rgba(157, 78, 221, 0.5)' : 'rgba(93, 0, 224, 0.5)',
            '&:hover': {
              borderColor: darkMode ? '#9d4edd' : '#5d00e0',
              backgroundColor: darkMode ? 'rgba(157, 78, 221, 0.1)' : 'rgba(93, 0, 224, 0.08)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode 
              ? '0 8px 16px rgba(0, 0, 0, 0.3)'
              : '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 4px 10px rgba(0, 0, 0, 0.3)'
              : '0 4px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: darkMode ? '#000000' : '#ffffff',
            borderBottom: darkMode 
              ? '1px solid rgba(157, 78, 221, 0.2)'
              : '1px solid rgba(0, 114, 229, 0.1)',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: darkMode 
                ? 'rgba(157, 78, 221, 0.15)'
                : 'rgba(0, 114, 229, 0.1)',
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: darkMode ? '#9d4edd' : '#0072e5',
              '& + .MuiSwitch-track': {
                backgroundColor: darkMode ? '#7b2cbf' : '#0059b2',
                opacity: 0.5,
              },
            },
          },
          track: {
            backgroundColor: darkMode ? '#555' : '#cbd5e1',
            opacity: 0.3,
          },
          thumb: {
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#000000' : '#ffffff',
            borderRight: darkMode 
              ? '1px solid rgba(157, 78, 221, 0.2)'
              : '1px solid rgba(0, 114, 229, 0.1)',
          }
        }
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            color: darkMode ? '#ffffff' : '#0a1929',
          },
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? 'rgba(157, 78, 221, 0.3)' : 'rgba(0, 114, 229, 0.2)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? 'rgba(157, 78, 221, 0.5)' : 'rgba(0, 114, 229, 0.4)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? '#9d4edd' : '#0072e5',
            },
          },
        }
      },
      MuiChip: {
        styleOverrides: {
          outlined: {
            borderColor: darkMode ? 'rgba(157, 78, 221, 0.3)' : 'rgba(93, 0, 224, 0.3)',
          }
        }
      }
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