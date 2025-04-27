import React, { useState, useContext, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMaskInput } from 'react-imask';
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

// --- Компонент маски для телефона ---
const PhoneMaskCustom = forwardRef(function PhoneMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="+7 (000) 000-00-00"
      definitions={{
        '#': /[1-9]/, // Можно использовать # для цифр, если нужно
      }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
      // unmask={true} // Если нужно сохранять только цифры в state
    />
  );
});
// --- Конец компонента маски ---

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+7 (',
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
    
    // Проверка телефона (теперь проверяем заполненность маски)
    if (!formData.phone) {
      newErrors.phone = 'Телефон обязателен';
    } else {
      // Проверяем, что номер (без маски) имеет нужную длину
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length !== 11) { // +7 и 10 цифр
        newErrors.phone = 'Введите полный номер телефона';
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
    setApiError('');
    setSuccess(false);

    if (!validateForm()) {
      return; // Не отправляем, если есть ошибки валидации
    }

    setLoading(true);

    try {
      // Передаем данные в функцию регистрации
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone, // Передаем отформатированный номер
        password: formData.password,
      });
      
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
      <Container component="main" maxWidth="sm">
        <AuthPaper elevation={6}>
          <LogoBox>
            <LogoText
              variant="h5" 
              component="h1"
            >
              T2 Mobile
            </LogoText>
          </LogoBox>
          
          <Typography component="h1" variant="h5">
            Регистрация нового аккаунта
          </Typography>
          
          {apiError && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{apiError}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>Регистрация прошла успешно!</Alert>}
          
          <Form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="filled"
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="Имя"
                  name="firstName"
                  autoComplete="given-name"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="filled"
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
              variant="filled"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email адрес"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              name="phone"
              label="Номер телефона"
              type="tel" // Используем type="tel"
              id="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                inputComponent: PhoneMaskCustom, // <-- Используем кастомный компонент с маской
              }}
            />
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль (мин. 6 символов)"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Подтвердите пароль"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Зарегистрироваться'}
            </SubmitButton>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={goToLogin} 
                  sx={{ color: '#e0aaff', cursor: 'pointer' }}
                >
                  Уже есть аккаунт? Войти
                </Link>
              </Grid>
            </Grid>
          </Form>
        </AuthPaper>
      </Container>
    </ThemeProvider>
  );
};

export default Register; 