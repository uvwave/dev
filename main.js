const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const sqlite3 = require('sqlite3').verbose();

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 't2mobile.db');

// Создаем соединение с базой данных
let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
    // Используем хранилище в памяти как резервный вариант
    const store = new Store({name: 'mobile-crm-data'});
    return;
  }
  console.log('Подключение к базе данных SQLite установлено');
});

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

// Создаем окно, когда приложение готово
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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

// Добавление нового клиента
ipcMain.handle('add-customer', (_, customer) => {
  return new Promise((resolve, reject) => {
    const { name, email, phone, address, notes } = customer;
    const stmt = db.prepare(`
      INSERT INTO customers (name, email, phone, address, notes) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(name, email, phone, address, notes, function(err) {
      if (err) {
        console.error('Ошибка при добавлении клиента:', err.message);
        // Возвращаем данные из хранилища в случае ошибки
        const customers = store.get('customers');
        const newCustomer = {
          id: Date.now(),
          createdAt: new Date().toISOString(),
          ...customer
        };
        store.set('customers', [...customers, newCustomer]);
        resolve(newCustomer);
        return;
      }
      
      // Получаем id созданного клиента
      const newCustomer = {
        id: this.lastID,
        name,
        email,
        phone,
        address,
        notes
      };
      
      console.log('Клиент успешно добавлен в базу данных');
      resolve(newCustomer);
    });
    
    stmt.finalize();
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

// Добавление продажи
ipcMain.handle('add-sale', (_, sale) => {
  return new Promise((resolve, reject) => {
    const { customerId, packageId, amount, sale_date } = sale;
    const currentDate = sale_date || new Date().toISOString().split('T')[0];
    
    const stmt = db.prepare(`
      INSERT INTO sales (customer_id, package_id, amount, sale_date) 
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(customerId, packageId, amount, currentDate, function(err) {
      if (err) {
        console.error('Ошибка при добавлении продажи:', err.message);
        // Возвращаем данные из хранилища в случае ошибки
        const sales = store.get('sales');
        const newSale = {
          id: Date.now(),
          date: new Date().toISOString(),
          ...sale
        };
        store.set('sales', [...sales, newSale]);
        resolve(newSale);
        return;
      }
      
      // Получаем id созданной продажи
      const newSale = {
        id: this.lastID,
        customerId,
        packageId,
        amount,
        sale_date: currentDate
      };
      
      console.log('Продажа успешно добавлена в базу данных');
      resolve(newSale);
    });
    
    stmt.finalize();
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
  const { email, password } = credentials;
  console.log('Попытка входа пользователя:', email);
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, email, name, type, phone, avatar 
      FROM users 
      WHERE email = ? AND password = ?
    `;
    
    db.get(query, [email, password], (err, user) => {
      if (err) {
        console.error('Ошибка при проверке учетных данных:', err.message);
        resolve({ success: false, error: 'Ошибка проверки учетных данных' });
        return;
      }
      
      if (user) {
        console.log('Пользователь успешно аутентифицирован:', user);
        resolve({ 
          success: true, 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            type: user.type,
            phone: user.phone,
            avatar: user.avatar
          } 
        });
      } else {
        console.log('Неверные учетные данные для пользователя:', email);
        resolve({ success: false, error: 'Неверный email или пароль' });
      }
    });
  });
}); 