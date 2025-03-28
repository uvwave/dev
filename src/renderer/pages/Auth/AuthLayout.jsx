import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, Paper, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import TitleBar from '../../components/TitleBar';

// Стилизованный фон для страниц авторизации
const AuthBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #22223b 100%)',
  padding: theme.spacing(2),
}));

// Компактный контейнер для формы
const AuthContainer = styled(Container)(({ theme }) => ({
  maxWidth: '400px',
  padding: 0,
}));

const AuthLayout = () => {
  console.log('Рендеринг AuthLayout');
  const authContext = useContext(AuthContext);
  
  // Проверяем, загружаются ли данные пользователя
  if (authContext?.loading) {
    console.log('AuthLayout: отображение загрузки...');
    return (
      <AuthBackground>
        <CircularProgress sx={{ color: '#9d4edd' }} />
      </AuthBackground>
    );
  }
  
  // Если пользователь уже авторизован, перенаправляем на нужную страницу
  if (authContext?.isAuthenticated) {
    console.log('AuthLayout: перенаправление авторизованного пользователя');
    const isAdmin = authContext.isAdmin && authContext.isAdmin();
    return <Navigate to={isAdmin ? '/' : '/profile'} replace />;
  }

  // Отображаем страницы входа/регистрации
  return (
    <AuthBackground>
      <AuthContainer maxWidth={false}>
        <TitleBar />
        <Outlet />
      </AuthContainer>
    </AuthBackground>
  );
};

export default AuthLayout; 