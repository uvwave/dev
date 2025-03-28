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
  Menu as MenuIcon, 
  Notifications as NotificationsIcon, 
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Константа для высоты тайтл-бара
const TITLE_BAR_HEIGHT = 38;

// Стилизованная панель приложения
const CustomAppBarStyled = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1a1a2e',
  borderBottom: '1px solid #9d4edd33',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
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
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 2,
              color: '#ffffff',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #9d4edd, #e0aaff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
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
                sx={{ color: '#ffffff' }}
              >
                {user?.avatar ? (
                  <Avatar 
                    src={user.avatar} 
                    alt={user?.name || "User"} 
                    sx={{ width: 32, height: 32, border: '2px solid #9d4edd' }}
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
                  backgroundColor: '#22223b',
                  border: '1px solid #9d4edd33',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  color: '#ffffff'
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
                  <SettingsIcon fontSize="small" sx={{ color: '#9d4edd' }} />
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