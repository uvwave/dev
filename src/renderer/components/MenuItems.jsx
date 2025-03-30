import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as SalesIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../index';

// Стилизованный компонент для кнопки меню
const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: 8,
  margin: theme.spacing(0.5, 1),
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.25),
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': {
      fontWeight: 'bold',
      color: theme.palette.primary.main,
    },
    borderLeft: `3px solid ${theme.palette.primary.main}`,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

// Стилизованная иконка для меню
const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  color: theme.palette.primary.main,
}));

// Стилизованный текст для меню
const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiTypography-root': {
    fontSize: '0.95rem',
    fontWeight: 'medium',
  },
}));

// Компонент меню
const MenuItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  
  // Функции для проверки роли пользователя
  const isAdmin = authContext?.isAdmin || (() => false);
  const isClient = authContext?.isClient || (() => false);

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

  // Выбор элементов меню в зависимости от роли
  const menuItems = isAdmin() ? adminMenuItems : clientMenuItems;

  return (
    <>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <StyledListItemButton
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <StyledListItemIcon>
              {item.icon}
            </StyledListItemIcon>
            <StyledListItemText primary={item.text} />
          </StyledListItemButton>
        </ListItem>
      ))}
    </>
  );
};

export default MenuItems; 