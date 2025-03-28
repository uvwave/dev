import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  CropSquare as MaximizeIcon,
  AspectRatio as RestoreIcon
} from '@mui/icons-material';

// Высота тайтл-бара
const TITLE_BAR_HEIGHT = 38;

// Стилизованный контейнер для тайтл-бара
const TitleBarContainer = styled(Box)(({ theme }) => ({
  height: TITLE_BAR_HEIGHT,
  backgroundColor: '#1a1a2e',
  color: '#e2e2e2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.drawer + 2,
  borderBottom: '1px solid #9d4edd33',
  padding: '0 8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
}));

// Стилизованный контейнер для кнопок управления окном
const WindowControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

// Стилизованная кнопка управления окном
const WindowButton = styled(IconButton)(({ theme, color }) => ({
  padding: 6,
  marginLeft: 2,
  borderRadius: 4,
  color: '#b8b8b8',
  '&:hover': {
    backgroundColor: color === 'close' 
      ? 'rgba(255, 85, 85, 0.2)' 
      : 'rgba(157, 78, 221, 0.1)',
    color: color === 'close' ? '#ff5555' : '#ffffff'
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  },
}));

// Стилизованный логотип
const Logo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: 8,
});

// Стилизованный круглый логотип
const LogoIcon = styled(Box)({
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: '#9d4edd',
  marginRight: 8,
  boxShadow: '0 0 5px rgba(157, 78, 221, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 'bold',
  color: '#ffffff',
});

// Компонент тайтл-бара
const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  // Проверяем, максимизировано ли окно при загрузке
  useEffect(() => {
    const checkMaximized = async () => {
      if (window.api && window.api.window) {
        const maximized = await window.api.window.isMaximized();
        setIsMaximized(maximized);
      }
    };
    
    checkMaximized();
  }, []);

  // Обработчики событий окна
  const handleMinimize = () => {
    if (window.api && window.api.window) {
      window.api.window.minimize();
    }
  };

  const handleMaximizeRestore = () => {
    if (window.api && window.api.window) {
      window.api.window.maximize();
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    if (window.api && window.api.window) {
      window.api.window.close();
    }
  };

  return (
    <TitleBarContainer className="app-drag-region">
      <Logo>
        <LogoIcon>T2</LogoIcon>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          T2 Mobile
        </Typography>
      </Logo>
      
      <WindowControls className="app-no-drag">
        <WindowButton
          aria-label="Свернуть"
          onClick={handleMinimize}
          size="small"
        >
          <MinimizeIcon />
        </WindowButton>
        
        <WindowButton
          aria-label={isMaximized ? "Восстановить" : "Развернуть"}
          onClick={handleMaximizeRestore}
          size="small"
        >
          {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
        </WindowButton>
        
        <WindowButton
          aria-label="Закрыть"
          onClick={handleClose}
          size="small"
          color="close"
        >
          <CloseIcon />
        </WindowButton>
      </WindowControls>
    </TitleBarContainer>
  );
};

export default TitleBar; 