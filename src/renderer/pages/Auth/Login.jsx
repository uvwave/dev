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
  Divider
} from '@mui/material';
import {
  Login as LoginIcon,
  PersonAdd as RegisterIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';

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
  marginTop: theme.spacing(2)
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

  // Обработка входа
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Попытка входа с данными:', { email, password: '***' });
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
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
        
        <Typography variant="h6" gutterBottom>
          Вход в систему
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
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
        
        <Form onSubmit={handleLogin}>
          <TextField
            variant="outlined"
            margin="dense"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            size="small"
          />
          
          <TextField
            variant="outlined"
            margin="dense"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            size="small"
          />
          
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
          >
            {loading ? 'Выполняется вход...' : 'Войти'}
          </SubmitButton>
          
          <Box sx={{ mt: 1.5, textAlign: 'center' }}>
            <Typography variant="body2">
              У вас нет аккаунта?{' '}
              <Link 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/auth/register');
                }}
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
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Тестовые аккаунты:<br />
              admin@t2mobile.ru / admin123<br />
              client@example.com / client123
            </Typography>
          </Box>
        </Form>
      </AuthPaper>
    </Container>
  );
};

export default Login; 