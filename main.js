const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const saltRounds = 10;
const JWT_SECRET = 'your-super-secret-key-change-this!';

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 't2mobile.db');
const initSqlPath = path.join(__dirname, 'database', 'init_db.sql');

// Глобальная переменная для БД
let db;

// Функция для инициализации базы данных
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Ошибка подключения к базе данных SQLite:', err.message);
        reject(err);
        return;
      }
      console.log('Подключение к базе данных SQLite установлено');

      // Проверяем, существует ли таблица users
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, table) => {
        if (err) {
          console.error('Ошибка при проверке существования таблицы users:', err.message);
          reject(err);
          return;
        }

        if (!table) {
          // Таблицы users нет, нужно инициализировать БД из файла
          console.log('Таблица users не найдена. Инициализация базы данных из init_db.sql...');
          try {
            const initSql = fs.readFileSync(initSqlPath, 'utf8');
            db.exec(initSql, (execErr) => {
              if (execErr) {
                console.error('Ошибка при выполнении init_db.sql:', execErr.message);
                reject(execErr);
              } else {
                console.log('База данных SQLite успешно инициализирована.');
                resolve(); // Успешная инициализация
              }
            });
          } catch (readErr) {
            console.error('Ошибка при чтении init_db.sql:', readErr.message);
            reject(readErr);
          }
        } else {
          // Таблица существует, инициализация не нужна
          console.log('Таблица users найдена. Инициализация SQLite не требуется.');
          resolve(); // База данных уже инициализирована
        }
      });
    });
  });
}

// Инициализация хранилища данных (остается как fallback)
const store = new Store({name: 'mobile-crm-data'});

if (!store.has('customers')) {
  store.set('customers', []);
}
if (!store.has('packages')) {
  store.set('packages', [
    { id: 1, name: 'Базовый', description: 'Минимальный пакет услуг', price: 300, minutes: 300, internet: 3, sms: 50 },
    { id: 2, name: 'Стандарт', description: 'Стандартный пакет услуг', price: 500, minutes: 600, internet: 15, sms: 100 },
    { id: 3, name: 'Премиум', description: 'Расширенный пакет услуг', price: 1000, minutes: 1500, internet: 30, sms: 300 }
  ]);
}
if (!store.has('sales')) {
  store.set('sales', []);
}

let mainWindow;

function createWindow() {
  // Создаем окно браузера с отключенным системным заголовком
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Отключаем стандартный фрейм окна
    titleBarStyle: 'hidden', // Скрываем стандартный заголовок
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a2e', // Тёмный фон для предотвращения белых вспышек при загрузке
  });

  // Загружаем index.html
  mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  
  // Открываем инструменты разработчика в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Убираем меню по умолчанию
  mainWindow.setMenuBarVisibility(false);

  // Обработчик закрытия окна
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC обработчики для управления окном
ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
  return true;
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return false;
    } else {
      mainWindow.maximize();
      return true;
    }
  }
  return false;
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close();
  return true;
});

ipcMain.handle('is-window-maximized', () => {
  if (mainWindow) return mainWindow.isMaximized();
  return false;
});

// Создаем окно и инициализируем БД, когда приложение готово
app.whenReady().then(async () => {
  try {
    await initializeDatabase();
    console.log('Инициализация БД SQLite завершена, создаем окно...');
    createWindow();
  } catch (error) {
    console.error('!!! Критическая ошибка при инициализации БД SQLite, приложение не может запуститься:', error);
    app.quit();
    return;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (!mainWindow) {
        createWindow();
      }
    }
  });
});

// Закрываем приложение, когда все окна закрыты (кроме macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Закрываем соединение с базой данных SQLite
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Ошибка при закрытии соединения с базой данных SQLite:', err.message);
        } else {
          console.log('Соединение с базой данных SQLite закрыто');
        }
      });
    }
    app.quit();
  }
});

// IPC обработчики для работы с данными

// Получение клиентов
ipcMain.handle('get-customers', () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM customers", (err, rows) => {
      if (err) {
        console.error('Ошибка при получении клиентов:', err.message);
        resolve(store.get('customers')); // Fallback to store
        return;
      }
      console.log('Успешно получены данные о клиентах из SQLite');
      resolve(rows);
    });
  });
});

