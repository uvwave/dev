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
        console.error('Ошибка подключения к базе данных:', err.message);
        // TODO: Handle error more gracefully, maybe fallback to store?
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
                console.log('База данных успешно инициализирована.');
                resolve(); // Успешная инициализация
              }
            });
          } catch (readErr) {
            console.error('Ошибка при чтении init_db.sql:', readErr.message);
            reject(readErr);
          }
        } else {
          // Таблица существует, инициализация не нужна
          console.log('Таблица users найдена. Инициализация не требуется.');
          resolve(); // База данных уже инициализирована
        }
      });
    });
  });
}

// Инициализация хранилища данных (используем только если база данных недоступна)
const store = new Store({name: 'mobile-crm-data'});

// Обработчик на случай если хранилище еще не инициализировано
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
    console.log('Инициализация БД завершена, создаем окно...');
    createWindow();
  } catch (error) {
    console.error('!!! Критическая ошибка при инициализации БД, приложение не может запуститься:', error);
    // Можно показать диалоговое окно об ошибке пользователю
    // dialog.showErrorBox('Ошибка базы данных', 'Не удалось инициализировать базу данных. Приложение будет закрыто.');
    app.quit(); // Закрыть приложение, если БД не инициализирована
    return;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      // Перепроверить или просто создать окно, т.к. БД уже должна быть инициализирована
      if (!mainWindow) { 
        createWindow();
      }
    }
  });
});

// Закрываем приложение, когда все окна закрыты (кроме macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Закрываем соединение с базой данных
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Ошибка при закрытии соединения с базой данных:', err.message);
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
        // Возвращаем данные из хранилища в случае ошибки
        resolve(store.get('customers'));
        return;
      }
      console.log('Успешно получены данные о клиентах из базы данных');
      resolve(rows);
    });
  });
});

// Добавление нового клиента (с исправленной обработкой ошибок и авто-созданием пользователя)
ipcMain.handle('add-customer', async (_, customerData) => {
  const { name, email, phone, address, notes } = customerData;
  console.log('Попытка добавления клиента:', email);

  return new Promise((resolve, reject) => {
    // --- Шаг 1: Добавить клиента в таблицу customers --- 
    const customerStmt = db.prepare(`
      INSERT INTO customers (name, email, phone, address, notes) 
      VALUES (?, ?, ?, ?, ?)
    `);

    customerStmt.run(name, email, phone, address, notes, async function(customerErr) {
      if (customerErr) {
        console.error('Ошибка при добавлении клиента в customers:', customerErr.message);
        customerStmt.finalize();
        reject(new Error('Ошибка при сохранении данных клиента в БД')); 
        return;
      }
      
      const newCustomerId = this.lastID;
      const createdCustomer = { ...customerData, id: newCustomerId };
      console.log('Клиент успешно добавлен в customers с ID:', newCustomerId);
      customerStmt.finalize();

      // --- Шаг 2: Попытаться создать пользователя в таблице users --- 
      if (!email) {
        console.warn('Невозможно создать пользователя: email клиента не указан.');
        resolve(createdCustomer);
        return;
      }

      try {
        // Генерируем случайный пароль (например, 8 байт в hex)
        const randomPassword = crypto.randomBytes(8).toString('hex');
        console.log(`!!! Сгенерирован временный пароль для пользователя ${email}: ${randomPassword} !!! ПЕРЕДАЙТЕ ЕГО КЛИЕНТУ !!!`);
        
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
        const userType = 'client';

        const userStmt = db.prepare(`
          INSERT INTO users (email, password, name, phone, type) 
          VALUES (?, ?, ?, ?, ?)
        `);

        userStmt.run(email, hashedPassword, name, phone, userType, function(userErr) {
          if (userErr) {
            if (userErr.message.includes('UNIQUE constraint failed')) {
              console.warn(`Пользователь с email ${email} уже существует в users. Новый аккаунт не создан.`);
              resolve(createdCustomer);
            } else {
              console.error('Ошибка при добавлении пользователя в users:', userErr.message);
              resolve(createdCustomer);
            }
          } else {
            const newUserId = this.lastID;
            console.log(`Пользователь для клиента ${email} успешно создан в users с ID: ${newUserId}`);
            resolve(createdCustomer);
          }
          userStmt.finalize();
        });

      } catch (error) {
        console.error('Критическая ошибка при создании пользователя (хеширование/подготовка запроса):', error);
        resolve(createdCustomer);
      }
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
        // Возвращаем данные из хранилища в случае ошибки
        const customers = store.get('customers');
        const updatedCustomers = customers.map(c => 
          c.id === customer.id ? { ...c, ...customer, updatedAt: new Date().toISOString() } : c
        );
        store.set('customers', updatedCustomers);
        resolve(customer);
        return;
      }
      
      console.log('Клиент успешно обновлен в базе данных');
      resolve(customer);
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
        // Возвращаем данные из хранилища в случае ошибки
        const customers = store.get('customers');
        const filteredCustomers = customers.filter(c => c.id !== id);
        store.set('customers', filteredCustomers);
        resolve(id);
        return;
      }
      
      console.log('Клиент успешно удален из базы данных');
      resolve(id);
    });
    
    stmt.finalize();
  });
});

