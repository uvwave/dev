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
  TextField
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Business as CompanyIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  DataSaverOff as DataIcon,
  Edit as EditIcon
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
  border: '1px solid #9d4edd22',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
}));

const Settings = () => {
  // Получаем контекст темы
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  // Получаем контекст авторизации для проверки роли пользователя
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.isAdmin ? authContext.isAdmin() : false;
  
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
    setDarkMode(!darkMode);
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
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'medium', color: '#9d4edd' }}>
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
          <SettingsIcon sx={{ mr: 1, color: '#9d4edd' }} />
          Внешний вид
        </Typography>
        <Divider sx={{ mb: 2, backgroundColor: '#9d4edd33' }} />
        
        <List>
          <ListItem>
            <ListItemIcon>
              <DarkModeIcon sx={{ color: '#9d4edd' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Темная тема" 
              secondary="Включение/выключение темной темы" 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
            <Switch
              edge="end"
              checked={darkMode}
              onChange={handleThemeToggle}
            />
          </ListItem>
        </List>
      </SettingsSection>
      
      {/* Секция информации о компании */}
      <SettingsSection elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CompanyIcon sx={{ mr: 1, color: '#9d4edd' }} />
          Информация о компании
        </Typography>
        <Divider sx={{ mb: 2, backgroundColor: '#9d4edd33' }} />
        
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
                >
                  Отмена
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<SaveIcon />} 
                  onClick={saveCompanyInfo}
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="body1" fontWeight="medium">
                Название компании: <strong>{companyName}</strong>
              </Typography>
              {isAdmin ? (
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />} 
                  sx={{ mt: 2 }}
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
          <DataIcon sx={{ mr: 1, color: '#9d4edd' }} />
          Управление данными
        </Typography>
        <Divider sx={{ mb: 2, backgroundColor: '#9d4edd33' }} />
        
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
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Это действие удалит всех клиентов, продажи и другие данные. Будьте осторожны.
          </Typography>
        </Box>
      </SettingsSection>
      
      {/* Секция о приложении */}
      <SettingsSection elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1, color: '#9d4edd' }} />
          О приложении
        </Typography>
        <Divider sx={{ mb: 2, backgroundColor: '#9d4edd33' }} />
        
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ backgroundColor: '#22223b', borderColor: '#9d4edd33' }}>
              <CardHeader 
                title="T2 Mobile" 
                subheader="Версия 1.0.0" 
                titleTypographyProps={{ fontWeight: 'bold', color: '#9d4edd' }}
                subheaderTypographyProps={{ color: '#b8b8b8' }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
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
            backgroundColor: '#22223b',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: '#ff5555' }}>Подтверждение действия</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#e2e2e2' }}>
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