import React, { useState, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Business as CompanyIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  DataSaverOff as DataIcon,
  Edit as EditIcon,
  Palette as ThemeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ThemeContext } from '../index';
import { AuthContext } from '../context/AuthContext';

// Стилизованный компонент для секций настроек
const SettingsSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(157, 78, 221, 0.2)' 
    : '1px solid rgba(0, 153, 255, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0,0,0,0.3)'
    : '0 4px 20px rgba(0,0,0,0.05)',
}));

// Стилизованный переключатель темы
const ThemeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#9d4edd' : '#0099ff',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#9d4edd' : '#0099ff',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

// Стилизованная карточка темы
const ThemeCard = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  border: selected 
    ? `2px solid ${theme.palette.mode === 'dark' ? '#9d4edd' : '#0099ff'}` 
    : '2px solid transparent',
  backgroundColor: theme.palette.mode === 'dark' 
    ? selected ? 'rgba(157, 78, 221, 0.1)' : 'rgba(255, 255, 255, 0.05)' 
    : selected ? 'rgba(0, 153, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(157, 78, 221, 0.1)' 
      : 'rgba(0, 153, 255, 0.05)',
    transform: 'translateY(-2px)',
  }
}));

const Settings = () => {
  // Получаем текущую тему
  const theme = useTheme();
  // Получаем контекст темы
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  // Получаем контекст авторизации для проверки роли пользователя
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.isAdmin ? authContext.isAdmin() : false;
  
  // Определяем размер экрана
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Состояния для управления операциями
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Состояния для управления информацией о компании
  const [companyName, setCompanyName] = useState('T2 Mobile');
  const [editingCompany, setEditingCompany] = useState(false);
  
  // Обработка изменения темы
  const handleThemeToggle = () => {
    console.log('Переключение темы: с', darkMode, 'на', !darkMode);
    
    // Меняем значение темы
    setDarkMode(!darkMode);
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem('darkMode', String(!darkMode));
      console.log('Тема сохранена в localStorage:', !darkMode);
    } catch (e) {
      console.error('Ошибка при сохранении темы:', e);
    }
  };

  // Выбор темной темы
  const selectDarkTheme = () => {
    if (!darkMode) handleThemeToggle();
  };
  
  // Выбор светлой темы
  const selectLightTheme = () => {
    if (darkMode) handleThemeToggle();
  };

  // Обработка очистки данных
  const handleClearData = () => {
    setOpenDialog(true);
  };

  // Подтверждение очистки данных
  const confirmClearData = () => {
    setLoading(true);
    setError(null);
    
    // Имитация очистки данных
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setOpenDialog(false);
      
      // Сбрасываем индикатор успеха через 3 секунды
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  // Начать редактирование информации о компании
  const startEditingCompany = () => {
    setEditingCompany(true);
  };
  
  // Сохранить информацию о компании
  const saveCompanyInfo = () => {
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setEditingCompany(false);
      
      // Сбрасываем индикатор успеха через 3 секунды
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  // Отменить редактирование информации о компании
  const cancelEditingCompany = () => {
    setEditingCompany(false);
    setCompanyName('T2 Mobile'); // Возвращаем начальное значение
  };

  return (
    <Box className="fade-in" sx={{ p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ 
        fontWeight: 'medium', 
        color: theme.palette.mode === 'dark' ? '#9d4edd' : '#5d00e0' 
      }}>
        Настройки
      </Typography>
      
      {/* Сообщения об успехе/ошибке */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Настройки успешно сохранены!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Секция внешнего вида */}
      <SettingsSection elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <ThemeIcon sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#9d4edd' : '#0072e5' }} />
          Внешний вид
        </Typography>
        <Divider sx={{ 
          mb: 2, 
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(157, 78, 221, 0.3)' 
            : 'rgba(0, 114, 229, 0.15)' 
        }} />
        
        {/* Переключатель темы */}
        <List>
          <ListItem>
            <ListItemIcon>
              {darkMode ? (
                <DarkModeIcon sx={{ color: theme.palette.mode === 'dark' ? '#9d4edd' : '#5d00e0' }} />
              ) : (
                <LightModeIcon sx={{ color: theme.palette.mode === 'dark' ? '#9d4edd' : '#0072e5' }} />
              )}
            </ListItemIcon>
            <ListItemText 
              primary={darkMode ? "Темная тема" : "Светлая тема"} 
              secondary="Изменение цветовой схемы приложения" 
              primaryTypographyProps={{ fontWeight: 'medium' }}
              secondaryTypographyProps={{ color: theme.palette.mode === 'dark' ? '#cccccc' : '#3a4a5c' }}
            />
            <ThemeSwitch
              checked={darkMode}
              onChange={handleThemeToggle}
            />
          </ListItem>
        </List>
        
        {/* Визуальный выбор темы */}
        <Grid container spacing={2} sx={{ mt: 2, px: 2 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Выберите тему оформления
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <ThemeCard 
              onClick={selectDarkTheme} 
              selected={darkMode}
              elevation={darkMode ? 2 : 0}
            >
              <Box 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  backgroundColor: '#000000',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '2px solid #9d4edd'
                }}
              >
                <DarkModeIcon sx={{ color: '#9d4edd' }} />
              </Box>
              <Typography 
                variant="body2" 
                fontWeight={darkMode ? 'bold' : 'normal'}
                sx={{ color: theme.palette.text.primary }}
              >
                Темная
              </Typography>
            </ThemeCard>
          </Grid>
          
          <Grid item xs={6}>
            <ThemeCard 
              onClick={selectLightTheme} 
              selected={!darkMode}
              elevation={!darkMode ? 2 : 0}
            >
              <Box 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '2px solid #0072e5',
                  boxShadow: '0 0 8px rgba(0, 114, 229, 0.2)'
                }}
              >
                <LightModeIcon sx={{ color: '#0072e5' }} />
              </Box>
              <Typography 
                variant="body2" 
                fontWeight={!darkMode ? 'bold' : 'normal'}
                sx={{ color: theme.palette.text.primary }}
              >
                Светлая
              </Typography>
            </ThemeCard>
          </Grid>
        </Grid>
      </SettingsSection>
      
      {/* Секция информации о компании */}
      <SettingsSection elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CompanyIcon sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#9d4edd' : '#0072e5' }} />
          Информация о компании
        </Typography>
        <Divider sx={{ 
          mb: 2, 
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(157, 78, 221, 0.3)' 
            : 'rgba(0, 114, 229, 0.15)' 
        }} />
        
        <Box sx={{ p: 2 }}>
          {editingCompany ? (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Название компании"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={cancelEditingCompany}
                  sx={{ 
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(157, 78, 221, 0.5)' : 'rgba(93, 0, 224, 0.5)',
                    color: theme.palette.mode === 'dark' ? '#9d4edd' : '#5d00e0'
                  }}
                >
                  Отмена
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<SaveIcon />} 
                  onClick={saveCompanyInfo}
                  disabled={loading}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? '#9d4edd' : '#0072e5',
                  }}
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="body1" fontWeight="medium" sx={{ color: theme.palette.text.primary }}>
                Название компании: <strong>{companyName}</strong>
              </Typography>
              {isAdmin ? (
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />} 
                  sx={{ 
                    mt: 2,
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(157, 78, 221, 0.5)' : 'rgba(93, 0, 224, 0.5)',
                    color: theme.palette.mode === 'dark' ? '#9d4edd' : '#5d00e0'
                  }}
                  onClick={startEditingCompany}
                >
                  Изменить
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Название компании зафиксировано и не может быть изменено.
                </Typography>
              )}
            </>
          )}
        </Box>
      </SettingsSection>
      
      {/* Секция управления данными */}
      <SettingsSection elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <DataIcon sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#9d4edd' : '#0072e5' }} />
          Управление данными
        </Typography>
        <Divider sx={{ 
          mb: 2, 
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(157, 78, 221, 0.3)' 
            : 'rgba(0, 114, 229, 0.15)' 
        }} />
        
        <Box sx={{ p: 2 }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={handleClearData}
            sx={{ 
              borderColor: '#ff5555',
              color: '#ff5555',
              '&:hover': { 
                backgroundColor: '#ff555510',
                borderColor: '#ff5555'
              }
            }}
          >
            Очистить все данные
          </Button>
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 1, 
              display: 'block',
              color: theme.palette.mode === 'dark' ? '#cccccc' : '#3a4a5c' 
            }}
          >
            Это действие удалит всех клиентов, продажи и другие данные. Будьте осторожны.
          </Typography>
        </Box>
      </SettingsSection>
      
      {/* Секция о приложении */}
      <SettingsSection elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#9d4edd' : '#0072e5' }} />
          О приложении
        </Typography>
        <Divider sx={{ 
          mb: 2, 
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(157, 78, 221, 0.3)' 
            : 'rgba(0, 114, 229, 0.15)' 
        }} />
        
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f8fbff', 
              borderColor: theme.palette.mode === 'dark' ? 'rgba(157, 78, 221, 0.2)' : 'rgba(93, 0, 224, 0.15)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}>
              <CardHeader 
                title="T2 Mobile" 
                subheader="Версия 1.0.0" 
                titleTypographyProps={{ 
                  fontWeight: 'bold', 
                  color: theme.palette.mode === 'dark' ? '#9d4edd' : '#5d00e0' 
                }}
                subheaderTypographyProps={{ 
                  color: theme.palette.mode === 'dark' ? '#cccccc' : '#3a4a5c',
                  fontWeight: theme.palette.mode === 'dark' ? 400 : 500,
                }}
              />
              <CardContent>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#cccccc' : '#3a4a5c',
                    fontWeight: theme.palette.mode === 'dark' ? 400 : 500,
                  }}
                >
                  Мобильное приложение для управления продажами телекоммуникационных услуг.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </SettingsSection>
      
      {/* Диалог подтверждения очистки данных */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#ffffff',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: '#ff5555' }}>Подтверждение действия</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827' }}>
            Вы уверены, что хотите очистить все данные? Это действие нельзя будет отменить.
            Будут удалены все клиенты, продажи и другие данные.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={confirmClearData} 
            sx={{ 
              color: '#ff5555',
              '&:hover': { backgroundColor: '#ff555510' }
            }}
          >
            Очистить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 