const { contextBridge, ipcRenderer } = require('electron');
const { AnsiUp } = require('ansi_up');

let ansiToHtml = (text) => text;

try {
  const ansiUp = new AnsiUp();
  ansiToHtml = (text) => ansiUp.ansi_to_html(text);
} catch (err) {
  console.error('Failed to load ansi_up:', err);
}

contextBridge.exposeInMainWorld('fesLauncher', {
  start: () => ipcRenderer.invoke('launcher:update-and-run'),
  stop: () => ipcRenderer.invoke('launcher:stop'),
  openVSCode: (file) => ipcRenderer.invoke('launcher:open-vscode', file),
  ansiToHtml: (text) => ansiToHtml(text),
  ansiLoaded: () => ansiToHtml !== ((t) => t),
  onLog: (callback) => {
    ipcRenderer.on('launcher-log', (_, message) => callback(message));
  }
});