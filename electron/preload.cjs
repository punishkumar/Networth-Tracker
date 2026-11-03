const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadData: () => ipcRenderer.invoke('storage:load'),
  saveData: (data) => ipcRenderer.invoke('storage:save', data),
  exportBackup: (data) => ipcRenderer.invoke('storage:export', data),
  importBackup: () => ipcRenderer.invoke('storage:import'),
  isElectron: true,
});
