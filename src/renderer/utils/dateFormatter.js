/**
 * Форматирует дату в удобочитаемый формат
 * @param {string|Date} dateString - Строка даты или объект Date
 * @returns {string} - Отформатированная дата
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    // Проверка на валидность даты
    if (isNaN(date.getTime())) return '-';
    
    // Форматирование даты в формат дд.мм.гггг чч:мм
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return '-';
  }
};

/**
 * Форматирует валюту в формат с разделителями и знаком рубля
 * @param {number} amount - Сумма для форматирования
 * @returns {string} - Отформатированная строка с валютой
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0 ₽';
  
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    console.error('Ошибка форматирования валюты:', error);
    return `${amount} ₽`;
  }
};

/**
 * Форматирует номер телефона в удобочитаемый формат
 * @param {string} phone - Строка с номером телефона
 * @returns {string} - Отформатированный номер телефона
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Удаляем все нецифровые символы
  const digits = phone.replace(/\D/g, '');
  
  // Если номер российский (10 или 11 цифр)
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    const nationalDigits = digits.startsWith('8') ? digits.substring(1) : digits.substring(1);
    return `+7 (${nationalDigits.substring(0, 3)}) ${nationalDigits.substring(3, 6)}-${nationalDigits.substring(6, 8)}-${nationalDigits.substring(8, 10)}`;
  } 
  // Если номер без кода страны (10 цифр)
  else if (digits.length === 10) {
    return `+7 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 8)}-${digits.substring(8, 10)}`;
  }
  
  // Если формат не распознан, возвращаем как есть
  return phone;
}; 