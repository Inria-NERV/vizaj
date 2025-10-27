import { guiParams } from './setup_gui.js';

export function exportParamsToFile() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(guiParams, null, 2));
  const downloadAnchorNode = document.createElement('a');
  const fileName = `Vizaj_Configuration_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
