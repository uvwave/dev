import React from 'react';
import { render, screen } from '@testing-library/react';
import Greeting from '../Greeting';

describe('Компонент Greeting', () => {
  test('Отображает имя пользователя, когда оно предоставлено', () => {
    render(<Greeting username="Иван" />);
    
    // Проверяем, что имя пользователя отображается в приветствии
    const greetingText = screen.getByTestId('greeting-title');
    expect(greetingText).toHaveTextContent('Добро пожаловать, Иван!');
  });

  test('Отображает "Гость", когда имя пользователя не предоставлено', () => {
    render(<Greeting />);
    
    // Проверяем, что используется значение по умолчанию
    const greetingText = screen.getByTestId('greeting-title');
    expect(greetingText).toHaveTextContent('Добро пожаловать, Гость!');
  });

  test('Не отображает сообщение администратора для обычных пользователей', () => {
    render(<Greeting username="Иван" isAdmin={false} />);
    
    // Проверяем, что сообщение для администратора не отображается
    const adminMessage = screen.queryByTestId('admin-message');
    expect(adminMessage).not.toBeInTheDocument();
  });

  test('Отображает сообщение администратора для администраторов', () => {
    render(<Greeting username="Иван" isAdmin={true} />);
    
    // Проверяем, что сообщение для администратора отображается
    const adminMessage = screen.getByTestId('admin-message');
    expect(adminMessage).toBeInTheDocument();
    expect(adminMessage).toHaveTextContent('У вас есть права администратора');
  });
}); 