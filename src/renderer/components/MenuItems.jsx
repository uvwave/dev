import React, { useContext } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, styled } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Импорт иконок
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

// Стилизованные компоненты
const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: '8px',
  marginBottom: '4px',
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: active 
      ? theme.palette.primary.main 
      : theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.04)',
  },
  '& .MuiListItemIcon-root': {
    color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  },
  '&.Mui-disabled': {
    opacity: 1, // Отменяем затухание для отключенного элемента
  },
}));

const MenuItems = () => {
  const location = useLocation();
  const { isAdmin, currentUser } = useContext(AuthContext);

  console.log('Текущий путь:', location.pathname);
  console.log('Текущий пользователь:', currentUser);
  console.log('isAdmin функция существует:', !!isAdmin);
  console.log('Результат isAdmin():', isAdmin && isAdmin());

  // Элементы меню для администратора
  const adminMenuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Клиенты', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Продажи', icon: <ShoppingCartIcon />, path: '/sales' },
    { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Элементы меню для клиента
  const clientMenuItems = [
    { text: 'Личный кабинет', icon: <AccountCircleIcon />, path: '/profile' },
    { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Определяем, является ли текущий пользователь администратором
  const userIsAdmin = isAdmin && isAdmin();
  console.log('Пользователь является администратором:', userIsAdmin);
  
  // Выбираем меню в зависимости от роли пользователя
  const menuItems = userIsAdmin ? adminMenuItems : clientMenuItems;

  // Проверка активности элемента меню
  const isItemActive = (itemPath) => {
    // Для корневого пути '/' проверяем точное совпадение
    if (itemPath === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    // Для других путей проверяем, начинается ли текущий путь с пути элемента меню
    return location.pathname.startsWith(itemPath);
  };

  return (
    <List>
      {menuItems.map((item) => (
        <StyledListItem
          button
          component={Link}
          to={item.path}
          key={item.text}
          active={isItemActive(item.path) ? 'true' : undefined}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </StyledListItem>
      ))}
    </List>
  );
};

export default MenuItems; 