import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Snackbar
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

const PackageCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const SelectPackagePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    let mounted = true;
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPackages = await window.api.packages.getAll();
        if (mounted) {
          setPackages(fetchedPackages || []);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        if (mounted) {
          setError('Не удалось загрузить список пакетов. Попробуйте позже.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPackages();

    return () => { mounted = false; };
  }, []);

  const handleSelectPackage = async (pkg) => {
    if (!currentUser || !currentUser.id) {
      setError('Ошибка: Пользователь не авторизован.');
      return;
    }

    setSelectedPackageId(pkg.id);
    setPurchaseLoading(true);
    setError(null);

    try {
        // Сначала нужно получить customerId по userId
        // Предполагаем, что такая функция существует или будет создана
        // TODO: Заменить на реальный вызов API для получения customer по user ID
        console.warn('Предполагаем, что получаем customerId синхронно или через API');
        
        // Ищем клиента по email пользователя (или лучше по ID, если связь есть)
        // В текущей структуре, customer может не быть сразу связан с user,
        // или может не быть метода для поиска customer по user ID.
        // Нужен метод вроде `getCustomerByUserId(userId)`
        // Пока используем заглушку или предполагаем, что ID пользователя и клиента совпадают (что НЕВЕРНО)
        
        // --- ВРЕМЕННОЕ РЕШЕНИЕ: Пытаемся найти customer по email --- 
        let customerIdToUse = null;
        try {
            const allCustomers = await window.api.customers.getAll(); // Предполагаем, что есть такой метод
            const foundCustomer = allCustomers.find(c => c.user_id === currentUser.id);
            if (foundCustomer) {
                customerIdToUse = foundCustomer.id;
                console.log(`Найден customer ID: ${customerIdToUse} для user ID: ${currentUser.id}`);
            } else {
                throw new Error(`Клиент для пользователя ${currentUser.email} не найден.`);
            }
        } catch (findError) {
            console.error("Ошибка поиска customerId:", findError);
            throw new Error('Не удалось найти связанный профиль клиента для покупки.');
        }
        // --- КОНЕЦ ВРЕМЕННОГО РЕШЕНИЯ --- 

        const saleData = {
            customerId: customerIdToUse, // ID найденного клиента
            packageId: pkg.id,
            amount: pkg.price,
            sale_date: new Date().toISOString().split('T')[0] // Сегодняшняя дата
        };

        const result = await window.api.sales.add(saleData);

        setSnackbarMessage(`Пакет \"${pkg.name}\" успешно приобретен!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        // Перенаправляем пользователя обратно в профиль немедленно
        navigate('/profile'); 

    } catch (purchaseError) {
        console.error('Error purchasing package:', purchaseError);
        setError(purchaseError.message || 'Произошла ошибка при покупке пакета.');
        setSnackbarMessage(purchaseError.message || 'Ошибка при покупке пакета.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    } finally {
        setPurchaseLoading(false);
        setSelectedPackageId(null); // Сбрасываем выделение после попытки
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Выберите пакет услуг
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {packages.length === 0 && !loading && (
        <Typography>Нет доступных пакетов для выбора.</Typography>
      )}

      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid item key={pkg.id} xs={12} sm={6} md={4}>
            <PackageCard elevation={3}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  {pkg.name}
                </Typography>
                <Chip label={`${pkg.price} ₽ / мес`} color="primary" sx={{ mb: 1.5 }} />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {pkg.description || 'Описание пакета отсутствует.'}
                </Typography>
                {/* Добавляем вывод доп. параметров пакета */} 
                <Box sx={{ mt: 1 }}>
                  {pkg.minutes !== undefined && (
                     <Chip 
                        label={`${pkg.minutes} минут`} 
                        variant="outlined" 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }}
                     />
                   )}
                   {pkg.internet !== undefined && (
                     <Chip 
                        label={`${pkg.internet} ГБ интернета`} 
                        variant="outlined" 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }}
                     />
                   )}
                   {pkg.sms !== undefined && (
                     <Chip 
                        label={`${pkg.sms} SMS`} 
                        variant="outlined" 
                        size="small" 
                        sx={{ mb: 0.5 }}
                     />
                   )}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleSelectPackage(pkg)}
                  disabled={purchaseLoading && selectedPackageId === pkg.id}
                >
                  {purchaseLoading && selectedPackageId === pkg.id ? <CircularProgress size={24} color="inherit" /> : 'Выбрать этот пакет'}
                </Button>
              </CardActions>
            </PackageCard>
          </Grid>
        ))}
      </Grid>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Container>
  );
};

export default SelectPackagePage; 