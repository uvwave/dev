import React, { useState, useContext, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  CssBaseline, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';

// Иконки
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Страницы
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import CustomerDetails from '../pages/CustomerDetails';
import Sales from '../pages/Sales';
import NewSale from '../pages/NewSale';
import Settings from '../pages/Settings';
import UserProfile from '../pages/Profile/UserProfile';

// Страницы аутентификации
import AuthLayout from '../pages/Auth/AuthLayout';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

// Импорт контекстов
import { ThemeContext } from '../index';
import { AuthContext } from '../context/AuthContext';

// Компоненты
import ProtectedRoute from './ProtectedRoute';

// Константы
const drawerWidth = 240;

// Стилизованные компоненты
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

// Компонент загрузки
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Основной компонент приложения
function App() {
  console.log('Рендеринг App компонента');
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  // Получаем данные из контекстов
  const { language } = useContext(ThemeContext);
  const authContext = useContext(AuthContext);
  
  // Обработка ошибок в контексте
  const { isAuthenticated, currentUser, logout, isAdmin, isClient, loading } = 
    authContext || { 
      isAuthenticated: false, 
      currentUser: null, 
      logout: () => {}, 
      isAdmin: () => false, 
      isClient: () => false, 
      loading: true 
    };

  // Отладка
  useEffect(() => {
    try {
      console.log('App useEffect - currentUser:', currentUser);
      console.log('App useEffect - isAuthenticated:', isAuthenticated);
      console.log('App useEffect - isAdmin:', isAdmin ? isAdmin() : 'функция isAdmin не определена');
      console.log('App useEffect - isClient:', isClient ? isClient() : 'функция isClient не определена');
    } catch (err) {
      console.error('Ошибка в useEffect App.jsx:', err);
      setError(err.message);
    }
  }, [currentUser, isAuthenticated, isAdmin, isClient]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Обработка меню профиля
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // Обработка выхода из системы
  const handleLogout = () => {
    handleProfileMenuClose();
    if (logout) {
      logout();
      // Форсированное перенаправление на страницу логина
      // с небольшой задержкой для обработки обновления состояния
      setTimeout(() => {
        navigate('/auth/login', { replace: true });
        // Полная перезагрузка компонента для сброса состояния UI
        window.location.reload();
      }, 100);
    }
  };

  // Формируем заголовок страницы на основе текущего маршрута
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/' || path === '') return 'Дашборд';
    if (path === '/customers') return 'Клиенты';
    if (path.startsWith('/customers/')) return 'Информация о клиенте';
    if (path === '/sales') return 'Продажи';
    if (path === '/sales/new') return 'Новая продажа';
    if (path === '/settings') return 'Настройки';
    if (path === '/profile') return 'Личный кабинет';
    
    return 'T2 Mobile';
  };

  // Элементы меню для администратора
  const adminMenuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
    { text: 'Клиенты', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Продажи', icon: <ShoppingCartIcon />, path: '/sales' },
    { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Элементы меню для клиента
  const clientMenuItems = [
    { text: 'Личный кабинет', icon: <AccountCircleIcon />, path: '/profile' },
    { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Если произошла ошибка, показываем сообщение об ошибке
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Произошла ошибка: {error}
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Перезагрузить страницу
        </Button>
      </Box>
    );
  }

  // Если загрузка данных пользователя еще не завершена, показываем индикатор загрузки
  if (loading) {
    console.log('Отображение загрузки...');
    return <LoadingComponent />;
  }

  // Проверяем, находится ли пользователь на странице аутентификации
  const isAuthPage = location.pathname.startsWith('/auth/');

  // Если пользователь не авторизован и не находится на странице авторизации, 
  // показываем страницы авторизации
  if (!isAuthenticated && !isAuthPage) {
    console.log('Перенаправление на страницу входа...');
    return (
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    );
  }

  // Если пользователь не авторизован или находится в процессе выхода, 
  // безусловно отображаем экран авторизации
  console.log('Проверка состояния авторизации:', { isAuthenticated, isAuthPage, loading });
  
  // Принудительно отобразить страницу авторизации в любом случае кроме авторизованного пользователя
  if (!isAuthenticated) {
    console.log('ФОРСИРОВАННОЕ перенаправление на страницу входа...');
    
    // Для отладки - проверить, есть ли данные в localStorage
    try {
      const storedUser = localStorage.getItem('currentUser');
      console.log('Данные в localStorage:', storedUser);
      if (storedUser) {
        console.log('Обнаружены устаревшие данные в localStorage, очищаем...');
        localStorage.removeItem('currentUser');
      }
    } catch (e) {
      console.error('Ошибка при проверке localStorage:', e);
    }
    
    return (
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    );
  }

  // Если пользователь авторизован, но находится на странице авторизации,
  // перенаправляем на соответствующую страницу
  if (isAuthenticated && isAuthPage) {
    console.log('Перенаправление с страницы авторизации...');
    return <Navigate to={isAdmin() ? '/' : '/profile'} replace />;
  }

  // Выбор элементов меню в зависимости от роли
  const menuItems = isAdmin && isAdmin() ? adminMenuItems : clientMenuItems;

  // Основной макет для авторизованных пользователей
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Верхняя панель */}
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Профиль">
                <IconButton 
                  color="inherit" 
                  onClick={handleProfileMenuOpen}
                  size="large"
                  edge="end"
                  aria-haspopup="true"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {currentUser?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => {
                  handleProfileMenuClose();
                  navigate(isClient && isClient() ? '/profile' : '/settings');
                }}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Профиль</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Выйти</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBarStyled>
      
      {/* Боковое меню */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                mr: 1
              }}
            >
              T2
            </Avatar>
            <Typography variant="h6" noWrap>
              T2 Mobile
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose}>
            <MenuIcon />
          </IconButton>
        </DrawerHeader>
        
        <Divider />
        
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* Основное содержимое */}
      <Main open={open}>
        <DrawerHeader />
        <Suspense fallback={<LoadingComponent />}>
          <Routes>
            {/* Маршруты администратора */}
            <Route path="/" element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute requireAdmin={true}>
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="/customers/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <CustomerDetails />
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute requireAdmin={true}>
                <Sales />
              </ProtectedRoute>
            } />
            <Route path="/sales/new" element={
              <ProtectedRoute requireAdmin={true}>
                <NewSale />
              </ProtectedRoute>
            } />
            
            {/* Общие маршруты */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Маршруты клиента */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            {/* Перенаправления */}
            <Route path="/auth/*" element={<Navigate to="/auth/login" replace />} />
            <Route path="*" element={
              <Navigate to={isAdmin && isAdmin() ? '/' : '/profile'} replace />
            } />
          </Routes>
        </Suspense>
      </Main>
    </Box>
  );
}

export default App; 