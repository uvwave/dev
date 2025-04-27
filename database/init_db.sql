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
    user_id INTEGER UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Создание таблицы пакетов услуг
CREATE TABLE packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    minutes INTEGER,
    internet INTEGER,
    sms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы продаж
CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    sale_date TEXT NOT NULL, -- SQLite не имеет строгого типа DATE, используем TEXT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages (id) ON DELETE RESTRICT
);

-- Добавление данных

-- Пакеты услуг (с указанием ID и новых данных)
INSERT INTO packages (id, name, description, price, minutes, internet, sms) VALUES 
(1, 'Базовый', 'Базовый пакет услуг мобильной связи', 500.00, 300, 5, 50);
INSERT INTO packages (id, name, description, price, minutes, internet, sms) VALUES 
(2, 'Стандарт', 'Стандартный пакет услуг с включенным интернетом', 800.00, 600, 20, 100);
INSERT INTO packages (id, name, description, price, minutes, internet, sms) VALUES 
(3, 'Премиум', 'Премиальный пакет услуг с максимальными возможностями', 1500.00, 1500, 50, 300);

-- Пользователи, клиенты и продажи удалены - регистрируются/создаются через приложение 