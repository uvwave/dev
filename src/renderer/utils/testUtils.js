import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';

// Создаем тему для тестов
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * Обертка для рендеринга компонентов в тестах с необходимым контекстом
 * @param {React.ReactNode} ui - Компонент для рендеринга
 * @param {Object} options - Дополнительные опции для рендеринга
 * @returns {Object} - Результат рендеринга с дополнительными функциями для тестирования
 */
export const renderWithProviders = (ui, options = {}) => {
  const { 
    route = '/',
    initialEntries = [route],
    ...renderOptions 
  } = options;

  const Wrapper = ({ children }) => {
    return (
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Мок для localStorage в тестах
 */
export const mockLocalStorage = () => {
  let store = {};
  
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
};

/**
 * Мок для window.api в тестах
 */
export const mockWindowApi = () => {
  return {
    auth: {
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    },
    customers: {
      create: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    sales: {
      create: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    users: {
      changeUserRole: jest.fn(),
      adminResetPassword: jest.fn(),
      deleteUserAccount: jest.fn()
    },
    window: {
      close: jest.fn(),
      minimize: jest.fn(),
      maximize: jest.fn()
    }
  };
}; 