// Добавление нового клиента
ipcMain.handle('add-customer', async (_, customerData) => {
  const { name, email, phone, address, notes } = customerData;
  console.log('Попытка добавления клиента:', email);
  let newUserId = null;

  return new Promise(async (resolve, reject) => {
    if (email) {
      try {
        const randomPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
        const userType = 'client';

        await new Promise((userResolve, userReject) => {
          const userStmt = db.prepare(`
            INSERT INTO users (email, password, name, phone, type)
            VALUES (?, ?, ?, ?, ?)
          `);
          userStmt.run(email, hashedPassword, name, phone, userType, function(userErr) {
            if (userErr) {
              if (userErr.message.includes('UNIQUE constraint failed')) {
                console.warn(`Пользователь с email ${email} уже существует.`);
                db.get("SELECT id FROM users WHERE email = ?", [email], (findErr, existingUser) => {
                  if (existingUser) {
                    newUserId = existingUser.id;
                    console.log(`Найден существующий пользователь с ID: ${newUserId}`);
                  } else {
                    console.error('Не удалось найти существующего пользователя после ошибки UNIQUE constraint', findErr);
                  }
                  userResolve();
                });
              } else {
                console.error('Ошибка при добавлении пользователя в users:', userErr.message);
                userReject(new Error('Ошибка создания пользовательского аккаунта'));
              }
            } else {
              newUserId = this.lastID;
              console.log(`Пользователь для клиента ${email} успешно создан в users с ID: ${newUserId}`);
              console.log(`!!! Сгенерирован временный пароль для пользователя ${email}: ${randomPassword} !!! ПЕРЕДАЙТЕ ЕГО КЛИЕНТУ !!!`);
              userResolve();
            }
            userStmt.finalize();
          });
        });

      } catch (userCreationError) {
        console.error('Критическая ошибка при создании пользователя:', userCreationError);
        // Не прерываем, но сообщаем
      }
    } else {
      console.warn('Email не указан, пользовательский аккаунт не создается.');
    }

    const customerStmt = db.prepare(`
      INSERT INTO customers (name, email, phone, address, notes, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    customerStmt.run(name, email, phone, address, notes, newUserId, function(customerErr) {
      customerStmt.finalize(); // Финализируем здесь
      if (customerErr) {
        console.error('Ошибка при добавлении клиента в customers:', customerErr.message);
        reject(new Error('Ошибка при сохранении данных клиента в БД'));
        return;
      }

      const newCustomerId = this.lastID;
      const createdCustomer = { ...customerData, id: newCustomerId, user_id: newUserId };
      console.log('Клиент успешно добавлен в customers с ID:', newCustomerId);
      resolve(createdCustomer);
    });
  });
});

// Обновление данных клиента
ipcMain.handle('update-customer', (_, customer) => {
  return new Promise((resolve, reject) => {
    const { id, name, email, phone, address, notes } = customer;
    const stmt = db.prepare(`
      UPDATE customers
      SET name = ?, email = ?, phone = ?, address = ?, notes = ?
      WHERE id = ?
    `);

    stmt.run(name, email, phone, address, notes, id, function(err) {
      if (err) {
        console.error('Ошибка при обновлении клиента:', err.message);
        // Fallback to store
        const customers = store.get('customers');
        const updatedCustomers = customers.map(c =>
          c.id === customer.id ? { ...c, ...customer, updatedAt: new Date().toISOString() } : c
        );
        store.set('customers', updatedCustomers);
        resolve(customer); // Return original customer data on error
        return;
      }
      if (this.changes === 0) {
         console.warn(`Клиент с ID ${id} не найден для обновления.`);
         // Optionally reject or resolve differently
      } else {
         console.log('Клиент успешно обновлен в SQLite');
      }
      resolve(customer); // Return updated customer data
    });
    stmt.finalize();
  });
});

// Удаление клиента
ipcMain.handle('delete-customer', (_, id) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("DELETE FROM customers WHERE id = ?");

    stmt.run(id, function(err) {
      if (err) {
        console.error('Ошибка при удалении клиента:', err.message);
        // Fallback to store
        const customers = store.get('customers');
        const filteredCustomers = customers.filter(c => c.id !== id);
        store.set('customers', filteredCustomers);
        resolve(id);
        return;
      }
       if (this.changes === 0) {
         console.warn(`Клиент с ID ${id} не найден для удаления.`);
         // Resolve anyway, as the goal is achieved (client is gone)
       } else {
         console.log('Клиент успешно удален из SQLite');
       }
      resolve(id);
    });
    stmt.finalize();
  });
});

// Получение пакетов услуг
ipcMain.handle('get-packages', () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM packages ORDER BY id", (err, rows) => {
      if (err) {
        console.error('Ошибка при получении пакетов услуг:', err.message);
        resolve(store.get('packages')); // Fallback
        return;
      }
      console.log('Успешно получены данные о пакетах услуг из SQLite');
      resolve(rows);
    });
  });
});

// Добавление продажи
ipcMain.handle('add-sale', (_, saleData) => {
  return new Promise((resolve, reject) => {
    const { customerId, packageId, amount, sale_date } = saleData;

    if (customerId === undefined || packageId === undefined || amount === undefined) {
      console.error('Ошибка добавления продажи: Отсутствуют customerId, packageId или amount.', saleData);
      reject(new Error('Недостаточно данных для добавления продажи (клиент, пакет, сумма).'));
      return;
    }

    const currentDate = sale_date || new Date().toISOString().split('T')[0];

    const stmt = db.prepare(`
      INSERT INTO sales (customer_id, package_id, amount, sale_date)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(customerId, packageId, amount, currentDate, function(err) {
      if (err) {
        console.error('Ошибка при добавлении продажи в БД SQLite:', err.message);
        stmt.finalize();
        reject(new Error('Ошибка при сохранении данных продажи в БД'));
        return;
      }
      const newSale = {
        id: this.lastID,
        customerId: customerId,
        packageId: packageId,
        amount: amount,
        sale_date: currentDate,
      };
      console.log('Продажа успешно добавлена в SQLite с ID:', newSale.id);
      stmt.finalize();
      resolve(newSale);
    });
  });
});

// Получение продаж
ipcMain.handle('get-sales', () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        s.id,
        s.customer_id AS customerId,
        s.package_id AS packageId,
        s.amount,
        s.sale_date,
        c.name AS customerName,
        p.name AS packageName
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      JOIN packages p ON s.package_id = p.id
      ORDER BY s.sale_date DESC
    `;

    db.all(query, (err, rows) => {
      if (err) {
        console.error('Ошибка при получении продаж:', err.message);
        resolve(store.get('sales')); // Fallback
        return;
      }
      console.log('Успешно получены данные о продажах из SQLite');
      resolve(rows);
    });
  });
});

// Получение статистики продаж
ipcMain.handle('get-sales-stats', () => {
  return new Promise((resolve, reject) => {
    const packageStatsQuery = `
      SELECT
        p.id AS packageId,
        p.name AS packageName,
        COUNT(s.id) AS count,
        SUM(s.amount) AS revenue
      FROM packages p
      LEFT JOIN sales s ON p.id = s.package_id
      GROUP BY p.id, p.name
    `;

    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    const totalsQuery = `
      SELECT
        COUNT(id) AS totalSales,
        IFNULL(SUM(amount), 0) AS totalRevenue
      FROM sales
    `;

    const today = new Date();

    const getMonthStats = (year, month) => {
      return new Promise((innerResolve) => {
        const monthQuery = `
          SELECT
            COUNT(id) AS count,
            IFNULL(SUM(amount), 0) AS revenue
          FROM sales
          WHERE strftime('%Y', sale_date) = ?
          AND strftime('%m', sale_date) = ?
        `;
        // Используем padStart для месяца
        const monthStr = month.toString().padStart(2, '0');
        db.get(monthQuery, [year.toString(), monthStr], (err, row) => {
          if (err) {
            console.error('Ошибка при получении месячной статистики:', err.message);
            innerResolve({ month: months[month - 1], count: 0, revenue: 0 });
          } else {
            innerResolve({ month: months[month - 1], count: row?.count || 0, revenue: row?.revenue || 0 });
          }
        });
      });
    };

    db.all(packageStatsQuery, (err, packageStats) => {
      if (err) {
        console.error('Ошибка при получении статистики по пакетам:', err.message);
        reject(new Error('Ошибка получения статистики пакетов')); // Reject on error
        return;
      }

      db.get(totalsQuery, async (err, totals) => {
        if (err) {
          console.error('Ошибка при получении общей статистики:', err.message);
          reject(new Error('Ошибка получения общей статистики')); // Reject on error
          return;
        }

        const monthlyStatsPromises = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          monthlyStatsPromises.push(getMonthStats(date.getFullYear(), date.getMonth() + 1));
        }

        try {
          const monthlyStats = await Promise.all(monthlyStatsPromises);
          const stats = {
            packageStats,
            monthlyStats,
            totalSales: totals?.totalSales || 0,
            totalRevenue: totals?.totalRevenue || 0
          };
          console.log('Успешно получена статистика продаж из SQLite');
          resolve(stats);
        } catch (error) {
          console.error('Ошибка при получении месячной статистики:', error.message);
          reject(new Error('Ошибка получения месячной статистики')); // Reject on error
        }
      });
    });
  });
});

// Добавляем обработчик для аутентификации пользователя
ipcMain.handle('auth-login', async (_, credentials) => {
  console.log("--- auth-login handler started (SQLite) ---");
  const { email, password } = credentials;
  console.log('Попытка входа пользователя:', email);

  const query = `
      SELECT id, email, name, type, phone, password
      FROM users
      WHERE email = ?
  `;

  return new Promise((resolve, reject) => {
      db.get(query, [email], async (err, user) => {
          if (err) {
              console.error('Ошибка при поиске пользователя:', err.message);
              resolve({ success: false, error: 'Ошибка сервера при входе' });
              return;
          }

          if (user) {
              console.log('User found in DB:', user.email);
              let passwordMatch = false;
              const storedPassword = user.password;

              if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$'))) {
                  console.log('Обнаружен хеш пароля, используем bcrypt.compare');
                  try {
                      passwordMatch = await bcrypt.compare(password, storedPassword);
                  } catch (bcryptError) {
                      console.error('Ошибка bcrypt.compare:', bcryptError);
                      resolve({ success: false, error: 'Ошибка проверки пароля' });
                      return;
                  }
              } else {
                  console.warn('Обнаружен НЕ хешированный пароль в БД (ожидается только для тестовых аккаунтов). Сравнение как текст.');
                  passwordMatch = (password === storedPassword);
              }

              if (passwordMatch) {
                  console.log('Пароль совпадает для пользователя:', email);
                  const userPayload = {
                      id: user.id, email: user.email, name: user.name, type: user.type, phone: user.phone,
                  };
                  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });

                  console.log('Пользователь успешно аутентифицирован:', user.email);
                  resolve({
                      success: true,
                      user: { id: user.id, email: user.email, name: user.name, type: user.type, phone: user.phone },
                      token: token
                  });
              } else {
                  console.log('Неверный пароль для пользователя:', email);
                  resolve({ success: false, error: 'Неверный email или пароль' });
              }
          } else {
              console.log('Пользователь не найден:', email);
              resolve({ success: false, error: 'Неверный email или пароль' });
          }
      });
  });
});

// Добавляем обработчик для регистрации нового пользователя
ipcMain.handle('auth-register', async (_, userData) => {
  const { email, password, firstName, lastName, phone } = userData;
  console.log('Попытка регистрации пользователя:', email);

  let formattedPhone = phone;
  if (phone) {
    // Remove non-digit characters except potential leading +
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
        const nationalPart = digits.substring(1);
        const operatorCode = nationalPart.substring(0, 3);
        const part1 = nationalPart.substring(3, 6);
        const part2 = nationalPart.substring(6, 8);
        const part3 = nationalPart.substring(8, 10);
        formattedPhone = `+7 (${operatorCode}) ${part1}-${part2}-${part3}`;
    } else if (digits.length === 10) {
        const operatorCode = digits.substring(0, 3);
        const part1 = digits.substring(3, 6);
        const part2 = digits.substring(6, 8);
        const part3 = digits.substring(8, 10);
        formattedPhone = `+7 (${operatorCode}) ${part1}-${part2}-${part3}`;
    }
  }
  console.log('Formatted phone:', formattedPhone);

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  } catch (hashError) {
    console.error('Ошибка при хешировании пароля:', hashError);
    return { success: false, error: 'Ошибка при регистрации (хеширование)' };
  }

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const userType = 'client';

  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, phone, type)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(email, hashedPassword, fullName, formattedPhone, userType, function(err) {
      if (err) {
        stmt.finalize();
        console.error('Ошибка при добавлении пользователя в БД:', err.message);
        if (err.message.includes('UNIQUE constraint failed')) {
          resolve({ success: false, error: 'Пользователь с таким email уже существует' });
        } else {
          resolve({ success: false, error: 'Ошибка при сохранении пользователя в БД' });
        }
        return;
      }

      const newUserId = this.lastID;
      console.log('Пользователь успешно добавлен в БД с ID:', newUserId);
      stmt.finalize(); // Финализируем стейтмент пользователя

      // Создание связанного клиента
      const customerStmt = db.prepare(`
        INSERT INTO customers (name, email, phone, user_id)
        VALUES (?, ?, ?, ?)
      `);

      customerStmt.run(fullName, email, formattedPhone, newUserId, function(customerErr) {
        customerStmt.finalize(); // Финализируем стейтмент клиента
        if (customerErr) {
          console.error(`Ошибка при создании связанного клиента для user ID ${newUserId}:`, customerErr.message);
          // Продолжаем, но ошибка залогирована
        } else {
          const newCustomerId = this.lastID;
          console.log(`Связанный клиент успешно создан с ID: ${newCustomerId} для user ID: ${newUserId}`);
        }

        // Генерация JWT и отправка ответа
        const userPayload = { id: newUserId, email: email, name: fullName, type: userType };
        const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });

        resolve({
          success: true,
          user: { id: newUserId, email: email, name: fullName, phone: formattedPhone, type: userType },
          token: token
        });
      });
    });
  });
});

// Получение продаж для конкретного пользователя
ipcMain.handle('get-user-sales', async (_, userId) => {
  if (!userId) {
    console.error('get-user-sales: userId не предоставлен');
    return [];
  }
  console.log(`Запрос продаж для пользователя с ID: ${userId}`);

  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM customers WHERE user_id = ?", [userId], (err, customer) => {
      if (err) {
        console.error(`Ошибка при поиске customer_id для user_id ${userId}:`, err.message);
        reject(new Error('Ошибка при поиске данных клиента'));
        return;
      }

      if (!customer) {
        console.warn(`Клиент (customer) для пользователя с ID ${userId} не найден.`);
        resolve([]);
        return;
      }

      const customerId = customer.id;
      console.log(`Найден customer_id: ${customerId} для user_id: ${userId}`);

      const query = `
        SELECT
          s.id,
          s.customer_id AS customerId,
          s.package_id AS packageId,
          s.amount,
          s.sale_date,
          p.name AS packageName
        FROM sales s
        JOIN packages p ON s.package_id = p.id
        WHERE s.customer_id = ?
        ORDER BY s.sale_date DESC
      `;

      db.all(query, [customerId], (salesErr, rows) => {
        if (salesErr) {
          console.error(`Ошибка при получении продаж для customer_id ${customerId}:`, salesErr.message);
          reject(new Error('Ошибка при получении истории продаж'));
          return;
        }
        console.log(`Найдено ${rows.length} продаж для customer_id: ${customerId}`);
        resolve(rows);
      });
    });
  });
});

// Смена пароля пользователем
ipcMain.handle('change-password', async (_, { userId, currentPassword, newPassword }) => {
  console.log(`Попытка смены пароля для пользователя ID: ${userId}`);

  if (!userId || !currentPassword || !newPassword) {
    return { success: false, error: 'Не все данные для смены пароля предоставлены.' };
  }
  if (newPassword.length < 6) {
    return { success: false, error: 'Новый пароль должен быть не менее 6 символов.' };
  }

  return new Promise((resolve, reject) => {
    db.get("SELECT password FROM users WHERE id = ?", [userId], async (err, user) => {
      if (err) {
        console.error(`Ошибка поиска пользователя ${userId} для смены пароля:`, err.message);
        resolve({ success: false, error: 'Ошибка сервера при поиске пользователя.' });
        return;
      }
      if (!user) {
        console.error(`Пользователь ${userId} не найден для смены пароля.`);
        resolve({ success: false, error: 'Пользователь не найден.' });
        return;
      }

      try {
        let passwordMatch = false;
        const storedPassword = user.password;

        if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$'))) {
          console.log(`ChangePassword: Обнаружен хеш пароля для user ${userId}, используем bcrypt.compare`);
          try {
              passwordMatch = await bcrypt.compare(currentPassword, storedPassword);
          } catch (bcryptError) {
              console.error(`ChangePassword: Ошибка bcrypt.compare для user ${userId}:`, bcryptError);
              resolve({ success: false, error: 'Ошибка проверки пароля' });
              return;
          }
        } else {
          console.warn(`ChangePassword: Обнаружен НЕ хешированный пароль в БД для user ${userId} (ожидается только для тестовых аккаунтов). Сравнение как текст.`);
          passwordMatch = (currentPassword === storedPassword);
        }

        if (!passwordMatch) {
          console.warn(`Неверный текущий пароль для пользователя ${userId}.`);
          resolve({ success: false, error: 'Текущий пароль неверен.' });
          return;
        }

        console.log(`ChangePassword: Текущий пароль для user ${userId} совпал, хешируем новый.`);
        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

        db.run("UPDATE users SET password = ? WHERE id = ?", [newHashedPassword, userId], function(updateErr) {
          if (updateErr) {
            console.error(`Ошибка обновления пароля для пользователя ${userId}:`, updateErr.message);
            resolve({ success: false, error: 'Ошибка сервера при обновлении пароля.' });
          } else if (this.changes === 0) {
              console.error(`Не удалось обновить пароль для пользователя ${userId} (возможно, ID не найден).`);
              resolve({ success: false, error: 'Не удалось обновить пароль.' });
          } else {
            console.log(`Пароль для пользователя ${userId} успешно обновлен.`);
            resolve({ success: true });
          }
        });

      } catch (compareOrHashError) {
        console.error(`Ошибка bcrypt при смене пароля для ${userId}:`, compareOrHashError);
        resolve({ success: false, error: 'Ошибка при обработке пароля.' });
      }
    });
  });
});

// Сброс пароля пользователя администратором
ipcMain.handle('admin-reset-password', async (_, userId) => {
  console.log(`Попытка сброса пароля администратором для пользователя ID: ${userId}`);

  if (!userId) {
    return { success: false, error: 'Не предоставлен ID пользователя для сброса пароля.' };
  }

  try {
    const userEmailResult = await new Promise((resolve, reject) => {
        db.get("SELECT email FROM users WHERE id = ?", [userId], (err, user) => {
            if (err || !user) resolve(null);
            else resolve(user.email);
        });
    });
    const userEmailForLog = userEmailResult || `ID ${userId}`;

    const newRandomPassword = crypto.randomBytes(8).toString('hex');
    const newHashedPassword = await bcrypt.hash(newRandomPassword, saltRounds);

    const updateResult = await new Promise((resolve) => {
        db.run("UPDATE users SET password = ? WHERE id = ?", [newHashedPassword, userId], function(updateErr) {
          if (updateErr) {
            console.error(`Ошибка обновления пароля при сбросе для ${userEmailForLog}:`, updateErr.message);
            resolve({ success: false, error: 'Ошибка сервера при обновлении пароля.' });
          } else if (this.changes === 0) {
            console.error(`Не удалось сбросить пароль для ${userEmailForLog} (ID не найден?).`);
            resolve({ success: false, error: 'Не удалось сбросить пароль (пользователь не найден).' });
          } else {
            console.log(`Пароль для пользователя ${userEmailForLog} успешно сброшен.`);
            console.log(`#############################################################`);
            console.log(`!!! Новый временный пароль для ${userEmailForLog}: ${newRandomPassword} !!!`);
            console.log(`!!! ПЕРЕДАЙТЕ ЭТОТ ПАРОЛЬ ПОЛЬЗОВАТЕЛЮ БЕЗОПАСНО !!!`);
            console.log(`#############################################################`);
            resolve({ success: true, newPassword: newRandomPassword }); // Возвращаем пароль
          }
        });
    });
    return updateResult;

  } catch (error) {
    console.error(`Критическая ошибка при сбросе пароля для пользователя ID ${userId}:`, error);
    return { success: false, error: 'Критическая ошибка сервера при сбросе пароля.' };
  }
});

