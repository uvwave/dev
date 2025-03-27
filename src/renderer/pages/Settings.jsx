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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Business as CompanyIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Language as LanguageIcon,
  DataSaverOff as DataIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ThemeContext } from '../index';

// Стилизованный компонент для секций настроек
const SettingsSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const Settings = () => {
  // Получаем значения из контекста
  const { darkMode, setDarkMode, language, setLanguage } = useContext(ThemeContext);
  
  // Состояния настроек приложения
  const [companyName, setCompanyName] = useState('T2 Mobile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Обработка переключения темной темы
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Обработка изменения языка
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  // Обработка изменения названия компании
  const handleCompanyNameChange = (event) => {
    setCompanyName(event.target.value);
  };

  // Обработка сохранения настроек
  const handleSaveSettings = () => {
    setLoading(true);
    setError(null);
    
    // Имитация сохранения настроек
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Сбрасываем индикатор успеха через 3 секунды
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
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

  return (
    <Box className="fade-in">
      <Typography variant="h5" component="h1" gutterBottom>
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
          <SettingsIcon sx={{ mr: 1 }} />
          Внешний вид
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          <ListItem>
            <ListItemIcon>
              {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
            </ListItemIcon>
            <ListItemText primary="Темная тема" secondary="Изменить цветовую схему интерфейса" />
            <Switch
              edge="end"
              checked={darkMode}
              onChange={handleDarkModeToggle}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText primary="Язык интерфейса" />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <Select
                value={language}
                onChange={handleLanguageChange}
              >
                <MenuItem value="ru">Русский</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </List>
      </SettingsSection>
      
      {/* Секция информации о компании */}
      <SettingsSection elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CompanyIcon sx={{ mr: 1 }} />
          Информация о компании
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ p: 2 }}>
          <TextField
            label="Название компании"
            variant="outlined"
            fullWidth
            value={companyName}
            onChange={handleCompanyNameChange}
            sx={{ mb: 2 }}
          />
        </Box>
      </SettingsSection>
      
      {/* Секция управления данными */}
      <SettingsSection elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <DataIcon sx={{ mr: 1 }} />
          Управление данными
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ p: 2 }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={handleClearData}
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
          <InfoIcon sx={{ mr: 1 }} />
          О приложении
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader title="T2 Mobile" subheader="Версия 1.0.0" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Информационная система мониторинга продаж телекоммуникационных услуг.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </SettingsSection>
      
      {/* Кнопка сохранить */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
          size="large"
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </Box>
      
      {/* Диалог подтверждения очистки данных */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Подтверждение действия</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите очистить все данные? Это действие нельзя будет отменить.
            Будут удалены все клиенты, продажи и другие данные.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={confirmClearData} color="error">Очистить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 