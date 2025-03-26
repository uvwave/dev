import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Tab,
  Tabs,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Notes as NotesIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import AddCustomerForm from '../components/AddCustomerForm';

// Компонент для отображения табов
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [packages, setPackages] = useState([]);

  // Загрузка данных клиента
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получение данных о клиенте
        const customersData = await window.api.customers.getAll();
        const foundCustomer = customersData.find(c => c.id === parseInt(id));
        
        if (!foundCustomer) {
          navigate('/customers');
          return;
        }
        
        setCustomer(foundCustomer);
        
        // Получение продаж клиента
        const salesData = await window.api.sales.getAll();
        const customerSales = salesData.filter(s => s.customerId === parseInt(id));
        setSales(customerSales);
        
        // Получение пакетов услуг
        const packagesData = await window.api.packages.getAll();
        setPackages(packagesData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customer details:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Обработка изменения таба
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Обработка редактирования клиента
  const handleEditCustomer = async (updatedData) => {
    try {
      const updatedCustomer = {
        ...customer,
        ...updatedData
      };
      
      await window.api.customers.update(updatedCustomer);
      setCustomer(updatedCustomer);
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  // Обработка удаления клиента
  const handleDeleteCustomer = async () => {
    try {
      await window.api.customers.delete(customer.id);
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Получение имени пакета услуг по ID
  const getPackageName = (packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : 'Неизвестный пакет';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box>
        <Alert severity="error">Клиент не найден</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/customers')}
          sx={{ mt: 2 }}
        >
          Вернуться к списку клиентов
        </Button>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Верхняя панель с кнопками действий */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/customers')}
        >
          Назад к списку
        </Button>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />} 
            onClick={() => setOpenEditDialog(true)}
            sx={{ mr: 1 }}
          >
            Редактировать
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={() => setOpenDeleteDialog(true)}
          >
            Удалить
          </Button>
        </Box>
      </Box>

      {/* Основная информация о клиенте */}
      <Paper elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" gutterBottom>
            {customer.firstName} {customer.lastName}
          </Typography>
          <Chip 
            label={customer.status || 'Активный'} 
            color="default"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.3)', 
              color: 'white',
              '& .MuiChip-label': { fontWeight: 'bold' }
            }} 
          />
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  ID: {customer.id}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {customer.phone || 'Телефон не указан'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {customer.email || 'Email не указан'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {customer.address || 'Адрес не указан'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  Дата регистрации: {formatDate(customer.createdAt)}
                </Typography>
              </Box>
              
              {customer.updatedAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    Последнее обновление: {formatDate(customer.updatedAt)}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Табы для информации о клиенте */}
      <Paper elevation={2}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="customer tabs"
          variant="fullWidth"
        >
          <Tab label="Продажи" />
          <Tab label="Примечания" />
        </Tabs>
        
        {/* Таб с продажами */}
        <TabPanel value={tabValue} index={0}>
          {sales.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                У клиента пока нет продаж
              </Typography>
              <Button 
                variant="contained"
                onClick={() => navigate('/sales/new')}
                sx={{ mt: 2 }}
              >
                Создать продажу
              </Button>
            </Box>
          ) : (
            <>
              <List>
                {sales.map((sale) => (
                  <ListItem 
                    key={sale.id}
                    divider
                    secondaryAction={
                      <Typography variant="body1" fontWeight="bold">
                        {packages.find(p => p.id === sale.packageId)?.price || 0} ₽
                      </Typography>
                    }
                  >
                    <ListItemIcon>
                      <ShoppingCartIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={getPackageName(sale.packageId)} 
                      secondary={`Дата продажи: ${formatDate(sale.date)}`}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button 
                  variant="contained"
                  onClick={() => navigate('/sales/new')}
                >
                  Добавить новую продажу
                </Button>
              </Box>
            </>
          )}
        </TabPanel>
        
        {/* Таб с примечаниями */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <NotesIcon sx={{ mr: 2, color: 'text.secondary' }} />
            <Typography variant="body1">
              {customer.notes || 'Примечания отсутствуют'}
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Диалог редактирования клиента */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Редактировать клиента</DialogTitle>
        <DialogContent dividers>
          <AddCustomerForm 
            onSubmit={handleEditCustomer} 
            onCancel={() => setOpenEditDialog(false)} 
            initialData={customer}
          />
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить клиента {customer.firstName} {customer.lastName}? 
            Это действие нельзя будет отменить.
          </Typography>
          
          {sales.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              У клиента есть {sales.length} {sales.length === 1 ? 'продажа' : 
                sales.length < 5 ? 'продажи' : 'продаж'}. При удалении клиента история продаж может быть потеряна.
            </Alert>
          )}
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ mr: 1 }}>
            Отмена
          </Button>
          <Button onClick={handleDeleteCustomer} color="error" variant="contained">
            Удалить
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CustomerDetails; 