// Получение пакетов услуг
ipcMain.handle('get-packages', () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM packages", (err, rows) => {
      if (err) {
        console.error('Ошибка при получении пакетов услуг:', err.message);
        // Возвращаем данные из хранилища в случае ошибки
        resolve(store.get('packages'));
        return;
      }
      console.log('Успешно получены данные о пакетах услуг из базы данных');
      resolve(rows);
    });
  });
});

// Добавление продажи (с исправленной обработкой ошибок)
ipcMain.handle('add-sale', (_, saleData) => {
  return new Promise((resolve, reject) => {
    // Получаем данные из saleData
    const { customerId, packageId, amount, sale_date } = saleData;
    
    // Проверка наличия обязательных данных
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
        console.error('Ошибка при добавлении продажи в БД:', err.message);
        stmt.finalize(); // Финализируем в случае ошибки
        // Отправляем ошибку на фронтенд
        reject(new Error('Ошибка при сохранении данных продажи в БД')); 
        return;
      }
      
      // Успешно добавлено, формируем ответный объект
      const newSale = {
        id: this.lastID, // ID созданной записи
        customerId: customerId,
        packageId: packageId,
        amount: amount,
        sale_date: currentDate,
        // Можно добавить customerName и packageName, если они нужны фронту сразу
        // Но лучше получать их через get-sales
      };
      
      console.log('Продажа успешно добавлена в базу данных с ID:', newSale.id);
      stmt.finalize(); // Финализируем после успешного выполнения
      resolve(newSale); // Отправляем созданную продажу на фронтенд
    });
    
    // stmt.finalize(); // Убрано отсюда, т.к. finalize вызывается внутри callback
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
        // Возвращаем данные из хранилища в случае ошибки
        resolve(store.get('sales'));
        return;
      }
      console.log('Успешно получены данные о продажах из базы данных');
      resolve(rows);
    });
  });
});

// Получение статистики продаж
ipcMain.handle('get-sales-stats', () => {
  return new Promise((resolve, reject) => {
    // Статистика по пакетам
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
    
    // Получаем месяцы на русском языке
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    // Запрос для получения суммарной статистики
    const totalsQuery = `
      SELECT 
        COUNT(id) AS totalSales,
        IFNULL(SUM(amount), 0) AS totalRevenue
      FROM sales
    `;
    
    // Запрос для получения статистики по месяцам за последние 6 месяцев
    const today = new Date();
    const monthlyStats = [];
    
    // Функция для выполнения запроса по месячной статистике
    const getMonthStats = (year, month) => {
      return new Promise((innerResolve) => {
        // STRFTIME - для работы с датами в SQLite
        const monthQuery = `
          SELECT 
            COUNT(id) AS count,
            IFNULL(SUM(amount), 0) AS revenue
          FROM sales
          WHERE strftime('%Y', sale_date) = '${year}'
          AND strftime('%m', sale_date) = '${month.toString().padStart(2, '0')}'
        `;
        
        db.get(monthQuery, (err, row) => {
          if (err) {
            console.error('Ошибка при получении месячной статистики:', err.message);
            innerResolve({
              month: months[month - 1],
              count: 0,
              revenue: 0
            });
            return;
          }
          
          innerResolve({
            month: months[month - 1],
            count: row.count,
            revenue: row.revenue
          });
        });
      });
    };
    
    // Получаем статистику по пакетам
    db.all(packageStatsQuery, async (err, packageStats) => {
      if (err) {
        console.error('Ошибка при получении статистики по пакетам:', err.message);
        resolve(getMockStats()); // Возвращаем мок-данные в случае ошибки
        return;
      }
      
      // Получаем общую статистику
      db.get(totalsQuery, async (err, totals) => {
        if (err) {
          console.error('Ошибка при получении общей статистики:', err.message);
          resolve(getMockStats()); // Возвращаем мок-данные в случае ошибки
          return;
        }
        
        // Получаем месячную статистику за последние 6 месяцев
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
            totalSales: totals.totalSales,
            totalRevenue: totals.totalRevenue
          };
          
          console.log('Успешно получена статистика продаж из базы данных');
          resolve(stats);
        } catch (error) {
          console.error('Ошибка при получении месячной статистики:', error.message);
          resolve(getMockStats()); // Возвращаем мок-данные в случае ошибки
        }
      });
    });
  });
});

// Функция получения мок-данных для статистики (на случай ошибок)
function getMockStats() {
  return {
    totalSales: 0,
    totalRevenue: 0,
    monthlyStats: [
      { month: 'Январь', count: 0, revenue: 0 },
      { month: 'Февраль', count: 0, revenue: 0 },
      { month: 'Март', count: 0, revenue: 0 },
      { month: 'Апрель', count: 0, revenue: 0 },
      { month: 'Май', count: 0, revenue: 0 },
      { month: 'Июнь', count: 0, revenue: 0 }
    ],
    packageStats: [
      { packageName: 'Базовый', count: 0 },
      { packageName: 'Стандартный', count: 0 },
      { packageName: 'Премиум', count: 0 }
    ]
  };
}

