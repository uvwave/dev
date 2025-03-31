/**
 * Скрипт для проверки содержимого базы данных SQLite
 * Для проекта T2 Mobile
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Путь к файлу базы данных (в корневой директории проекта)
const dbPath = path.join(__dirname, '..', 't2mobile.db');

// Открываем базу данных в режиме только для чтения
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Ошибка при открытии базы данных:', err.message);
    return;
  }
  console.log(`Подключение к базе данных ${dbPath} установлено`);
});

// Функция для выполнения запроса и вывода результатов
function queryAndPrint(sql, params = [], description = '') {
  return new Promise((resolve, reject) => {
    if (description) {
      console.log(`\n${description}:`);
    }
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(`Ошибка при выполнении запроса: ${err.message}`);
        reject(err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('Результатов не найдено');
      } else {
        console.table(rows);
      }
      
      resolve(rows);
    });
  });
}

// Асинхронная функция для последовательной проверки базы данных
async function checkDatabase() {
  try {
    // Проверяем наличие таблиц в базе данных
    await queryAndPrint(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
      [],
      'Список таблиц в базе данных'
    );
    
    // Проверяем данные пользователей
    await queryAndPrint(
      'SELECT id, email, name, type, phone FROM users',
      [],
      'Таблица пользователей (users)'
    );
    
    // Проверяем данные клиентов
    await queryAndPrint(
      'SELECT id, name, email, phone FROM customers',
      [],
      'Таблица клиентов (customers)'
    );
    
    // Проверяем данные пакетов услуг
    await queryAndPrint(
      'SELECT * FROM packages',
      [],
      'Таблица пакетов услуг (packages)'
    );
    
    // Проверяем данные продаж с объединением таблиц для отображения информации
    await queryAndPrint(
      `SELECT 
        s.id, 
        c.name AS customer, 
        p.name AS package, 
        s.amount, 
        s.sale_date
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      JOIN packages p ON s.package_id = p.id
      ORDER BY s.sale_date`,
      [],
      'Таблица продаж (sales) с деталями клиентов и пакетов'
    );
    
    console.log('\nПроверка базы данных завершена успешно!');
  } catch (error) {
    console.error('Произошла ошибка при проверке базы данных:', error);
  } finally {
    // Закрываем соединение с базой данных
    db.close((err) => {
      if (err) {
        console.error('Ошибка при закрытии соединения с базой данных:', err.message);
      } else {
        console.log('Соединение с базой данных закрыто');
      }
    });
  }
}

// Запускаем проверку
checkDatabase(); 