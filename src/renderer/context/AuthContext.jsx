import React, { createContext, useState, useEffect } from 'react';

// Создаем контекст для авторизации
export const AuthContext = createContext();

// Тип пользователя
const USER_TYPES = {
  ADMIN: 'admin',
  CLIENT: 'client'
};

// Создаем провайдер контекста авторизации
export const AuthProvider = ({ children }) => {
  console.log('Рендеринг AuthProvider');
  
  // Состояния для авторизации
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Имитация загрузки пользователя из хранилища при запуске
  useEffect(() => {
    console.log('AuthProvider - useEffect запущен');
    
    // // Сбрасываем данные авторизации для исправления проблемы с приложением
    // localStorage.removeItem('currentUser');
    
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        console.log('Загруженные данные пользователя из localStorage:', storedUser);
        
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('Распарсенный пользователь:', user);
            // Проверяем, что пользователь имеет все необходимые поля
            if (user && user.id && user.email && user.type) {
              setCurrentUser(user);
              setIsAuthenticated(true);
            } else {
              console.warn('Данные пользователя некорректны, сбрасываем состояние');
              localStorage.removeItem('currentUser');
            }
          } catch (parseError) {
            console.error('Ошибка при парсинге JSON:', parseError);
            localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
        setError('Ошибка загрузки пользователя: ' + error.message);
        localStorage.removeItem('currentUser');
      } finally {
        console.log('Завершение загрузки данных пользователя');
        setLoading(false);
      }
    };

    // Добавим небольшую задержку для имитации загрузки с сервера
    const timer = setTimeout(() => {
      try {
        loadUserFromStorage();
      } catch (err) {
        console.error('Критическая ошибка при загрузке данных пользователя:', err);
        setError('Ошибка в AuthContext: ' + err.message);
        localStorage.removeItem('currentUser');
        setLoading(false);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Эффект для отслеживания изменений состояния аутентификации
  useEffect(() => {
    try {
      console.log('Состояние аутентификации изменилось:', { isAuthenticated, currentUser });
    } catch (err) {
      console.error('Ошибка при логировании состояния:', err);
    }
  }, [isAuthenticated, currentUser]);

  // Функция входа пользователя
  const login = async (email, password) => {
    try {
      console.log('Попытка входа:', email);
      
      // Проверка наличия API
      if (!window.api || !window.api.auth) {
        console.error('API аутентификации недоступно');
        
        // Используем резервный вариант для демо, если API недоступно
        // Пример администратора
        if (email === 'admin@t2mobile.ru' && password === 'admin123') {
          const adminUser = {
            id: 'admin1',
            email: email,
            name: 'Администратор',
            type: USER_TYPES.ADMIN,
            phone: '+7 (999) 123-45-67'
          };
          
          console.log('Успешный вход администратора (резервный):', adminUser);
          setCurrentUser(adminUser);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(adminUser));
          return { success: true, user: adminUser };
        }
        
        // Пример клиента
        if (email === 'client@example.com' && password === 'client123') {
          const clientUser = {
            id: 'client1',
            email: email,
            name: 'Иван Петров',
            type: USER_TYPES.CLIENT,
            package: null,
            phone: '+7 (999) 765-43-21'
          };
          
          console.log('Успешный вход клиента (резервный):', clientUser);
          setCurrentUser(clientUser);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(clientUser));
          return { success: true, user: clientUser };
        }
        
        return { success: false, error: 'API аутентификации недоступно и данные не совпадают с демо учетными записями' };
      }
      
      // Используем API для проверки учетных данных
      const result = await window.api.auth.login({ email, password });
      
      if (result.success) {
        console.log('Успешный вход пользователя через API:', result.user);
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
      } else {
        console.log('Неудачная попытка входа через API:', result.error);
      }
      
      return result;
    } catch (err) {
      console.error('Ошибка при входе:', err);
      return { success: false, error: 'Произошла ошибка при входе: ' + err.message };
    }
  };

  // Функция регистрации пользователя
  const register = async (userData) => {
    try {
      console.log('Регистрация пользователя через API:', userData);

      // Проверка наличия API
      if (!window.api || !window.api.auth || !window.api.auth.register) {
        console.error('API регистрации недоступно');
        // Можно оставить резервный вариант или просто вернуть ошибку
        return { success: false, error: 'API регистрации недоступно' }; 
      }

      // Вызов API основного процесса для регистрации
      const result = await window.api.auth.register(userData);

      if (result.success) {
        console.log('Успешная регистрация через API:', result.user);
        setCurrentUser(result.user); // result.user should contain the user data
        setIsAuthenticated(true);
        // Optionally store JWT token if returned in result.token
        if (result.token) {
           localStorage.setItem('authToken', result.token); // Store token separately
        }
        // Store user data WITHOUT sensitive info like password hash if needed
        localStorage.setItem('currentUser', JSON.stringify(result.user)); 
      } else {
        console.log('Неудачная попытка регистрации через API:', result.error);
        setError(result.error || 'Неизвестная ошибка регистрации'); // Set error state
      }
      
      return result; // Return the result from the API call
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      setError('Произошла ошибка при регистрации: ' + err.message); // Set error state
      return { success: false, error: 'Произошла ошибка при регистрации: ' + err.message };
    }
  };

  // Функция выхода пользователя
  const logout = () => {
    try {
      console.log('Выход пользователя');
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('currentUser');
    } catch (err) {
      console.error('Ошибка при выходе:', err);
      setError('Ошибка при выходе: ' + err.message);
    }
  };

  // Функция обновления данных пользователя
  const updateUserData = (updatedData) => {
    try {
      if (!currentUser) {
        console.error('Попытка обновления данных без авторизации');
        return { success: false, error: 'Пользователь не авторизован' };
      }
      
      console.log('Обновление данных пользователя:', updatedData);
      const updatedUser = { ...currentUser, ...updatedData };
      console.log('Обновленный пользователь:', updatedUser);
      
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Ошибка при обновлении данных:', err);
      return { success: false, error: 'Произошла ошибка при обновлении данных: ' + err.message };
    }
  };

  // Проверка, является ли пользователь администратором
  const isAdmin = () => {
    try {
      // Безопасная проверка типа пользователя
      return currentUser && currentUser.type === USER_TYPES.ADMIN;
    } catch (err) {
      console.error('Ошибка при проверке роли админа:', err);
      return false;
    }
  };

  // Проверка, является ли пользователь клиентом
  const isClient = () => {
    try {
      // Безопасная проверка типа пользователя
      return currentUser && currentUser.type === USER_TYPES.CLIENT;
    } catch (err) {
      console.error('Ошибка при проверке роли клиента:', err);
      return false;
    }
  };

  // Значение контекста
  const contextValue = {
    isAuthenticated,
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUserData,
    isAdmin,
    isClient,
    USER_TYPES
  };

  try {
    console.log('AuthProvider рендерится с значениями:', {
      isAuthenticated,
      currentUser: currentUser ? `${currentUser.name} (${currentUser.type})` : 'null',
      loading
    });
  } catch (err) {
    console.error('Ошибка при логировании значений AuthProvider:', err);
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 