import React from 'react';
import { screen } from '@testing-library/react';
import Greeting from '../Greeting';
import { renderWithProviders } from '../../../utils/testUtils';

describe('Компонент Greeting с провайдерами', () => {
  test('Отображается правильно в контексте тестовой темы', () => {
    renderWithProviders(<Greeting username="Иван" isAdmin={true} />);
    
    // Проверяем, что компонент отображается
    const greetingComponent = screen.getByTestId('greeting-component');
    expect(greetingComponent).toBeInTheDocument();
    
    // Проверяем, что приветствие имеет правильный текст
    const greetingTitle = screen.getByTestId('greeting-title');
    expect(greetingTitle).toHaveTextContent('Добро пожаловать, Иван!');
    
    // Проверяем, что сообщение администратора отображается
    const adminMessage = screen.getByTestId('admin-message');
    expect(adminMessage).toBeInTheDocument();
    expect(adminMessage).toHaveTextContent('У вас есть права администратора');
    
    // Проверяем, что у сообщения администратора установлен цвет primary
    // (MUI конвертирует 'primary' в конкретный RGB цвет)
    expect(adminMessage).toHaveClass('MuiTypography-colorPrimary');
  });
}); 