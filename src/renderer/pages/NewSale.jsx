import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Add as AddIcon
} from '@mui/icons-material';
import AddCustomerForm from '../components/AddCustomerForm';

// Шаги процесса продажи
const steps = ['Выбор клиента', 'Выбор пакета услуг', 'Подтверждение'];

const NewSale = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получение клиентов
        const customersData = await window.api.customers.getAll();
        setCustomers(customersData);

        // Получение пакетов услуг
        const packagesData = await window.api.packages.getAll();
        setPackages(packagesData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Ошибка загрузки данных. Пожалуйста, попробуйте снова.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Фильтрация клиентов по поисковому запросу
  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.email?.toLowerCase().includes(query)
    );
  });

  // Обработка добавления нового клиента
  const handleAddCustomer = async (customerData) => {
    try {
      setFormSubmitting(true);
      const newCustomer = await window.api.customers.add(customerData);
      setCustomers([...customers, newCustomer]);
      setSelectedCustomer(newCustomer);
      setShowAddCustomerForm(false);
      setFormSubmitting(false);
      setActiveStep(1); // Переход к выбору пакета услуг после добавления клиента
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('Ошибка при добавлении клиента. Пожалуйста, попробуйте снова.');
      setFormSubmitting(false);
    }
  };

  // Обработка создания продажи
  const handleCreateSale = async () => {
    if (!selectedCustomer || !selectedPackage) {
      setError('Пожалуйста, выберите клиента и пакет услуг');
      return;
    }

    try {
      setFormSubmitting(true);
      const saleData = {
        customerId: selectedCustomer.id,
        packageId: selectedPackage.id,
        amount: selectedPackage.price
      };

      const result = await window.api.sales.add(saleData);
      
      if (result && result.id) {
        setSuccessMessage('Продажа успешно создана!');
        setFormSubmitting(false);
        setTimeout(() => {
          navigate('/sales');
        }, 1500);
      } else {
        throw new Error(result?.error || 'Не удалось создать продажу. Ответ от сервера некорректен.');
      }

    } catch (error) {
      console.error('Error creating sale:', error);
      setError(error.message || 'Ошибка при создании продажи. Пожалуйста, попробуйте снова.');
      setFormSubmitting(false);
    }
  };

  // Переход к следующему шагу
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Переход к предыдущему шагу
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Выбор клиента
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    handleNext();
  };

  // Выбор пакета услуг
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    handleNext();
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Отображение загрузки
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Отображение шага выбора клиента
  const renderCustomerSelection = () => {
    return (
      <Box>
        {showAddCustomerForm ? (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Добавить нового клиента</Typography>
              <Button 
                variant="outlined" 
                onClick={() => setShowAddCustomerForm(false)}
              >
                Назад к списку
              </Button>
            </Box>
            <Paper elevation={2} sx={{ p: 3 }}>
              <AddCustomerForm 
                onSubmit={handleAddCustomer} 
                onCancel={() => setShowAddCustomerForm(false)} 
              />
            </Paper>
          </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Выберите клиента</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => setShowAddCustomerForm(true)}
              >
                Новый клиент
              </Button>
            </Box>
            
            <TextField
              label="Поиск клиентов"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            {filteredCustomers.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Клиенты не найдены. Попробуйте изменить поисковый запрос или добавьте нового клиента.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredCustomers.map((customer) => (
                  <Grid item xs={12} sm={6} md={4} key={customer.id}>
                    <Card 
                      elevation={2} 
                      sx={{ 
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <CardActionArea onClick={() => handleSelectCustomer(customer)}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />
                            <Typography variant="h6">
                              {customer.name}
                            </Typography>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Телефон: {customer.phone || 'Не указан'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Email: {customer.email || 'Не указан'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Дата регистрации: {formatDate(customer.created_at)}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Отображение шага выбора пакета услуг
  const renderPackageSelection = () => {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Выберите пакет услуг</Typography>
          <Typography variant="body2" color="text.secondary">
            Клиент: {selectedCustomer?.name}
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {packages.map((pkg) => (
            <Grid item xs={12} sm={6} md={4} key={pkg.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleSelectPackage(pkg)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6" align="center">
                      {pkg.name}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" color="primary.main" align="center" gutterBottom>
                      {pkg.price} ₽
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {pkg.description}
                    </Typography>
                    
                    <Grid container spacing={1} sx={{ mt: 2 }}>
                      <Grid item xs={12}>
                        <Chip 
                          label={`${pkg.minutes} минут`} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Chip 
                          label={`${pkg.internet} ГБ интернета`} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Chip 
                          label={`${pkg.sms} SMS`} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Отображение шага подтверждения
  const renderConfirmation = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Подтверждение заказа
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Информация о клиенте</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                ФИО: {selectedCustomer?.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Телефон: {selectedCustomer?.phone || 'Не указан'}
              </Typography>
              <Typography variant="body1">
                Email: {selectedCustomer?.email || 'Не указан'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Информация о пакете</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                Название: {selectedPackage?.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Описание: {selectedPackage?.description}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Минуты: {selectedPackage?.minutes}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Интернет: {selectedPackage?.internet} ГБ
              </Typography>
              <Typography variant="body1" gutterBottom>
                SMS: {selectedPackage?.sms}
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ mt: 2 }}>
                Стоимость: {selectedPackage?.price} ₽
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<CheckCircleIcon />}
            onClick={handleCreateSale}
            disabled={formSubmitting || successMessage}
            sx={{ minWidth: 200 }}
          >
            {formSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Подтвердить'}
          </Button>
        </Box>
      </Box>
    );
  };

  // Отображение содержимого текущего шага
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderCustomerSelection();
      case 1:
        return renderPackageSelection();
      case 2:
        return renderConfirmation();
      default:
        return 'Неизвестный шаг';
    }
  };

  return (
    <Box className="fade-in">
      {/* Верхняя панель */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/sales')}
        >
          Назад к продажам
        </Button>
        <Typography variant="h5">
          Новая продажа
        </Typography>
      </Box>
      
      {/* Stepper */}
      <Paper elevation={2} sx={{ mb: 4, p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      {/* Содержимое шага */}
      <Paper elevation={2} sx={{ p: 3 }}>
        {getStepContent(activeStep)}
        
        {/* Навигационные кнопки */}
        {!showAddCustomerForm && activeStep !== 0 && activeStep !== 2 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeIcon />}
              onClick={handleBack}
            >
              Назад
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default NewSale; 