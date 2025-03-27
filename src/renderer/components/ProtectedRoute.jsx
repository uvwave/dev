import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box, Alert, Button } from '@mui/material';

// Компонент для защиты маршрутов, требующих авторизации
const ProtectedRoute = ({ children, requireAdmin }) => {
  console.log('Рендеринг ProtectedRoute');
  const authContext = useContext(AuthContext);
  const location = useLocation();

  // Обработка случая, если контекст недоступен
  if (!authContext) {
    console.error('AuthContext недоступен в ProtectedRoute');
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка: Контекст авторизации недоступен
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Перезагрузить страницу
        </Button>
      </Box>
    );
  }

  const { isAuthenticated, loading, isAdmin, error } = authContext;

  // Если есть ошибка в контексте, показываем сообщение
  if (error) {
    console.error('Ошибка в AuthContext:', error);
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка авторизации: {error}
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Перезагрузить страницу
        </Button>
      </Box>
    );
  }

  // Показываем загрузку, пока проверяется авторизация
  if (loading) {
    console.log('ProtectedRoute: отображение загрузки...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    console.log('ProtectedRoute: пользователь не авторизован, перенаправление на страницу входа');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Если требуется роль администратора, но у пользователя её нет
  if (requireAdmin && !isAdmin()) {
    console.log('ProtectedRoute: пользователь не имеет прав администратора, перенаправление в профиль');
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }
  
  // Если всё в порядке, показываем запрошенный компонент
  console.log('ProtectedRoute: отображение защищенного компонента');
  return children;
};

export default ProtectedRoute; 