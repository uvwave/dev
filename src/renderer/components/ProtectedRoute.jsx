import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

/**
 * Компонент для защиты маршрутов, требующих авторизации.
 * Поддерживает проверку прав доступа для различных типов пользователей.
 * 
 * @param {Object} props Свойства компонента
 * @param {boolean} props.isAuthenticated Флаг аутентификации пользователя
 * @param {string} [props.userType] Требуемый тип пользователя ('admin', 'client')
 * @param {function} [props.isAdmin] Функция проверки, является ли пользователь администратором
 * @param {function} [props.isClient] Функция проверки, является ли пользователь клиентом
 */
const ProtectedRoute = ({ isAuthenticated, userType, isAdmin, isClient }) => {
  console.log('Рендеринг ProtectedRoute с параметрами:', { isAuthenticated, userType });
  const location = useLocation();

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    console.log('ProtectedRoute: пользователь не авторизован, перенаправление на страницу входа');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Проверка прав доступа для администратора
  if (userType === 'admin' && isAdmin && !isAdmin()) {
    console.log('ProtectedRoute: пользователь не имеет прав администратора, перенаправление в профиль');
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }
  
  // Проверка прав доступа для клиента
  if (userType === 'client' && isClient && !isClient()) {
    console.log('ProtectedRoute: пользователь не является клиентом, перенаправление на главную');
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Если всё в порядке, показываем дочерние компоненты через Outlet
  console.log('ProtectedRoute: отображение защищенного компонента');
  return <Outlet />;
};

export default ProtectedRoute; 