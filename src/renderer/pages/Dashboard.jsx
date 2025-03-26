import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  Card, 
  CardContent,
  Divider
} from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentsIcon from '@mui/icons-material/Payments';

// Регистрация компонентов Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    // Загрузка данных при монтировании компонента
    const fetchData = async () => {
      try {
        // Получение клиентов
        const customersData = await window.api.customers.getAll();
        setCustomers(customersData);

        // Получение продаж
        const salesData = await window.api.sales.getAll();
        setSales(salesData);

        // Получение статистики
        const statsData = await window.api.sales.getStats();
        setStats(statsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Цвета для графиков
  const chartColors = ['#3f51b5', '#f50057', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];

  // Подготовка данных для графика продаж по месяцам
  const monthlySalesData = {
    labels: stats?.monthlyStats.map(item => item.month) || [],
    datasets: [
      {
        label: 'Количество продаж',
        data: stats?.monthlyStats.map(item => item.count) || [],
        backgroundColor: '#3f51b5',
      },
      {
        label: 'Выручка (₽)',
        data: stats?.monthlyStats.map(item => item.revenue) || [],
        backgroundColor: '#f50057',
      },
    ],
  };

  // Подготовка данных для графика продаж по пакетам
  const packageSalesData = {
    labels: stats?.packageStats.map(item => item.packageName) || [],
    datasets: [
      {
        label: 'Продажи по пакетам',
        data: stats?.packageStats.map(item => item.count) || [],
        backgroundColor: chartColors.slice(0, stats?.packageStats.length || 0),
        borderWidth: 1,
      },
    ],
  };

  // Опции для графиков
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Продажи по месяцам',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Распределение продаж по пакетам',
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Карточки с ключевыми показателями */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {customers.length}
                  </Typography>
                  <Typography color="text.secondary" variant="subtitle1">
                    Клиентов
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/customers')}
                sx={{ mt: 1 }}
              >
                Управление клиентами
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.totalSales || 0}
                  </Typography>
                  <Typography color="text.secondary" variant="subtitle1">
                    Продаж
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/sales')}
                sx={{ mt: 1 }}
              >
                Просмотр продаж
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentsIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.totalRevenue?.toLocaleString() || 0} ₽
                  </Typography>
                  <Typography color="text.secondary" variant="subtitle1">
                    Общая выручка
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Button 
                variant="contained" 
                color="primary" 
                size="small" 
                onClick={() => navigate('/sales/new')}
                sx={{ mt: 1 }}
              >
                Новая продажа
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Графики */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Box sx={{ height: '100%' }}>
              <Bar options={barOptions} data={monthlySalesData} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Box sx={{ height: '100%' }}>
              <Pie options={pieOptions} data={packageSalesData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Дополнительные действия */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/customers')}
            >
              Управление клиентами
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={() => navigate('/sales/new')}
            >
              Создать продажу
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard; 