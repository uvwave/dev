const { contextBridge, ipcRenderer } = require('electron');

// Экспортируем функции API, доступные из renderer процесса
contextBridge.exposeInMainWorld('api', {
  // Функции для работы с клиентами
  customers: {
    getAll: () => ipcRenderer.invoke('get-customers'),
    add: (customer) => ipcRenderer.invoke('add-customer', customer),
    update: (customer) => ipcRenderer.invoke('update-customer', customer),
    delete: (id) => ipcRenderer.invoke('delete-customer', id)
  },
  // Функции для работы с пакетами услуг
  packages: {
    getAll: () => ipcRenderer.invoke('get-packages')
  },
  // Функции для работы с продажами
  sales: {
    getAll: () => ipcRenderer.invoke('get-sales'),
    add: (sale) => ipcRenderer.invoke('add-sale', sale),
    getStats: () => ipcRenderer.invoke('get-sales-stats')
  }
}); 