import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Box } from '@mui/material';

/**
 * Компонент приветствия пользователя
 */
const Greeting = ({ username, isAdmin }) => {
  return (
    <Box data-testid="greeting-component" sx={{ padding: 2 }}>
      <Typography variant="h5" component="h1" data-testid="greeting-title">
        Добро пожаловать, {username || 'Гость'}!
      </Typography>
      
      {isAdmin && (
        <Typography variant="body1" color="primary" data-testid="admin-message">
          У вас есть права администратора
        </Typography>
      )}
    </Box>
  );
};

Greeting.propTypes = {
  username: PropTypes.string,
  isAdmin: PropTypes.bool
};

Greeting.defaultProps = {
  username: '',
  isAdmin: false
};

export default Greeting; 