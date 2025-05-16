import { formatDate, formatCurrency, formatPhone } from '../dateFormatter';

describe('Форматирование даты', () => {
  test('Правильно форматирует валидную дату', () => {
    // Используем фиксированную дату, чтобы тест был детерминированным
    const date = new Date('2023-05-15T14:30:00');
    const formattedDate = formatDate(date);
    
    // В формате дд.мм.гггг чч:мм
    expect(formattedDate).toMatch(/^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/);
  });

  test('Возвращает "-" для null и undefined', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('')).toBe('-');
  });

  test('Возвращает "-" для неверной даты', () => {
    expect(formatDate('invalid-date')).toBe('-');
  });
});

describe('Форматирование валюты', () => {
  test('Правильно форматирует положительные суммы', () => {
    expect(formatCurrency(1000)).toMatch(/1\s?000\s?₽/);
    expect(formatCurrency(1500)).toMatch(/1\s?500\s?₽/);
  });

  test('Правильно форматирует нулевую сумму', () => {
    expect(formatCurrency(0)).toMatch(/0\s?₽/);
  });

  test('Правильно обрабатывает отрицательные суммы', () => {
    expect(formatCurrency(-1000)).toMatch(/-1\s?000\s?₽/);
  });

  test('Возвращает "0 ₽" для null и undefined', () => {
    expect(formatCurrency(null)).toBe('0 ₽');
    expect(formatCurrency(undefined)).toBe('0 ₽');
  });
});

describe('Форматирование телефона', () => {
  test('Правильно форматирует российский номер с 8', () => {
    expect(formatPhone('89991234567')).toBe('+7 (999) 123-45-67');
  });

  test('Правильно форматирует российский номер с 7', () => {
    expect(formatPhone('79991234567')).toBe('+7 (999) 123-45-67');
  });

  test('Правильно форматирует номер без кода страны', () => {
    expect(formatPhone('9991234567')).toBe('+7 (999) 123-45-67');
  });

  test('Правильно обрабатывает номер с разделителями', () => {
    expect(formatPhone('+7 (999) 123-45-67')).toBe('+7 (999) 123-45-67');
    expect(formatPhone('8 999 123 45 67')).toBe('+7 (999) 123-45-67');
  });

  test('Возвращает пустую строку для null и undefined', () => {
    expect(formatPhone(null)).toBe('');
    expect(formatPhone(undefined)).toBe('');
    expect(formatPhone('')).toBe('');
  });
}); 