import { ipcRenderer } from 'electron';
import { OPEN_ROUTE } from './main-constants';

export const openRoute = (route: string) => {
  ipcRenderer.send(OPEN_ROUTE, route);
};
