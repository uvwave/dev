const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Инициализация хранилища данных
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
    app.quit();
  }
});

// IPC обработчики для работы с данными

// Получение клиентов
ipcMain.handle('get-customers', () => {
  return store.get('customers');
});

// Добавление нового клиента
ipcMain.handle('add-customer', (_, customer) => {
  const customers = store.get('customers');
  const newCustomer = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...customer
  };
  store.set('customers', [...customers, newCustomer]);
  return newCustomer;
});

// Обновление данных клиента
ipcMain.handle('update-customer', (_, customer) => {
  const customers = store.get('customers');
  const updatedCustomers = customers.map(c => 
    c.id === customer.id ? { ...c, ...customer, updatedAt: new Date().toISOString() } : c
  );
  store.set('customers', updatedCustomers);
  return customer;
});

// Удаление клиента
ipcMain.handle('delete-customer', (_, id) => {
  const customers = store.get('customers');
  const filteredCustomers = customers.filter(c => c.id !== id);
  store.set('customers', filteredCustomers);
  return id;
});

// Получение пакетов услуг
ipcMain.handle('get-packages', () => {
  return store.get('packages');
});

// Добавление продажи
ipcMain.handle('add-sale', (_, sale) => {
  const sales = store.get('sales');
  const newSale = {
    id: Date.now(),
    date: new Date().toISOString(),
    ...sale
  };
  store.set('sales', [...sales, newSale]);
  return newSale;
});

// Получение продаж
ipcMain.handle('get-sales', () => {
  return store.get('sales');
});

// Получение статистики продаж
ipcMain.handle('get-sales-stats', () => {
  const sales = store.get('sales');
  const packages = store.get('packages');
  
  // Статистика по пакетам
  const packageStats = packages.map(pkg => {
    const packageSales = sales.filter(sale => sale.packageId === pkg.id);
    return {
      packageId: pkg.id,
      packageName: pkg.name,
      count: packageSales.length,
      revenue: packageSales.reduce((sum, sale) => sum + pkg.price, 0)
    };
  });

  // Статистика по месяцам (за последние 6 месяцев)
  const today = new Date();
  const monthlyStats = [];
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'long' });
    
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === month.getMonth() && 
             saleDate.getFullYear() === month.getFullYear();
    });
    
    monthlyStats.push({
      month: monthName,
      count: monthSales.length,
      revenue: monthSales.reduce((sum, sale) => {
        const pkg = packages.find(p => p.id === sale.packageId);
        return sum + (pkg ? pkg.price : 0);
      }, 0)
    });
  }

  return {
    packageStats,
    monthlyStats,
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, sale) => {
      const pkg = packages.find(p => p.id === sale.packageId);
      return sum + (pkg ? pkg.price : 0);
    }, 0)
  };
}); 