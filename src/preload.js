const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Gelecek aşamalarda ayarlar için burayı kullanacağız
});