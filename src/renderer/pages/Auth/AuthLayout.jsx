import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, Paper, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';

// Стилизованный фон для страниц авторизации
const AuthBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, #303030 30%, #424242 90%)' 
    : 'linear-gradient(45deg, #f5f5f5 30%, #e0e0e0 90%)',
  padding: theme.spacing(2),
}));

const AuthLayout = () => {
  console.log('Рендеринг AuthLayout');
  const authContext = useContext(AuthContext);
  
  // Проверяем, загружаются ли данные пользователя
  if (authContext?.loading) {
    console.log('AuthLayout: отображение загрузки...');
    return (
      <AuthBackground>
        <CircularProgress />
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
      <Container maxWidth="lg">
        <Outlet />
      </Container>
    </AuthBackground>
  );
};

export default AuthLayout; 