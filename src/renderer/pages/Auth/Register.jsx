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
  Grid,
  Divider
} from '@mui/material';
import {
  PersonAdd as RegisterIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';

// Стилизованные компоненты
const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 550,
  margin: '0 auto',
  borderRadius: 12,
  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1),
}));

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  // Обработка изменения полей формы
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Валидация формы
  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Пожалуйста, заполните все поля');
      return false;
    }
    
    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Пожалуйста, введите корректный email');
      return false;
    }
    
    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    
    // Проверка сложности пароля
    if (formData.password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return false;
    }
    
    return true;
  };

  // Обработка регистрации
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = register(formData);
      
      if (result.success) {
        navigate('/profile');
      } else {
        setError(result.error || 'Произошла ошибка при регистрации');
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации. Попробуйте еще раз.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <AuthPaper elevation={3}>
        <LogoBox>
          <Typography 
            variant="h4" 
            component="h1" 
            color="primary" 
            fontWeight="500"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            T2 Mobile
          </Typography>
        </LogoBox>
        
        <Typography variant="h5" gutterBottom>
          Регистрация нового аккаунта
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
          Заполните форму для создания личного кабинета
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleRegister}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="Имя"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Фамилия"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="phone"
                label="Телефон"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Пароль"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="confirmPassword"
                label="Подтверждение пароля"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RegisterIcon />}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </SubmitButton>
          
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<BackIcon />}
            onClick={() => navigate('/auth/login')}
            sx={{ mt: 1 }}
          >
            Вернуться к входу
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Уже есть аккаунт?{' '}
              <Link 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/auth/login');
                }}
                color="primary"
              >
                Войти
              </Link>
            </Typography>
          </Box>
        </Form>
      </AuthPaper>
    </Container>
  );
};

export default Register; 