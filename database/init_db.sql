-- Скрипт для создания базы данных SQLite для проекта T2 Mobile
-- Имя базы данных: t2mobile.db

-- Удаление существующих таблиц, если они существуют
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

-- Создание таблицы пользователей (администраторы и клиенты)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('admin', 'client')),
    phone TEXT,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы клиентов
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы пакетов услуг
CREATE TABLE packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы продаж
CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    sale_date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (package_id) REFERENCES packages (id)
);

-- Добавление тестовых данных

-- Пользователи (1 администратор и 2 клиента)
-- УДАЛЕНО: Тестовые пользователи теперь должны регистрироваться через приложение
-- INSERT INTO users (email, password, name, type, phone, avatar) 
-- VALUES ('admin@t2mobile.ru', 'admin123', 'Администратор', 'admin', '+7 (999) 111-22-33', NULL);
-- 
-- INSERT INTO users (email, password, name, type, phone, avatar) 
-- VALUES ('client1@example.com', 'client123', 'Иванов Иван', 'client', '+7 (999) 333-44-55', NULL);
-- 
-- INSERT INTO users (email, password, name, type, phone, avatar) 
-- VALUES ('client2@example.com', 'client456', 'Петров Петр', 'client', '+7 (999) 666-77-88', NULL);

-- Пакеты услуг
INSERT INTO packages (name, description, price) 
VALUES ('Базовый', 'Базовый пакет услуг мобильной связи', 500.00);

INSERT INTO packages (name, description, price) 
VALUES ('Стандарт', 'Стандартный пакет услуг с включенным интернетом', 800.00);

INSERT INTO packages (name, description, price) 
VALUES ('Премиум', 'Премиальный пакет услуг с максимальными возможностями', 1500.00);

-- Клиенты
INSERT INTO customers (name, email, phone, address, notes) 
VALUES ('ООО Альфа', 'info@alpha.ru', '+7 (495) 111-22-33', 'г. Москва, ул. Ленина, 10', 'Крупный клиент');

INSERT INTO customers (name, email, phone, address, notes) 
VALUES ('ИП Сидоров А.А.', 'sidorov@example.com', '+7 (499) 222-33-44', 'г. Санкт-Петербург, пр. Невский, 15', NULL);

INSERT INTO customers (name, email, phone, address, notes) 
VALUES ('ЗАО Бета', 'info@beta.ru', '+7 (495) 333-44-55', 'г. Москва, ул. Пушкина, 5', 'Требует особого внимания');

INSERT INTO customers (name, email, phone, address, notes) 
VALUES ('ООО Гамма', 'info@gamma.ru', '+7 (495) 444-55-66', 'г. Екатеринбург, ул. Мира, 20', NULL);

INSERT INTO customers (name, email, phone, address, notes) 
VALUES ('ИП Кузнецов И.С.', 'kuznetsov@example.com', '+7 (499) 555-66-77', 'г. Новосибирск, ул. Советская, 8', 'Постоянный клиент');

-- Продажи
INSERT INTO sales (customer_id, package_id, amount, sale_date) 
VALUES (1, 3, 1500.00, '2024-02-15');

INSERT INTO sales (customer_id, package_id, amount, sale_date) 
VALUES (2, 1, 500.00, '2024-02-18');

INSERT INTO sales (customer_id, package_id, amount, sale_date) 
VALUES (3, 2, 800.00, '2024-02-20');

INSERT INTO sales (customer_id, package_id, amount, sale_date) 
VALUES (4, 1, 500.00, '2024-02-22');

INSERT INTO sales (customer_id, package_id, amount, sale_date) 
VALUES (5, 2, 800.00, '2024-02-25');

INSERT INTO sales (customer_id, package_id, amount, sale_date) 
VALUES (1, 2, 800.00, '2024-03-01');

INSERT INTO sales (customer_id, package_id, amount, sale_date) 
VALUES (3, 3, 1500.00, '2024-03-05'); 