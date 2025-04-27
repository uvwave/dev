const { contextBridge, ipcRenderer } = require('electron');

// Предоставление API из main процесса в renderer процесс через контекстный мост
contextBridge.exposeInMainWorld('api', {
  // Аутентификация
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth-login', credentials),
    register: (userData) => ipcRenderer.invoke('auth-register', userData),
    changePassword: (payload) => ipcRenderer.invoke('change-password', payload)
  },

  // Клиенты
  customers: {
    getAll: () => ipcRenderer.invoke('get-customers'),
    add: (customer) => ipcRenderer.invoke('add-customer', customer),
    update: (customer) => ipcRenderer.invoke('update-customer', customer),
    delete: (id) => ipcRenderer.invoke('delete-customer', id)
  },
  
  // Пакеты услуг
  packages: {
    getAll: () => ipcRenderer.invoke('get-packages')
  },
  
  // Продажи
  sales: {
    add: (sale) => ipcRenderer.invoke('add-sale', sale),
    getAll: () => ipcRenderer.invoke('get-sales'),
    getStats: () => ipcRenderer.invoke('get-sales-stats'),
    getUserSales: (userId) => ipcRenderer.invoke('get-user-sales', userId)
  },
  
  // Пользователи (для админских действий)
  users: {
    adminResetPassword: (userId) => ipcRenderer.invoke('admin-reset-password', userId),
    deleteUserAccount: (userId) => ipcRenderer.invoke('delete-user-account', userId)
  },
  
  // Управление окном
  window: {
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
    isMaximized: () => ipcRenderer.invoke('is-window-maximized')
  }
}); 