// Добавляем обработчик для аутентификации пользователя
ipcMain.handle('auth-login', async (_, credentials) => {
  console.log("--- auth-login handler started ---");
  try {
    const { email, password } = credentials;
    console.log('Попытка входа пользователя:', email);

    return new Promise((resolve, reject) => {
      // Select password hash along with other user data
      const query = `
        SELECT id, email, name, type, phone, avatar, password 
        FROM users 
        WHERE email = ?
      `; 

      db.get(query, [email], async (err, user) => {
        console.log("--- db.get callback started ---");
        if (err) {
          console.error('Ошибка при поиске пользователя:', err.message);
          resolve({ success: false, error: 'Ошибка сервера при входе' });
          return;
        }

        if (user) {
          console.log('User found in DB:', user.email);
          // Compare provided password with the stored hash
          const match = await bcrypt.compare(password, user.password);
          if (match) {
            console.log('Пароль совпадает для пользователя:', email);
            // Password matches - Generate JWT
            const userPayload = {
              id: user.id,
              email: user.email,
              name: user.name,
              type: user.type,
              // Add other non-sensitive fields if needed
            };
            const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

            console.log('Пользователь успешно аутентифицирован:', user.email);
            resolve({
              success: true,
              user: { // Return user data (excluding password hash)
                id: user.id,
                email: user.email,
                name: user.name,
                type: user.type,
                phone: user.phone,
                avatar: user.avatar
              },
              token: token // Return the JWT token
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
  } catch (error) {
    console.error('!!! Critical error in auth-login handler:', error);
    // Return a generic error response
    return { success: false, error: 'Критическая ошибка на сервере при входе' };
  }
});

// Добавляем обработчик для регистрации нового пользователя
ipcMain.handle('auth-register', async (_, userData) => {
  const { email, password, firstName, lastName, phone } = userData;
  console.log('Попытка регистрации пользователя:', email);

  // --- 2. Phone Number Formatting ---
  let formattedPhone = phone;
  if (phone) {
    // Remove non-digit characters except potential leading +
    const digits = phone.replace(/\D/g, '');
    // Check if it looks like a Russian number (10 digits after 7/8)
    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
        const nationalPart = digits.substring(1); // Get 10 digits after 7/8
        const operatorCode = nationalPart.substring(0, 3);
        const part1 = nationalPart.substring(3, 6);
        const part2 = nationalPart.substring(6, 8);
        const part3 = nationalPart.substring(8, 10);
        formattedPhone = `+7 (${operatorCode}) ${part1}-${part2}-${part3}`;
    } else if (digits.length === 10) { 
        // Assume 10 digits are the national part
        const operatorCode = digits.substring(0, 3);
        const part1 = digits.substring(3, 6);
        const part2 = digits.substring(6, 8);
        const part3 = digits.substring(8, 10);
        formattedPhone = `+7 (${operatorCode}) ${part1}-${part2}-${part3}`;
    }
    // Add more validation/formatting rules if needed
  }
  console.log('Formatted phone:', formattedPhone);

  // --- 3. Password Hashing ---
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  } catch (hashError) {
    console.error('Ошибка при хешировании пароля:', hashError);
    return { success: false, error: 'Ошибка при регистрации (хеширование)' };
  }

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const userType = 'client'; // Default type for registration

  return new Promise((resolve, reject) => {
    // --- 1. Save to Database (with hashed password and formatted phone) ---
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, phone, type) 
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(email, hashedPassword, fullName, formattedPhone, userType, function(err) {
      if (err) {
        console.error('Ошибка при добавлении пользователя в БД:', err.message);
        // Check for unique constraint error (e.g., email already exists)
        if (err.message.includes('UNIQUE constraint failed')) {
          resolve({ success: false, error: 'Пользователь с таким email уже существует' });
        } else {
          resolve({ success: false, error: 'Ошибка при сохранении пользователя в БД' });
        }
        return;
      }

      const newUserId = this.lastID;
      console.log('Пользователь успешно добавлен в БД с ID:', newUserId);

      // --- 4. Generate JWT Token ---
       const userPayload = {
         id: newUserId,
         email: email,
         name: fullName,
         type: userType
       };
      const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

      resolve({
        success: true,
        user: { // Return newly created user data (excluding password)
          id: newUserId,
          email: email,
          name: fullName,
          phone: formattedPhone,
          type: userType,
          avatar: null // Assuming new users don't have an avatar initially
        },
        token: token // Return the JWT token
      });
    });

    stmt.finalize((finalizeErr) => {
        if (finalizeErr) {
            console.error('Error finalizing statement during registration:', finalizeErr.message);
            // If the promise hasn't been resolved yet (e.g., due to an error before stmt.run callback)
            // resolve with an error here. Otherwise, the success/error is handled in stmt.run callback.
            // This is a safety net, might need refinement based on specific error handling strategy.
        }
    });
  });
}); 