import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Link,
  Divider,
  Grid
} from '@mui/material';
import {
  PersonAdd as RegisterIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../index';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Создаем темную тему специально для страниц авторизации
const darkAuthTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9d4edd',
      light: '#c77dff',
      dark: '#7b2cbf',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e0aaff',
      light: '#f3d5ff',
      dark: '#b388eb',
      contrastText: '#1a1a2e',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    error: {
      main: '#ff5555',
    },
    warning: {
      main: '#fca311',
    },
    info: {
      main: '#8ecae6',
    },
    success: {
      main: '#2ec4b6',
    },
    divider: 'rgba(157, 78, 221, 0.3)',
  },
});

// Стилизованные компоненты
const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  borderRadius: 12,
  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
  border: '1px solid #9d4edd33',
  background: '#22223b',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: '500',
  background: 'linear-gradient(45deg, #9d4edd, #e0aaff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0, 1),
  padding: theme.spacing(1),
  background: 'linear-gradient(45deg, #7b2cbf 30%, #9d4edd 90%)',
  boxShadow: '0 3px 8px rgba(123, 44, 191, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #9d4edd 30%, #c77dff 90%)',
    boxShadow: '0 4px 10px rgba(157, 78, 221, 0.4)',
  },
}));

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  
  // Безопасное получение функции регистрации из контекста
  const register = authContext?.register || (() => {
    console.error('Функция register не найдена в контексте');
    return { success: false, error: 'Ошибка системы: функция регистрации недоступна' };
  });

  // Обработка изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Очищаем ошибку для изменяемого поля
    setErrors({
      ...errors,
      [name]: ''
    });
    
    // Очищаем общую ошибку API
    setApiError('');
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    // Проверка имени
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Имя должно содержать минимум 2 символа';
    }
    
    // Проверка фамилии
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Фамилия должна содержать минимум 2 символа';
    }
    
    // Проверка email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Введите корректный email';
      }
    }
    
    // Проверка телефона
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else {
      const phoneRegex = /^\+?[0-9\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Введите корректный номер телефона';
      }
    }
    
    // Проверка пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    // Проверка подтверждения пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Форма валидна, если нет ошибок
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем валидность формы
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setApiError('');
    
    try {
      // Вызываем функцию регистрации
      const result = register(formData);
      
      if (result.success) {
        console.log('Регистрация успешна:', result.user);
        setSuccess(true);
        // Перенаправляем пользователя на страницу профиля
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        console.error('Ошибка регистрации:', result.error);
        setApiError(result.error || 'Произошла ошибка при регистрации');
      }
    } catch (err) {
      console.error('Неожиданная ошибка при регистрации:', err);
      setApiError(`Произошла ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Переход на страницу входа
  const goToLogin = () => {
    navigate('/auth/login');
  };

  return (
    <ThemeProvider theme={darkAuthTheme}>
      <Container maxWidth="sm">
        <AuthPaper elevation={3}>
          <LogoBox>
            <LogoText
              variant="h5" 
              component="h1"
            >
              T2 Mobile
            </LogoText>
          </LogoBox>
          
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ color: '#ffffff' }}
          >
            Регистрация
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ mb: 1, fontWeight: 400 }}
          >
            Создайте аккаунт для доступа к сервису
          </Typography>
          
          {apiError && (
            <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 1 }}>
              {apiError}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ width: '100%', mt: 2, mb: 1 }}>
              Регистрация успешно завершена! Перенаправление...
            </Alert>
          )}
          
          <Form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="Имя"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Фамилия"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>
            </Grid>
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Телефон"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Подтверждение пароля"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={goToLogin}
                sx={{ 
                  borderColor: 'rgba(157, 78, 221, 0.5)',
                  color: '#9d4edd',
                  "&:hover": {
                    borderColor: '#9d4edd',
                    backgroundColor: 'rgba(157, 78, 221, 0.08)',
                  }
                }}
              >
                Назад
              </Button>
              
              <SubmitButton
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <RegisterIcon />}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </SubmitButton>
            </Box>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Уже есть аккаунт?{' '}
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={goToLogin}
                  sx={{ 
                    color: '#9d4edd',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    } 
                  }}
                >
                  Войти
                </Link>
              </Typography>
            </Box>
          </Form>
        </AuthPaper>
      </Container>
    </ThemeProvider>
  );
};

export default Register; 