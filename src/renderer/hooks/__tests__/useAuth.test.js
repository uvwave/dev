import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Мокаем локальное хранилище
const mockLocalStorage = (() => {
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
  value: mockLocalStorage
});

// Мокаем ответы от API
jest.mock('window.api', () => ({
  auth: {
    login: jest.fn(),
    logout: jest.fn()
  }
}), { virtual: true });

describe('useAuth Hook', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  test('Начальное состояние без пользователя', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false); // После инициализации
  });

  test('Загружает пользователя из localStorage при инициализации', () => {
    const userData = { id: 1, email: 'test@example.com', type: 'admin', name: 'Test User' };
    mockLocalStorage.setItem('user', JSON.stringify(userData));
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toEqual(userData);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('Правильно проверяет права администратора', () => {
    const adminUser = { id: 1, email: 'admin@example.com', type: 'admin', name: 'Admin' };
    mockLocalStorage.setItem('user', JSON.stringify(adminUser));
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isSalesManager()).toBe(false);
    expect(result.current.hasAdminRights()).toBe(true);
  });

  test('Правильно проверяет права менеджера по продажам', () => {
    const salesManagerUser = { id: 2, email: 'sales@example.com', type: 'sales_manager', name: 'Sales Manager' };
    mockLocalStorage.setItem('user', JSON.stringify(salesManagerUser));
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isSalesManager()).toBe(true);
    expect(result.current.hasAdminRights()).toBe(true);
  });

  test('Правильно проверяет права обычного пользователя', () => {
    const regularUser = { id: 3, email: 'user@example.com', type: 'client', name: 'Regular User' };
    mockLocalStorage.setItem('user', JSON.stringify(regularUser));
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isSalesManager()).toBe(false);
    expect(result.current.hasAdminRights()).toBe(false);
  });
}); 