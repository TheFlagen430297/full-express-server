const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec, execFile } = require('child_process');
const https = require('https');

let mainWindow = null;
let runningProcess = null;

const START_FILE_URL = 'https://raw.githubusercontent.com/TheFlagen430297/full-express-server/dev/FESStart.js';
const BUN_DOWNLOAD_URL = 'https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64.zip';

function getAppFolder() {
  if (!app.isPackaged) return path.join(process.cwd(), 'fes-data');
  return path.join(path.dirname(app.getPath('exe')), 'fes-data');
}

function getStartFile() {
  return path.join(getAppFolder(), 'FESStart.js');
}

function getBundledBunDir() {
  return path.join(getAppFolder(), 'libraries');
}

function getBundledBunZip() {
  return path.join(getBundledBunDir(), 'bun-windows-x64.zip');
}

function getBundledBunPath() {
  return path.join(getBundledBunDir(), 'bun.exe');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (app.isPackaged) {
    mainWindow.setMenu(null);
  }

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  setTimeout(async () => {
    sendLog('Welcome to the FES Windows Launcher!');
    sendLog(`Using data folder: ${getAppFolder()}`);

    try {
      await checkBun();
    } catch (error) {
      sendLog(`Bun is not ready yet: ${error.message}`);
    }
  }, 300);
}

function sendLog(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('launcher-log', message);
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureAppFolder() {
  ensureDir(getAppFolder());
}

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    ensureDir(path.dirname(destination));
    const file = fs.createWriteStream(destination);

    const request = https.get(url, (response) => {
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        file.close(() => {
          fs.unlink(destination, () => {
            downloadFile(response.headers.location, destination)
              .then(resolve)
              .catch(reject);
          });
        });
        return;
      }

      if (response.statusCode !== 200) {
        file.close(() => {
          fs.unlink(destination, () => {
            reject(new Error(`Download failed with status ${response.statusCode}`));
          });
        });
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });

    request.on('error', (err) => {
      file.close(() => {
        fs.unlink(destination, () => reject(err));
      });
    });

    file.on('error', (err) => {
      file.close(() => {
        fs.unlink(destination, () => reject(err));
      });
    });
  });
}

function extractZip(zipPath, destinationDir) {
  return new Promise((resolve, reject) => {
    ensureDir(destinationDir);

    const args = [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      `Expand-Archive -Path "${zipPath}" -DestinationPath "${destinationDir}" -Force`
    ];

    execFile('powershell.exe', args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve();
    });
  });
}

function findFileRecursive(dir, targetName) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name.toLowerCase() === targetName.toLowerCase()) {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const result = findFileRecursive(fullPath, targetName);
      if (result) return result;
    }
  }

  return null;
}

async function ensureBundledBun() {
  const bunDir = getBundledBunDir();
  const bunExe = getBundledBunPath();
  const bunZip = getBundledBunZip();

  ensureDir(bunDir);

  if (fs.existsSync(bunExe)) {
    return bunExe;
  }

  sendLog('Bun was not found. Downloading Bun...');
  await downloadFile(BUN_DOWNLOAD_URL, bunZip);
  sendLog('Downloaded Bun archive.');

  const extractDir = path.join(bunDir, 'extract');
  sendLog('Extracting Bun...');
  await extractZip(bunZip, extractDir);

  const foundBun = findFileRecursive(extractDir, 'bun.exe');
  if (!foundBun) {
    throw new Error('bun.exe was not found after extraction.');
  }

  fs.copyFileSync(foundBun, bunExe);
  sendLog(`Bun is ready at: ${bunExe}`);

  try {
    fs.unlinkSync(bunZip);
  } catch {}

  try {
    fs.rmSync(extractDir, { recursive: true, force: true });
  } catch {}

  return bunExe;
}

async function checkBun() {
  const bunPath = await ensureBundledBun();

  return new Promise((resolve, reject) => {
    const test = spawn(bunPath, ['--version']);

    let stdout = '';
    let stderr = '';

    test.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    test.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    test.on('error', () => {
      reject(new Error('Bun could not be started.'));
    });

    test.on('close', (code) => {
      if (code === 0) {
        const version = stdout.trim();
        if (version) {
          sendLog(`Bun: ${version}`);
        }
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || 'Bun could not be started.'));
    });
  });
}

async function updateStartFile() {
  const startFile = getStartFile();
  ensureAppFolder();
  sendLog('Checking for latest FESStart.js...');
  await downloadFile(START_FILE_URL, startFile);
  sendLog('Downloaded latest FESStart.js');
}

function runFES() {
  return new Promise(async (resolve, reject) => {
    try {
      const appFolder = getAppFolder();
      const startFile = getStartFile();
      const bunPath = await ensureBundledBun();

      if (!fs.existsSync(startFile)) {
        reject(new Error('FESStart.js does not exist'));
        return;
      }

      if (runningProcess) {
        reject(new Error('FES is already running.'));
        return;
      }

      runningProcess = spawn(bunPath, [startFile], {
        cwd: appFolder,
        env: {
          ...process.env,
          BUN_PATH: bunPath,
          FORCE_COLOR: '3'
        }
      });

      runningProcess.stdout.on('data', (data) => {
        sendLog(data.toString());
      });

      runningProcess.stderr.on('data', (data) => {
        sendLog(data.toString());
      });

      runningProcess.on('close', (code) => {
        sendLog(`FES stopped with exit code ${code}`);
        runningProcess = null;
      });

      runningProcess.on('error', (err) => {
        runningProcess = null;
        reject(err);
      });

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

ipcMain.handle('launcher:update-and-run', async () => {
  try {
    await updateStartFile();
    await runFES();
    return { ok: true };
  } catch (error) {
    sendLog(`[FATAL] ${error.message}`);
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('launcher:stop', async () => {
  if (!runningProcess) return { ok: true };

  const pid = runningProcess.pid;
  return new Promise((resolve) => {
    exec(`taskkill /PID ${pid} /T /F`, (error) => {
      if (error) {
        sendLog(`[ERROR] Failed to stop FES: ${error.message}`);
        resolve({ ok: false, error: error.message });
        return;
      }

      runningProcess = null;
      resolve({ ok: true });
    });
  });
});

ipcMain.handle('launcher:open-folder', async () => {
  const appFolder = getAppFolder();
  ensureDir(appFolder);
  await shell.openPath(appFolder);
  return { ok: true };
});

ipcMain.handle('launcher:open-vscode', async (_, file) => {
  let filePath;

  if (path.isAbsolute(file)) {
    filePath = file;
  } else {
    filePath = path.join(getAppFolder(), file);
  }

  const proc = spawn('code', [filePath], { detached: true });

  proc.on('error', () => {
    spawn(
      `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe`,
      [filePath],
      { detached: true }
    );
  });

  return { ok: true };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});