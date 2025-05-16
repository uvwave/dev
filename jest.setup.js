// Импортируем jest-dom утилиты
require('@testing-library/jest-dom');

// Создаем мок для window.api
global.window = {
  ...global.window,
  api: {
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
  }
};

// Создаем мок для localStorage
const localStorageMock = (() => {
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
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Подавляем предупреждения и ошибки в консоли во время тестов
global.console.error = jest.fn();
global.console.warn = jest.fn(); 