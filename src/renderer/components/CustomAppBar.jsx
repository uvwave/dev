import React, { useState, useContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar, 
  Badge, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Notifications as NotificationsIcon, 
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../index';

// Константа для высоты тайтл-бара
const TITLE_BAR_HEIGHT = 38;

// Стилизованная панель приложения
const CustomAppBarStyled = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#0a1929' : '#e1f5fe',
  borderBottom: theme.palette.mode === 'dark' ? '1px solid rgba(0, 114, 229, 0.3)' : '1px solid rgba(0, 114, 229, 0.2)',
  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  marginTop: TITLE_BAR_HEIGHT,
  zIndex: theme.zIndex.drawer + 1,
}));

// Стилизованный тулбар
const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  '& .MuiIconButton-root': {
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#121212',
    '&:hover': {
      backgroundColor: 'rgba(157, 78, 221, 0.1)',
    },
  }
}));

// Стилизованные разделы тулбара
const ToolbarSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

// Компонент верхней панели приложения
const CustomAppBar = ({ open, handleDrawerToggle, drawerWidth }) => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { currentUser: user, logout } = authContext || { currentUser: null, logout: () => {} };
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const { darkMode } = useContext(ThemeContext);
  
  // Открытие меню пользователя
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Закрытие меню пользователя
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Открытие меню уведомлений
  const handleNotificationsMenu = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  // Закрытие меню уведомлений
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  // Переход на страницу настроек
  const handleSettingsClick = () => {
    handleClose();
    navigate('/settings');
  };

  // Выход из системы
  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  return (
    <CustomAppBarStyled position="fixed">
      <StyledToolbar>
        <ToolbarSection>
          <IconButton
            color="inherit"
            aria-label={open ? "скрыть меню" : "показать меню"}
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 2,
              color: darkMode ? '#ffffff' : '#0a1929',
              transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: theme => theme.transitions.create('transform', {
                duration: theme.transitions.duration.standard,
              }),
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              color: '#0072e5',
            }}
          >
            T2 Mobile
          </Typography>
        </ToolbarSection>
        
        <ToolbarSection>
          {/* Профиль пользователя */}
          <Box sx={{ ml: 1 }}>
            <Tooltip title="Профиль">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{ color: darkMode ? '#ffffff' : '#0a1929' }}
              >
                {user?.avatar ? (
                  <Avatar 
                    src={user.avatar} 
                    alt={user?.name || "User"} 
                    sx={{ width: 32, height: 32, border: `2px solid ${darkMode ? '#9d4edd' : '#0072e5'}` }}
                  />
                ) : (
                  <AccountCircleIcon />
                )}
              </IconButton>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  backgroundColor: darkMode ? '#22223b' : '#ffffff',
                  border: darkMode ? '1px solid #9d4edd33' : '1px solid rgba(0, 114, 229, 0.2)',
                  boxShadow: darkMode ? '0 4px 10px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.1)',
                  color: darkMode ? '#ffffff' : '#0a1929'
                }
              }}
            >
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Avatar 
                    src={user?.avatar} 
                    alt={user?.name || "User"} 
                    sx={{ width: 24, height: 24 }}
                  />
                </ListItemIcon>
                <ListItemText>
                  {user?.name || "Пользователь"}
                </ListItemText>
              </MenuItem>
              
              <MenuItem onClick={handleSettingsClick}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" sx={{ color: darkMode ? '#9d4edd' : '#0072e5' }} />
                </ListItemIcon>
                <ListItemText>Настройки</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: '#ff5555' }} />
                </ListItemIcon>
                <ListItemText>Выход</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </ToolbarSection>
      </StyledToolbar>
    </CustomAppBarStyled>
  );
};

export default CustomAppBar; 