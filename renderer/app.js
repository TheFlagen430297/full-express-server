const log = document.getElementById('log');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const openFolderBtn = document.getElementById('openFolderBtn');
const openVSCodeBtn = document.getElementById('openVSCodeBtn');

function cleanMessage(message) {
  if (typeof message !== 'string') return '';
  return message.replace(/\x1B\[2J/g, '').replace(/\x1B\[3J/g, '').replace(/\x1B\[H/g, '');
}

function addLog(message) {
  if (typeof message !== 'string') return;
  if (message.includes('\x1b[2J') || message.includes('\x1B[2J')) log.innerHTML = '';

  const cleaned = cleanMessage(message).trimEnd();

  if (!cleaned) return;
  const line = document.createElement('div');

  try {
    if (window.fesLauncher && window.fesLauncher.ansiToHtml) line.innerHTML = window.fesLauncher.ansiToHtml(cleaned);
    else  line.textContent = cleaned;
  } catch (err) {
    line.textContent = cleaned;
  }

  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

if (window.fesLauncher && window.fesLauncher.onLog) window.fesLauncher.onLog(addLog);
else  addLog('[FATAL] launcher bridge not available, is the launcher actually lauched?');

startBtn.addEventListener('click', async () => {
  const result = await window.fesLauncher.start();
  if (!result.ok) addLog(`Launch failed: ${result.error}`);
});

stopBtn.addEventListener('click', async () => { await window.fesLauncher.stop(); });
openVSCodeBtn.addEventListener('click', async () => { await window.fesLauncher.openVSCode(`./src`) });