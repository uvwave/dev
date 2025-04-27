import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Chip,
  CircularProgress,
  Fab,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

const Sales = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sales, setSales] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');

  // Загрузка данных
  useEffect(() => {
    console.log('Sales component fetching data because location changed...');
    setLoading(true);
    const fetchData = async () => {
      try {
        // Получение продаж (уже содержит customerName и packageName)
        const salesData = await window.api.sales.getAll();
        setSales(salesData);

        // Получение пакетов услуг (может быть нужно для цены?)
        const packagesData = await window.api.packages.getAll();
        setPackages(packagesData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  // Обработка пагинации
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Получение данных пакета по ID (оставляем, может нужно для отображения)
  const getPackage = (packageId) => {
    return packages.find(p => p.id === packageId) || { name: 'Неизвестный пакет', price: 0 };
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    console.log("Formatting date string:", dateString);
    if (!dateString || typeof dateString !== 'string') return 'Не указана';
    
    try {
      // Явно разбираем YYYY-MM-DD, чтобы избежать проблем с локалями new Date()
      const parts = dateString.split('-');
      if (parts.length !== 3) return 'Некорректный формат';
      
      // ВАЖНО: Месяцы в new Date() начинаются с 0 (0 = Январь, 11 = Декабрь)
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Вычитаем 1 из месяца
      const day = parseInt(parts[2], 10);
      
      const date = new Date(Date.UTC(year, month, day)); // Используем UTC для надежности

      if (isNaN(date.getTime())) {
          console.warn("Parsed date is invalid:", dateString);
          return 'Некорректная дата';
      }
      
      // Форматируем с учетом UTC+3 (Москва)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Europe/Moscow' // <-- Изменено на UTC+3
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Ошибка даты';
    }
  };

  // Фильтрация продаж по поисковому запросу
  const filteredSales = sales.filter(sale => {
    const query = searchQuery.toLowerCase();
    const packageData = packages.find(p => p.id === sale.packageId);
    
    return (
      sale.customerName?.toLowerCase().includes(query) ||
      packageData?.name?.toLowerCase().includes(query) ||
      formatDate(sale.sale_date).includes(query)
    );
  });

  // Отображение загрузки
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Отображение карточек продаж
  const renderSaleCards = () => {
    return (
      <Grid container spacing={3}>
        {filteredSales
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((sale) => {
            const pkg = getPackage(sale.packageId);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={sale.id}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        icon={<ShoppingCartIcon />} 
                        label={pkg.name} 
                        color="primary" 
                        variant="outlined"
                      />
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        {pkg.price} ₽
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {sale.customerName || 'Неизвестный клиент'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(sale.sale_date)}
                      </Typography>
                    </Box>
                    
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => navigate(`/customers/${sale.customerId}`)}
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      Просмотр клиента
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
      </Grid>
    );
  };

  // Отображение таблицы продаж
  const renderSaleTable = () => {
    return (
      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }} aria-label="Таблица продаж">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Пакет услуг</TableCell>
              <TableCell align="right">Стоимость</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSales
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((sale) => {
                const pkg = getPackage(sale.packageId);
                
                return (
                  <TableRow
                    key={sale.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {sale.id}
                    </TableCell>
                    <TableCell>{formatDate(sale.sale_date)}</TableCell>
                    <TableCell>{sale.customerName || 'Неизвестный клиент'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={pkg.name} 
                        color="primary" 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">{pkg.price} ₽</TableCell>
                    <TableCell align="right">
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => navigate(`/customers/${sale.customerId}`)}
                      >
                        Просмотр клиента
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Статистика продаж
  const totalRevenue = filteredSales.reduce((sum, sale) => {
    const pkg = getPackage(sale.packageId);
    return sum + pkg.price;
  }, 0);

  return (
    <Box className="fade-in">
      {/* Заголовок и действия */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Продажи
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/sales/new')}
          >
            Новая продажа
          </Button>
        </Box>
      </Box>

      {/* Статистика продаж */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Всего продаж
              </Typography>
              <Typography variant="h4">
                {filteredSales.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Общая выручка
              </Typography>
              <Typography variant="h4">
                {totalRevenue.toLocaleString()} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Клиентов
              </Typography>
              <Typography variant="h4">
                {new Set(sales.map(s => s.customerId)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Средний чек
              </Typography>
              <Typography variant="h4">
                {filteredSales.length ? Math.round(totalRevenue / filteredSales.length).toLocaleString() : 0} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Поиск и переключение вида */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Поиск продаж"
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
      {filteredSales.length === 0 ? (
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
            {searchQuery ? 'Продажи не найдены' : 'Нет продаж'}
          </Typography>
          {!searchQuery && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => navigate('/sales/new')}
            >
              Создать первую продажу
            </Button>
          )}
        </Box>
      ) : (
        <>
          {viewMode === 'table' ? renderSaleTable() : renderSaleCards()}
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredSales.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        </>
      )}
    </Box>
  );
};

export default Sales; 