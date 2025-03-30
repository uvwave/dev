import React, { useState, useContext, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { styled, useMediaQuery } from '@mui/material';
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
  Button,
  Fab
} from '@mui/material';

// Иконки
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';

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
import TitleBar from './TitleBar';
import CustomAppBar from './CustomAppBar';
import MenuItems from './MenuItems';

// Константы
const drawerWidth = 240;
const TITLE_BAR_HEIGHT = 38; // Высота кастомного тайтл бара

// Стилизованные компоненты
const Main = styled(Box, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    marginLeft: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    marginTop: `calc(64px + ${TITLE_BAR_HEIGHT}px)`,
    backgroundColor: theme.palette.background.default,
    minHeight: `calc(100vh - 64px - ${TITLE_BAR_HEIGHT}px)`,
    width: `calc(100% - ${open ? drawerWidth : 0}px)`,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'auto',
    overflowX: 'hidden',
    zIndex: 1,
  }),
);

const ContentContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  width: '100%',
  overflow: 'auto',
  overflowX: 'hidden', // Предотвращаем горизонтальную прокрутку
  maxWidth: '100%',
  '& button, & a, & input, & select': {
    zIndex: 2, // Все интерактивные элементы имеют более высокий z-index
    position: 'relative',
  }
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  height: `calc(${theme.mixins.toolbar.minHeight}px + ${TITLE_BAR_HEIGHT}px)`,
}));

const AppBarStyled = styled(CustomAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
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
  marginTop: `${TITLE_BAR_HEIGHT}px`,
}));

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  position: 'relative',
  zIndex: theme.zIndex.drawer - 1, // Боковая панель имеет меньший z-index, чтобы не перекрывать контент
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.mode === 'dark' ? '#0a1929' : '#e1f5fe',
    color: theme.palette.mode === 'dark' ? '#e2e2e2' : '#0a1929',
    borderRight: theme.palette.mode === 'dark' ? '1px solid rgba(0, 114, 229, 0.3)' : '1px solid rgba(0, 114, 229, 0.2)',
    marginTop: TITLE_BAR_HEIGHT,
    height: `calc(100% - ${TITLE_BAR_HEIGHT}px)`,
    overflow: 'auto',
    position: 'fixed',
  },
  '& .MuiListItemIcon-root': {
    color: '#0072e5',
  },
  '& .MuiListItemButton-root:hover': {
    backgroundColor: 'rgba(0, 114, 229, 0.1)',
  },
  '& .MuiListItemButton-root.Mui-selected': {
    backgroundColor: 'rgba(0, 114, 229, 0.08)',
    borderLeft: '3px solid #0072e5',
  },
}));

// Находим компонент, который определяет плавающую кнопку с плюсом
const FloatingActionButtonStyled = styled(Fab)(({ theme, open }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2), // Меняем позицию с left на right
  zIndex: 999,
  backgroundColor: '#0072e5',
  '&:hover': {
    backgroundColor: '#0059b2',
  },
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
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
  
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

  // Функция для перехода на страницу создания новой продажи
  const handleNewSaleClick = () => {
    navigate('/sales/new');
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

  // Если это мобильное устройство, закрыть панель по умолчанию
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      <CssBaseline />
      
      {/* Кастомный тайтл-бар */}
      <TitleBar />
      
      {error && (
        <Alert severity="error" sx={{ position: 'fixed', top: TITLE_BAR_HEIGHT, left: 0, right: 0, zIndex: 9999 }}>
          Произошла ошибка: {error}
          <Button variant="outlined" size="small" onClick={() => setError(null)} sx={{ ml: 2 }}>
            Закрыть
          </Button>
        </Alert>
      )}
      
      {/* Основная панель навигации */}
      <AppBarStyled open={open} handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      
      {/* Боковая панель - теперь абсолютно позиционирована */}
      <DrawerStyled
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          position: 'absolute',
          top: `calc(${TITLE_BAR_HEIGHT}px + 64px)`,
          left: 0,
          bottom: 0,
          height: 'auto',
          zIndex: 0
        }}
      >
        <Divider sx={{ backgroundColor: '#9d4edd33' }} />
        <List component="nav">
          <MenuItems />
        </List>
      </DrawerStyled>

      {/* Основной контент */}
      <Main open={open}>
        <ContentContainer>
          <Suspense fallback={<LoadingComponent />}>
            <Routes>
              {/* Маршруты для авторизованных пользователей */}
              <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                <Route path="/" element={<Dashboard />} />
                
                {/* Маршруты только для администратора */}
                <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} userType="admin" isAdmin={isAdmin} />}>
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetails />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/sales/new" element={<NewSale />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                
                {/* Маршруты только для клиента */}
                <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} userType="client" isClient={isClient} />}>
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                
                {/* Перенаправление для авторизованных пользователей */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
              
              {/* Маршруты для неавторизованных пользователей */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
              </Route>
              
              {/* Перенаправление по умолчанию */}
              <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth/login"} replace />} />
            </Routes>
          </Suspense>
        </ContentContainer>
      </Main>

      {/* Кнопка добавления - отображается только для администратора */}
      {isAdmin && isAdmin() && (
        <FloatingActionButtonStyled 
          color="primary" 
          aria-label="add" 
          onClick={handleNewSaleClick}
          open={open}
        >
          <AddIcon />
        </FloatingActionButtonStyled>
      )}
    </Box>
  );
}

export default App; 