// Удаление аккаунта пользователя
ipcMain.handle('delete-user-account', async (_, userId) => {
  console.log(`Попытка удаления аккаунта для пользователя ID: ${userId}`);

  if (!userId) {
    console.error('delete-user-account: userId не предоставлен.');
    return { success: false, error: 'Не указан ID пользователя для удаления.' };
  }

  return new Promise((resolve, reject) => {
    // Используем транзакцию SQLite
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      let customerIdToDelete = null;

      // 1. Найти связанного клиента (если есть)
      db.get("SELECT id FROM customers WHERE user_id = ?", [userId], (err, customer) => {
        if (err) {
          console.error(`Ошибка поиска клиента для user ${userId} при удалении:`, err.message);
          db.run("ROLLBACK");
          resolve({ success: false, error: 'Ошибка сервера при поиске связанных данных.' });
          return;
        }

        const deleteUserRecord = () => {
            // 4. Удалить пользователя
            db.run("DELETE FROM users WHERE id = ?", [userId], function(userErr) {
              if (userErr) {
                console.error(`Ошибка удаления пользователя ${userId}:`, userErr.message);
                db.run("ROLLBACK");
                resolve({ success: false, error: 'Ошибка сервера при удалении аккаунта пользователя.' });
              } else if (this.changes === 0) {
                console.warn(`Пользователь ${userId} не найден для удаления (возможно, уже удален).`);
                db.run("ROLLBACK");
                resolve({ success: false, error: 'Пользователь не найден для удаления.' });
              } else {
                console.log(`Пользователь ${userId} успешно удален.`);
                db.run("COMMIT"); // Все успешно, подтверждаем транзакцию
                resolve({ success: true });
              }
            });
        };

        if (customer) {
          customerIdToDelete = customer.id;
          console.log(`Найден клиент ${customerIdToDelete} для удаления (связан с user ${userId})`);

          // 2. Удалить связанные продажи
          db.run("DELETE FROM sales WHERE customer_id = ?", [customerIdToDelete], function(salesErr) {
            if (salesErr) {
              console.error(`Ошибка удаления продаж для клиента ${customerIdToDelete}:`, salesErr.message);
              db.run("ROLLBACK");
              resolve({ success: false, error: 'Ошибка сервера при удалении истории покупок.' });
              return;
            }
            console.log(`Удалено продаж для клиента ${customerIdToDelete}: ${this.changes}`);

            // 3. Удалить клиента
            db.run("DELETE FROM customers WHERE id = ?", [customerIdToDelete], function(custErr) {
              if (custErr) {
                console.error(`Ошибка удаления клиента ${customerIdToDelete}:`, custErr.message);
                db.run("ROLLBACK");
                resolve({ success: false, error: 'Ошибка сервера при удалении профиля клиента.' });
                return;
              }
              console.log(`Клиент ${customerIdToDelete} удален.`);
              deleteUserRecord(); // Переходим к удалению пользователя
            });
          });
        } else {
           console.log(`Клиент для пользователя ${userId} не найден, пропускаем удаление клиента и продаж.`);
           deleteUserRecord(); // Клиента нет, сразу удаляем пользователя
        }
      });
    }); // конец db.serialize
  });
}); 