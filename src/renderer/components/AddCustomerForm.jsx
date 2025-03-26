import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Typography
} from '@mui/material';

const AddCustomerForm = ({ onSubmit, onCancel, initialData }) => {
  // Начальное состояние формы
  const [formData, setFormData] = useState(initialData || {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    status: 'Активный',
    address: '',
    notes: ''
  });
  
  // Состояние ошибок валидации
  const [errors, setErrors] = useState({});
  
  // Обработка изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }
    
    if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Неверный формат телефона';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Неверный формат email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработка отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        {/* Персональная информация */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="medium">Персональная информация</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            name="firstName"
            label="Имя"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            name="lastName"
            label="Фамилия"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
        </Grid>
        
        {/* Контактная информация */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>Контактная информация</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            name="phone"
            label="Телефон"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            placeholder="+71234567890"
            error={!!errors.phone}
            helperText={errors.phone}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            placeholder="example@example.com"
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            name="address"
            label="Адрес"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        
        {/* Дополнительная информация */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>Дополнительная информация</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Статус</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Статус"
            >
              <MenuItem value="Активный">Активный</MenuItem>
              <MenuItem value="Неактивный">Неактивный</MenuItem>
              <MenuItem value="Потенциальный">Потенциальный</MenuItem>
            </Select>
            <FormHelperText>Выберите статус клиента</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            name="notes"
            label="Примечания"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            placeholder="Дополнительная информация о клиенте..."
          />
        </Grid>
      </Grid>
      
      {/* Кнопки действий */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="outlined" 
          onClick={onCancel} 
          sx={{ mr: 1 }}
        >
          Отмена
        </Button>
        <Button 
          type="submit" 
          variant="contained"
        >
          {initialData ? 'Сохранить' : 'Добавить'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddCustomerForm; 