import React, { useState, useContext, useEffect } from 'react';
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
  Settings as SettingsIcon
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

const UserProfile = () => {
  console.log('Рендеринг UserProfile');
  const { currentUser, updateUserData } = useContext(AuthContext);
  console.log('currentUser:', currentUser);
  
  // Состояния
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Загрузка данных пользователя при монтировании компонента
  useEffect(() => {
    console.log('useEffect в UserProfile, currentUser:', currentUser);
    if (currentUser) {
      setUserData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
      setSelectedPackage(currentUser.package || null);
    }
    // Даже если currentUser не определен, завершаем загрузку страницы
    setPageLoading(false);
  }, [currentUser]);

  // Обработка изменения полей формы
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  // Обработка сохранения данных профиля
  const handleSaveProfile = () => {
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

  // Выбор пакета услуг
  const handlePackageSelect = (packageId) => {
    setSelectedPackage(packageId);
    updateUserData({ package: packageId });
  };

  // Доступные пакеты услуг
  const packages = [
    {
      id: 'basic',
      name: 'Базовый',
      price: '599 ₽/мес',
      internet: '15 ГБ',
      calls: '400 минут',
      description: 'Базовый пакет для общения и интернет-серфинга'
    },
    {
      id: 'standard',
      name: 'Стандарт',
      price: '799 ₽/мес',
      internet: '30 ГБ',
      calls: 'Безлимит',
      description: 'Оптимальное соотношение цены и возможностей для активных пользователей'
    },
    {
      id: 'premium',
      name: 'Премиум',
      price: '1499 ₽/мес',
      internet: 'Безлимит',
      calls: 'Безлимит',
      description: 'Полный безлимит и максимальная скорость для требовательных пользователей'
    }
  ];

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
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
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
                title="Ваш пакет" 
                subheader={selectedPackage 
                  ? packages.find(p => p.id === selectedPackage)?.name 
                  : 'Не выбран'}
              />
              <CardContent>
                {selectedPackage ? (
                  <Box>
                    <Chip 
                      label={packages.find(p => p.id === selectedPackage)?.price} 
                      color="primary" 
                      sx={{ mb: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Интернет: {packages.find(p => p.id === selectedPackage)?.internet}<br />
                      Звонки: {packages.find(p => p.id === selectedPackage)?.calls}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Выберите пакет услуг из списка ниже
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => window.scrollTo(0, document.body.scrollHeight)}
                >
                  Изменить пакет
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </ProfilePaper>
      
      {/* Выбор пакета услуг */}
      <ProfilePaper elevation={2}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PackageIcon sx={{ mr: 1 }} />
          Доступные пакеты услуг
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {packages.map(pack => (
            <Grid item xs={12} sm={6} md={4} key={pack.id}>
              <PackageCard selected={selectedPackage === pack.id} elevation={3}>
                <CardHeader
                  title={pack.name}
                  subheader={pack.price}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="body1" component="div">
                    <strong>Интернет:</strong> {pack.internet}
                  </Typography>
                  <Typography gutterBottom variant="body1" component="div">
                    <strong>Звонки:</strong> {pack.calls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pack.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth 
                    variant={selectedPackage === pack.id ? "contained" : "outlined"} 
                    color="primary"
                    onClick={() => handlePackageSelect(pack.id)}
                  >
                    {selectedPackage === pack.id ? "Выбрано" : "Выбрать"}
                  </Button>
                </CardActions>
              </PackageCard>
            </Grid>
          ))}
        </Grid>
      </ProfilePaper>
      
      {/* Настройки аккаунта */}
      <ProfilePaper elevation={2}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ mr: 1 }} />
          Настройки аккаунта
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
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
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя будет отменить.
            Все ваши данные будут безвозвратно удалены из системы.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button color="error">Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile; 