import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Avatar,
  TextField,
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Inventory2 as PackageIcon,
  Settings as SettingsIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';

// Стилизованные компоненты
const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const PackageCard = styled(Card)(({ theme, selected }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

// Валидация полей формы
const validateName = (name) => {
  return name.trim().length >= 2; // Имя не менее 2 символов
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  // Проверка формата телефона ("+71234567890" или "89991234567" и т.д.)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phone === '' || phoneRegex.test(phone.trim());
};

// Форматирование даты (можно вынести в утилиты)
const formatDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return 'Не указана';
  try {
    const parts = dateString.split('-');
    if (parts.length !== 3) return 'Некорректный формат';
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; 
    const day = parseInt(parts[2], 10);
    const date = new Date(Date.UTC(year, month, day));
    if (isNaN(date.getTime())) return 'Некорректная дата';
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Moscow'
    });
  } catch (e) { return 'Ошибка даты'; }
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserData, logout } = useContext(AuthContext);
  console.log('currentUser:', currentUser);
  
  // Состояния
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [userSales, setUserSales] = useState([]); // <-- State для хранения продаж пользователя
  const [salesLoading, setSalesLoading] = useState(true); // <-- Отдельный лоадер для продаж
  const [passwordData, setPasswordData] = useState({ // <-- State для паролей
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({}); // <-- State для ошибок пароля
  const [passwordLoading, setPasswordLoading] = useState(false); // <-- State загрузки смены пароля
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [allPackages, setAllPackages] = useState([]); // <-- State для всех пакетов
  const [latestPackageDetails, setLatestPackageDetails] = useState(null); // <-- State для деталей последнего пакета
  const [deleteLoading, setDeleteLoading] = useState(false); // <-- Состояние загрузки удаления
  const [deleteError, setDeleteError] = useState(null); // <-- Состояние ошибки удаления

  // Загрузка данных пользователя, его продаж и всех пакетов
  useEffect(() => {
    setPageLoading(true);
    setSalesLoading(true);
    let mounted = true;

    const loadData = async () => {
      let loadedSales = [];
      let loadedPackages = [];

      if (currentUser) {
        // Загрузка основной информации пользователя
        setUserData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
        });
        
        // Параллельная загрузка продаж и пакетов
        try {
          const [sales, packagesData] = await Promise.all([
            window.api.sales.getUserSales(currentUser.id), // Загружаем продажи юзера
            window.api.packages.getAll() // Загружаем все пакеты
          ]);
          
          if (mounted) {
             loadedSales = sales || [];
             loadedPackages = packagesData || [];
             setUserSales(loadedSales);
             setAllPackages(loadedPackages);
          }
        } catch (loadError) {
          console.error('Error fetching user sales or packages:', loadError);
          if (mounted) {
              setError(prev => prev || 'Не удалось загрузить данные о покупках или пакетах.');
          }
        } finally {
           if (mounted) setSalesLoading(false);
        }
        
      } else {
           if (mounted) setSalesLoading(false);
      }
      if (mounted) setPageLoading(false);
      
      // --- Определяем последний пакет после загрузки --- 
      if (mounted && loadedSales.length > 0 && loadedPackages.length > 0) {
          // Сортируем продажи по ID или дате в порядке убывания (предполагаем, что больший ID = новее)
          const sortedSales = [...loadedSales].sort((a, b) => b.id - a.id); // Или по sale_date, если он надежнее
          const latestSale = sortedSales[0];
          const latestPkg = loadedPackages.find(p => p.id === latestSale.packageId);
          setLatestPackageDetails(latestPkg || null); // Сохраняем детали последнего пакета
      } else if (mounted) {
          setLatestPackageDetails(null); // Если продаж нет
      }
      // --- Конец определения последнего пакета --- 
    };

    loadData();

    return () => { mounted = false; };

  }, [currentUser]);

  // Обработка изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
    
    // Валидация поля при изменении
    validateField(name, value);
  };
  
  // Валидация отдельного поля
  const validateField = (fieldName, value) => {
    let errorMessage = '';
    
    switch(fieldName) {
      case 'name':
        if (!validateName(value)) {
          errorMessage = 'Имя должно содержать не менее 2 символов';
        }
        break;
      case 'email':
        if (!validateEmail(value)) {
          errorMessage = 'Введите корректный email';
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          errorMessage = 'Неверный формат телефона';
        }
        break;
      default:
        break;
    }
    
    setErrors({
      ...errors,
      [fieldName]: errorMessage
    });
    
    return errorMessage === '';
  };
  
  // Валидация всей формы
  const validateForm = () => {
    const nameValid = validateField('name', userData.name);
    const emailValid = validateField('email', userData.email);
    const phoneValid = validateField('phone', userData.phone);
    
    return nameValid && emailValid && phoneValid;
  };

  // Обработка сохранения данных профиля
  const handleSaveProfile = () => {
    if (!validateForm()) {
      setError('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = updateUserData(userData);
      
      if (result.success) {
        setSuccess(true);
        setEditMode(false);
        
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.error || 'Произошла ошибка при сохранении');
      }
    } catch (err) {
      setError('Произошла ошибка при сохранении. Попробуйте еще раз.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Обработка изменения полей пароля
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: null })); // Сброс ошибки при изменении
    setPasswordError(null); // Сброс общей ошибки
    setPasswordSuccess(false);
  };

  // Валидация формы смены пароля
  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Текущий пароль обязателен';
    if (!passwordData.newPassword) errors.newPassword = 'Новый пароль обязателен';
    else if (passwordData.newPassword.length < 6) errors.newPassword = 'Пароль должен быть не менее 6 символов';
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Пароли не совпадают';
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Обработка сохранения нового пароля
  const handlePasswordSave = async () => {
    if (!validatePasswordForm()) return;
    
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    
    try {
       // Проверяем наличие API перед вызовом
      if (!window.api || !window.api.auth || !window.api.auth.changePassword) {
        throw new Error('Функция смены пароля недоступна.');
      }

      const result = await window.api.auth.changePassword({
        userId: currentUser.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setPasswordSuccess(true);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Очистить поля
        setTimeout(() => setPasswordSuccess(false), 4000);
      } else {
        setPasswordError(result.error || 'Не удалось изменить пароль');
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordError(err.message || 'Произошла ошибка при смене пароля.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Обработка подтверждения удаления аккаунта
  const handleDeleteAccountConfirm = async () => {
    if (!currentUser || !currentUser.id) {
      setDeleteError('Не удалось определить пользователя для удаления.');
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      // Проверяем наличие API
      if (!window.api || !window.api.users || !window.api.users.deleteUserAccount) {
         throw new Error('Функция удаления аккаунта недоступна.');
      }
      
      const result = await window.api.users.deleteUserAccount(currentUser.id);
      
      if (result.success) {
        console.log('Аккаунт успешно удален.');
        setOpenDialog(false); // Закрыть диалог
        // Выполнить выход и перенаправление
        if (logout) {
          logout(); // Вызываем logout из контекста
        }
        // Можно добавить короткое сообщение перед редиректом
        // alert('Ваш аккаунт был успешно удален.'); 
        navigate('/auth/login', { replace: true }); // Перенаправляем на логин
      } else {
        console.error('Ошибка удаления аккаунта:', result.error);
        setDeleteError(result.error || 'Не удалось удалить аккаунт.');
      }
    } catch (err) {
      console.error('Критическая ошибка при удалении аккаунта:', err);
      setDeleteError(err.message || 'Произошла критическая ошибка.');
    } finally {
      setDeleteLoading(false);
      // Не закрываем диалог при ошибке, чтобы пользователь видел сообщение
      // setOpenDialog(false); 
    }
  };

  // Если страница загружается, показываем индикатор загрузки
  if (pageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Если данные пользователя не загружены, показываем сообщение об ошибке
  if (!currentUser) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">
          Не удалось загрузить данные пользователя. Пожалуйста, <Button color="inherit" onClick={() => window.location.reload()}>обновите страницу</Button>.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Typography variant="h5" component="h1" gutterBottom>
        Личный кабинет
      </Typography>
      
      {/* Сообщения об успехе/ошибке */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Данные успешно сохранены!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Профиль пользователя */}
      <ProfilePaper elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            Профиль
          </Typography>
          
          {!editMode ? (
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Редактировать
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSaveProfile}
              disabled={loading}
            >
              Сохранить
            </Button>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {editMode ? (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Box>
            ) : (
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Имя" secondary={currentUser.name || 'Не указано'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={currentUser.email || 'Не указано'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary="Телефон" secondary={currentUser.phone || 'Не указано'} />
                </ListItem>
              </List>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader 
                title="Ваш текущий пакет"
                subheader={latestPackageDetails 
                  ? latestPackageDetails.name
                  : 'Не выбран'}
              />
              <CardContent>
                {latestPackageDetails ? (
                  <Box>
                    <Chip 
                      label={`${latestPackageDetails.price} ₽`} 
                      color="primary" 
                      sx={{ mb: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {latestPackageDetails.description || 'Описание отсутствует'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    У вас нет активного пакета. Приобретите его в разделе "Мои покупки".
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate('/select-package')}
                >
                  {latestPackageDetails ? 'Изменить пакет' : 'Купить пакет'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </ProfilePaper>
      
      {/* Раздел Мои пакеты/Покупки */}
      <ProfilePaper elevation={3}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Мои покупки
        </Typography>
        {salesLoading ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
        ) : userSales.length > 0 ? (
          <List disablePadding>
            {userSales.map((sale) => (
              <ListItem key={sale.id} divider>
                <ListItemIcon>
                  <PackageIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={sale.packageName || 'Неизвестный пакет'} 
                  secondary={`Дата продажи: ${formatDate(sale.sale_date)}`} // <-- Используем formatDate и sale.sale_date
                />
                <Typography variant="body1" fontWeight="bold" sx={{ ml: 2 }}>
                   {sale.amount ? `${sale.amount} ₽` : 'Цена не указана'}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">
            У вас пока нет приобретенных пакетов.
          </Typography>
        )}
      </ProfilePaper>
      
      {/* Настройки аккаунта и Смена пароля */} 
      <ProfilePaper elevation={2}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ mr: 1 }} />
          Настройки аккаунта
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Форма смены пароля */} 
        <Typography variant="subtitle1" gutterBottom>Сменить пароль</Typography>
        {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>Пароль успешно изменен!</Alert>}
        {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
        <Box component="form" noValidate sx={{ mb: 3 }}>
          <TextField
            type="password"
            name="currentPassword"
            label="Текущий пароль"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            type="password"
            name="newPassword"
            label="Новый пароль"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            type="password"
            name="confirmPassword"
            label="Подтвердите новый пароль"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
            fullWidth
            margin="normal"
            size="small"
          />
          <Button
            variant="contained"
            onClick={handlePasswordSave}
            disabled={passwordLoading}
            startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ mt: 1 }}
          >
            Изменить пароль
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }} />

        {/* Удаление аккаунта */} 
        <Typography variant="subtitle1" color="error" gutterBottom>Удаление аккаунта</Typography>
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => setOpenDialog(true)}
        >
          Удалить аккаунт
        </Button>
      </ProfilePaper>
      
      {/* Диалог подтверждения удаления аккаунта */}
      <Dialog
        open={openDialog}
        onClose={() => {
            if (!deleteLoading) { // Не закрывать во время удаления
                setOpenDialog(false);
                setDeleteError(null); // Сброс ошибки при закрытии
            }
        }}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя будет отменить.
            Все ваши данные будут безвозвратно удалены из системы.
          </DialogContentText>
          {/* Показываем ошибку удаления, если она есть */} 
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
             onClick={() => setOpenDialog(false)} 
             disabled={deleteLoading} // Блокируем кнопку отмены во время загрузки
          >
             Отмена
          </Button>
          <Button 
             color="error" 
             onClick={handleDeleteAccountConfirm} // <-- Назначаем новый обработчик
             disabled={deleteLoading} // <-- Блокируем кнопку во время загрузки
             startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile; 