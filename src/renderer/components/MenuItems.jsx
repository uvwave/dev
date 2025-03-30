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
}));

const MenuItems = () => {
  const location = useLocation();
  const { isAdmin } = useContext(AuthContext);

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

  // По умолчанию используем меню для клиентов
  let menuItems = clientMenuItems;

  // Проверяем роль пользователя и выбираем соответствующее меню
  try {
    if (isAdmin && isAdmin()) {
      menuItems = adminMenuItems;
    } else {
      menuItems = clientMenuItems;
    }
  } catch (error) {
    console.error('Ошибка при определении меню:', error);
    // Если возникла ошибка, используем меню для клиентов как более безопасное
    menuItems = clientMenuItems;
  }

  return (
    <List>
      {menuItems.map((item) => (
        <StyledListItem
          button
          component={Link}
          to={item.path}
          key={item.text}
          active={location.pathname === item.path ? 'true' : undefined}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </StyledListItem>
      ))}
    </List>
  );
};

export default MenuItems; 