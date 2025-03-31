/**
 * Скрипт для создания и инициализации базы данных SQLite
 * Для проекта T2 Mobile
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Путь к файлу базы данных (в корневой директории проекта)
const dbPath = path.join(__dirname, '..', 't2mobile.db');

// Проверяем, существует ли файл базы данных, и удаляем его при необходимости
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log(`Существующий файл базы данных ${dbPath} удален`);
}

// Создаем новую базу данных
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при создании базы данных:', err.message);
    return;
  }
  console.log(`База данных создана по пути: ${dbPath}`);
});

// Включаем внешние ключи
db.run('PRAGMA foreign_keys = ON');

// Выполняем все операции в одной транзакции
db.serialize(() => {
  // Создаем таблицы
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('admin', 'client')),
    phone TEXT,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы users:', err.message);
    } else {
      console.log('Таблица users успешно создана');
    }
  });

  db.run(`CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы customers:', err.message);
    } else {
      console.log('Таблица customers успешно создана');
    }
  });

  db.run(`CREATE TABLE packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы packages:', err.message);
    } else {
      console.log('Таблица packages успешно создана');
    }
  });

  db.run(`CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    sale_date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (package_id) REFERENCES packages (id)
  )`, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы sales:', err.message);
    } else {
      console.log('Таблица sales успешно создана');
    }
  });

  // Добавляем тестовые данные: пользователи
  const usersData = [
    {
      email: 'admin@t2mobile.ru',
      password: 'admin123',
      name: 'Администратор',
      type: 'admin',
      phone: '+7 (999) 111-22-33',
      avatar: null
    },
    {
      email: 'client1@example.com',
      password: 'client123',
      name: 'Иванов Иван',
      type: 'client',
      phone: '+7 (999) 333-44-55',
      avatar: null
    },
    {
      email: 'client2@example.com',
      password: 'client456',
      name: 'Петров Петр',
      type: 'client',
      phone: '+7 (999) 666-77-88',
      avatar: null
    }
  ];

  const insertUserStmt = db.prepare(`
    INSERT INTO users (email, password, name, type, phone, avatar) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  usersData.forEach(user => {
    insertUserStmt.run(
      user.email,
      user.password,
      user.name,
      user.type,
      user.phone,
      user.avatar
    );
  });
  
  insertUserStmt.finalize();
  console.log('Тестовые данные для таблицы users добавлены');

  // Добавляем тестовые данные: пакеты услуг
  const packagesData = [
    {
      name: 'Базовый',
      description: 'Базовый пакет услуг мобильной связи',
      price: 500.00
    },
    {
      name: 'Стандарт',
      description: 'Стандартный пакет услуг с включенным интернетом',
      price: 800.00
    },
    {
      name: 'Премиум',
      description: 'Премиальный пакет услуг с максимальными возможностями',
      price: 1500.00
    }
  ];

  const insertPackageStmt = db.prepare(`
    INSERT INTO packages (name, description, price) 
    VALUES (?, ?, ?)
  `);

  packagesData.forEach(pkg => {
    insertPackageStmt.run(
      pkg.name,
      pkg.description,
      pkg.price
    );
  });
  
  insertPackageStmt.finalize();
  console.log('Тестовые данные для таблицы packages добавлены');

  // Добавляем тестовые данные: клиенты
  const customersData = [
    {
      name: 'ООО Альфа',
      email: 'info@alpha.ru',
      phone: '+7 (495) 111-22-33',
      address: 'г. Москва, ул. Ленина, 10',
      notes: 'Крупный клиент'
    },
    {
      name: 'ИП Сидоров А.А.',
      email: 'sidorov@example.com',
      phone: '+7 (499) 222-33-44',
      address: 'г. Санкт-Петербург, пр. Невский, 15',
      notes: null
    },
    {
      name: 'ЗАО Бета',
      email: 'info@beta.ru',
      phone: '+7 (495) 333-44-55',
      address: 'г. Москва, ул. Пушкина, 5',
      notes: 'Требует особого внимания'
    },
    {
      name: 'ООО Гамма',
      email: 'info@gamma.ru',
      phone: '+7 (495) 444-55-66',
      address: 'г. Екатеринбург, ул. Мира, 20',
      notes: null
    },
    {
      name: 'ИП Кузнецов И.С.',
      email: 'kuznetsov@example.com',
      phone: '+7 (499) 555-66-77',
      address: 'г. Новосибирск, ул. Советская, 8',
      notes: 'Постоянный клиент'
    }
  ];

  const insertCustomerStmt = db.prepare(`
    INSERT INTO customers (name, email, phone, address, notes) 
    VALUES (?, ?, ?, ?, ?)
  `);

  customersData.forEach(customer => {
    insertCustomerStmt.run(
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      customer.notes
    );
  });
  
  insertCustomerStmt.finalize();
  console.log('Тестовые данные для таблицы customers добавлены');

  // Добавляем тестовые данные: продажи
  const salesData = [
    { customer_id: 1, package_id: 3, amount: 1500.00, sale_date: '2024-02-15' },
    { customer_id: 2, package_id: 1, amount: 500.00, sale_date: '2024-02-18' },
    { customer_id: 3, package_id: 2, amount: 800.00, sale_date: '2024-02-20' },
    { customer_id: 4, package_id: 1, amount: 500.00, sale_date: '2024-02-22' },
    { customer_id: 5, package_id: 2, amount: 800.00, sale_date: '2024-02-25' },
    { customer_id: 1, package_id: 2, amount: 800.00, sale_date: '2024-03-01' },
    { customer_id: 3, package_id: 3, amount: 1500.00, sale_date: '2024-03-05' }
  ];

  const insertSaleStmt = db.prepare(`
    INSERT INTO sales (customer_id, package_id, amount, sale_date) 
    VALUES (?, ?, ?, ?)
  `);

  salesData.forEach(sale => {
    insertSaleStmt.run(
      sale.customer_id,
      sale.package_id,
      sale.amount,
      sale.sale_date
    );
  });
  
  insertSaleStmt.finalize();
  console.log('Тестовые данные для таблицы sales добавлены');
  
  // Проверяем данные после добавления
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      console.error('Ошибка запроса пользователей:', err.message);
      return;
    }
    console.log('Результат запроса users:', rows.length, 'записей');
  });
  
  // Закрываем соединение с базой данных ПОСЛЕ завершения всех запросов
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('Ошибка при закрытии соединения с базой данных:', err.message);
        return;
      }
      console.log('Соединение с базой данных закрыто');
      console.log(`База данных t2mobile.db успешно создана по пути: ${dbPath}`);
    });
  }, 500); // даем время на выполнение последнего запроса
}); 