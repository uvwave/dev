import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  CircularProgress,
  Fab,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Clear as ClearIcon,
  Password as PasswordIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import AddCustomerForm from '../components/AddCustomerForm';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' или 'cards'
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Загрузка данных о клиентах
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await window.api.customers.getAll();
        setCustomers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Обработка создания нового клиента
  const handleCreateCustomer = async (customerData) => {
    try {
      const newCustomer = await window.api.customers.add(customerData);
      setCustomers([...customers, newCustomer]);
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  // Обработка удаления клиента
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      await window.api.customers.delete(selectedCustomer.id);
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      setOpenDeleteDialog(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  // Обработка пагинации
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Фильтрация клиентов по поисковому запросу
  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.email?.toLowerCase().includes(query)
    );
  });

  // Обработка запроса на открытие формы добавления клиента
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  // Обработка запроса на закрытие формы добавления клиента
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  // Обработка запроса на удаление клиента
  const handleOpenDeleteDialog = (customer) => {
    setSelectedCustomer(customer);
    setOpenDeleteDialog(true);
  };

  // Обработка запроса на закрытие диалога удаления
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCustomer(null);
  };

  // Обработка перехода на страницу деталей клиента
  const handleViewCustomer = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  // Обработка сброса пароля администратором
  const handleAdminResetPassword = async (customer) => {
    if (!customer || !customer.user_id) {
      setSnackbarMessage('У этого клиента нет связанного аккаунта для сброса пароля.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    // Можно добавить диалог подтверждения перед сбросом
    if (!confirm(`Вы уверены, что хотите сбросить пароль для пользователя ${customer.name} (${customer.email})? Новый пароль будет выведен в консоль основного процесса.`)) {
        return;
    }

    try {
      const result = await window.api.users.adminResetPassword(customer.user_id);
      if (result.success && result.newPassword) {
        setSnackbarMessage(`Пароль для ${customer.name} сброшен. Новый временный пароль: ${result.newPassword}. Передайте его клиенту!`);
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage(result.error || 'Не удалось сбросить пароль.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setSnackbarMessage('Ошибка при сбросе пароля.');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  // Закрытие Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Отображение загрузки
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Отображение карточек клиентов
  const renderCustomerCards = () => {
    return (
      <Grid container spacing={3}>
        {filteredCustomers
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((customer) => (
            <Grid item xs={12} sm={6} md={4} key={customer.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {customer.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {customer.phone || 'Не указан'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {customer.email || 'Не указан'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleViewCustomer(customer.id)}
                    >
                      Детали
                    </Button>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => handleOpenDeleteDialog(customer)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    );
  };

  // Отображение таблицы клиентов
  const renderCustomerTable = () => {
    return (
      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }} aria-label="Таблица клиентов">
          <TableHead>
            <TableRow>
              <TableCell>ФИО</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((customer) => (
                <TableRow
                  key={customer.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {customer.name}
                  </TableCell>
                  <TableCell>{customer.phone || 'Не указан'}</TableCell>
                  <TableCell>{customer.email || 'Не указан'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={customer.status || 'Активный'} 
                      color={customer.status === 'Неактивный' ? 'default' : 'success'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewCustomer(customer.id)}
                      title="Просмотр/Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    {/* Кнопка сброса пароля */} 
                    {customer.user_id && ( // Показываем только если есть связанный user_id
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleAdminResetPassword(customer)}
                        title="Сбросить пароль пользователя"
                      >
                        <LockResetIcon /> 
                      </IconButton>
                    )}
                    <IconButton 
                      color="error" 
                      onClick={() => handleOpenDeleteDialog(customer)}
                      title="Удалить клиента"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box className="fade-in">
      {/* Заголовок и действия */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Клиенты
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenAddDialog}
          >
            Добавить клиента
          </Button>
        </Box>
      </Box>

      {/* Поиск и переключение вида */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Поиск клиентов"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: '300px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Box>
          <Button 
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            sx={{ mr: 1 }}
          >
            Таблица
          </Button>
          <Button 
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('cards')}
          >
            Карточки
          </Button>
        </Box>
      </Box>

      {/* Контент */}
      {filteredCustomers.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 5 
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {searchQuery ? 'Клиенты не найдены' : 'Нет клиентов'}
          </Typography>
          {!searchQuery && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpenAddDialog}
            >
              Добавить первого клиента
            </Button>
          )}
        </Box>
      ) : (
        <>
          {viewMode === 'table' ? renderCustomerTable() : renderCustomerCards()}
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCustomers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        </>
      )}

      {/* Диалог добавления клиента */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseAddDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Добавить нового клиента</DialogTitle>
        <DialogContent dividers>
          <AddCustomerForm onSubmit={handleCreateCustomer} onCancel={handleCloseAddDialog} />
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить клиента {selectedCustomer?.name}? 
            Это действие невозможно отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeleteCustomer} color="error">Удалить</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customers; 