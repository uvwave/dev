import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Storage as ServerIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';

// Ширина панели настройки сервера
const DRAWER_WIDTH = 320;

// Стилизованный компонент для панели настройки сервера
const ServerConfigDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: '#1a1a2e',
    borderLeft: '1px solid #9d4edd33',
    boxShadow: '-4px 0 10px rgba(0,0,0,0.3)',
  },
}));

// Стилизованная кнопка конфигурации сервера
const ConfigButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  backgroundColor: '#9d4edd',
  color: '#ffffff',
  boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
  '&:hover': {
    backgroundColor: '#7b2cbf',
  },
  zIndex: 1299,
}));

// Компонент для конфигурации сервера
const ServerConfig = () => {
  const [open, setOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Загрузка сохранённого URL сервера при инициализации
  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem('serverUrl');
      if (savedUrl) {
        setServerUrl(savedUrl);
      }
    } catch (error) {
      console.error('Ошибка при загрузке URL сервера:', error);
    }
  }, []);

  // Открытие панели настройки
  const handleOpen = () => {
    setOpen(true);
  };

  // Закрытие панели настройки
  const handleClose = () => {
    setOpen(false);
  };

  // Обработка изменения URL сервера
  const handleUrlChange = (event) => {
    setServerUrl(event.target.value);
  };

  // Проверка соединения с сервером
  const testConnection = async () => {
    try {
      // Убираем завершающий слеш, если он есть
      const normalizedUrl = serverUrl.endsWith('/') 
        ? serverUrl.slice(0, -1) 
        : serverUrl;

      // Простая проверка доступности сервера
      const response = await fetch(`${normalizedUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // Таймаут 5 секунд
      });

      if (response.ok) {
        showSnackbar('Соединение с сервером успешно установлено', 'success');
      } else {
        showSnackbar(`Ошибка соединения с сервером: ${response.statusText}`, 'error');
      }
    } catch (error) {
      showSnackbar(`Ошибка соединения с сервером: ${error.message}`, 'error');
    }
  };

  // Сохранение URL сервера
  const saveConfig = () => {
    try {
      localStorage.setItem('serverUrl', serverUrl);
      showSnackbar('Настройки сервера сохранены', 'success');
      
      // Обновление глобальной конфигурации
      window.serverConfig = { url: serverUrl };
      
      // Закрытие панели настройки
      handleClose();
    } catch (error) {
      showSnackbar(`Ошибка сохранения настроек: ${error.message}`, 'error');
    }
  };

  // Отображение уведомления
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Закрытие уведомления
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {/* Кнопка открытия панели настройки */}
      <ConfigButton 
        onClick={handleOpen} 
        size="large"
        aria-label="Настройки сервера"
      >
        <ServerIcon />
      </ConfigButton>
      
      {/* Панель настройки сервера */}
      <ServerConfigDrawer
        anchor="right"
        open={open}
        onClose={handleClose}
      >
        <Box sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}
          >
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <ServerIcon sx={{ mr: 1, color: '#9d4edd' }} />
              Настройки сервера
            </Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: '#e2e2e2' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ backgroundColor: '#9d4edd33', mb: 3 }} />
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Настройте подключение к серверу API для доступа к данным из разных устройств.
          </Typography>
          
          <TextField
            label="URL сервера"
            variant="outlined"
            fullWidth
            value={serverUrl}
            onChange={handleUrlChange}
            sx={{ mb: 3 }}
            placeholder="http://localhost:3000"
            helperText="Например: http://192.168.1.100:3000"
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button 
              variant="contained" 
              onClick={testConnection}
              startIcon={<RefreshIcon />}
              sx={{ flex: 1 }}
            >
              Проверить соединение
            </Button>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={saveConfig}
              startIcon={<SaveIcon />}
              sx={{ flex: 1 }}
            >
              Сохранить
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Для удаленного доступа запустите сервер API на компьютере с базой данных и укажите его IP-адрес.
            </Typography>
          </Alert>
          
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#9d4edd' }}>
            Инструкция по настройке
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            1. Запустите сервер командой <code>npm start</code> в папке server
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            2. Узнайте IP-адрес компьютера с сервером
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            3. Укажите адрес в формате <code>http://IP-адрес:3000</code>
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            4. Сохраните настройки и перезапустите приложение
          </Typography>
        </Box>
      </ServerConfigDrawer>
      
      {/* Уведомление */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ServerConfig; 