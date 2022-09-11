const { app, BrowserWindow, ipcMain, dialog, clipboard } = require('electron');
const fs = require('fs');
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    },
  });
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadFile('./src/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('lerArquivoJson', async (event, mensagem) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
  if (!canceled) {
    lerAqruivo(filePaths[0]);
  }
});

const lerAqruivo = (ar) => {
  fs.readFile(ar, (err, data) => {
    if (err) throw err;

    const dadosJson = JSON.parse(data);

    if (dadosJson) {
      const temp = montarTemplate(dadosJson);
      clipboard.writeText(temp);
      mainWindow.webContents.send('template', temp);
    }
  });
};

const montarTemplate = (dados) => {
  let deps = '';
  let depsDev = '';
  if (dados.dependencies) {
    const list = Object.keys(dados.dependencies);
    deps = list
      .map((it) => {
        const txt = `\n- ${it} [npm](https://www.npmjs.com/package/${it})`;
        return txt;
      })
      .join('');
  }

  if (dados.devDependencies) {
    const listDev = Object.keys(dados.devDependencies);
    depsDev = listDev
      .map((it) => {
        const txt = `\n- ${it} [npm](https://www.npmjs.com/package/${it})`;
        return txt;
      })
      .join('');
  }

  let template = `# ${dados.name || 'Projeto'} 
  \n${dados.description || 'Descrição do projeto'}
  \n### Tecnologias utilizadas no projeto;
  \n- NodeJs [Site](https://nodejs.org/en/)${deps}${depsDev}
  \n### Start do projeto
  \n\`\`\`shell 
  \nnpm install && npm start
  \n\`\`\`
  \n### Imagens
  \n![Screenshot](cli-tool-manga.png)`;
  return template;
};
