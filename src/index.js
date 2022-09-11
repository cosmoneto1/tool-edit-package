const { ipcRenderer, clipboard } = require('electron');
const button = document.getElementById('btn');
const buttonCopia = document.getElementById('btnCopia');
const txtArea = document.getElementById('txtArea');

ipcRenderer.on('template', (event, arg) => {
  if (arg) {
    txtArea.value = arg;
  }
});

button.addEventListener('click', () => {
  ipcRenderer.send('lerArquivoJson', 'dd');
});

buttonCopia.addEventListener('click', () => {
  txtArea.select();
  let txt = txtArea.value;
  clipboard.writeText(txt);
});
