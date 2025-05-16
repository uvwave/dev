import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для работы с аутентификацией пользователя
 * @returns {Object} Объект с данными об аутентификации и методами для работы с ней
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка пользователя при инициализации
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        // Получаем пользователя из localStorage или из API
        const userData = localStorage.getItem('user');
        
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки пользователя');
        console.error('Ошибка загрузки пользователя:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Авторизация пользователя
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Отправляем запрос на авторизацию
      const response = await window.api.auth.login({ email, password });
      
      if (response.success && response.data) {
        // Сохраняем пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        throw new Error(response.message || 'Ошибка авторизации');
      }
    } catch (err) {
      setError(err.message || 'Ошибка авторизации');
      console.error('Ошибка авторизации:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Выход из системы
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Отправляем запрос на выход
      const response = await window.api.auth.logout();
      
      if (response.success) {
        // Удаляем пользователя из localStorage
        localStorage.removeItem('user');
        setUser(null);
        return { success: true };
      } else {
        throw new Error(response.message || 'Ошибка выхода из системы');
      }
    } catch (err) {
      setError(err.message || 'Ошибка выхода из системы');
      console.error('Ошибка выхода из системы:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Проверка прав администратора
  const isAdmin = useCallback(() => {
    return user?.type === 'admin';
  }, [user]);

  // Проверка прав менеджера по продажам
  const isSalesManager = useCallback(() => {
    return user?.type === 'sales_manager';
  }, [user]);

  // Проверка административных прав (админ или менеджер продаж)
  const hasAdminRights = useCallback(() => {
    return user?.type === 'admin' || user?.type === 'sales_manager';
  }, [user]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isSalesManager,
    hasAdminRights,
    isAuthenticated: !!user
  };
}; 