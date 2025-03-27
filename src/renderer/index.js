import React, { createContext, useState, useMemo, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CircularProgress, Alert, Button, Typography } from '@mui/material';
import App from './components/App';
import './styles/index.css';
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