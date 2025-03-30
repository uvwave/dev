import React, { useState, useContext, useEffect } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Login as LoginIcon,
  PersonAdd as RegisterIcon
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

const Login = () => {
  console.log('Рендеринг компонента Login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  
  useEffect(() => {
    // Проверяем, если AuthContext содержит ошибку
    if (authContext?.error) {
      console.error('Ошибка из AuthContext:', authContext.error);
      setError(`Ошибка системы: ${authContext.error}`);
    }
  }, [authContext]);
  
  // Безопасно получаем функцию login из контекста
  const login = authContext?.login || (() => {
    console.error('Функция login не найдена в контексте');
    return { success: false, error: 'Ошибка системы: функция входа недоступна' };
  });

  // Обработка изменения email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  // Обработка изменения пароля
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Обработка входа
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Попытка входа с данными:', { email, password: '***' });
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    // Проверка формата email
    if (!validateEmail(email)) {
      setError('Пожалуйста, введите корректный email (например, example@domain.com)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = login(email, password);
      console.log('Результат входа:', result);
      
      if (result.success) {
        console.log('Успешный вход, перенаправление пользователя');
        // Перенаправление в зависимости от типа пользователя
        if (result.user && result.user.type === 'admin') {
          console.log('Перенаправление администратора на дашборд');
          navigate('/');
        } else {
          console.log('Перенаправление клиента в личный кабинет');
          navigate('/profile');
        }
      } else {
        console.error('Ошибка входа:', result.error);
        setError(result.error || 'Неизвестная ошибка при входе');
      }
    } catch (err) {
      console.error('Неожиданная ошибка при входе:', err);
      setError(`Произошла ошибка при входе: ${err.message}. Попробуйте еще раз.`);
    } finally {
      setLoading(false);
    }
  };

  // Функция перезагрузки страницы при критической ошибке
  const handleRefresh = () => {
    window.location.reload();
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
            Вход в систему
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ mb: 1, fontWeight: 400 }}
          >
            Введите данные для входа
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ width: '100%', mt: 2 }}
              action={
                error.includes('Ошибка системы') && (
                  <Button color="inherit" size="small" onClick={handleRefresh}>
                    Перезагрузить
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          )}
          
          <Form noValidate onSubmit={handleLogin}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              autoFocus
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
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
            />
            
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LoginIcon />}
            >
              {loading ? 'Вход...' : 'Войти'}
            </SubmitButton>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Нет аккаунта?{' '}
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => navigate('/auth/register')}
                  sx={{ 
                    color: '#9d4edd',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    } 
                  }}
                >
                  Зарегистрироваться
                </Link>
              </Typography>
            </Box>
          </Form>
        </AuthPaper>
      </Container>
    </ThemeProvider>
  );
};

export default Login; 