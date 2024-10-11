// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import {
  CLIENTS_GET,
  MENU_GET_ALL_PRODUCTS,
  MENU_GET_CATEGORIES,
  MENU_GET_PRODUCTS_BY_CATEGORY,
  OPEN_ROUTE,
  PRINT_CHECK,
  PRINT_KITCHEN_TICKET,
  TABLES_GET,
  USERS_GET,
} from './services/main-constants';
import { getClients } from './services/clients.service';
import { getAllProducts } from './services/menu.service';
import { KitchenTicket, PreCheck } from '../renderer/types/Print';
import { printCheck, printKitchenTicket } from './services/print.service';

// export type Channels = 'ipc-example' | 'open-route';
export type Channels = typeof OPEN_ROUTE;

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  getTables: () => ipcRenderer.invoke(TABLES_GET),
  getUsers: () => ipcRenderer.invoke(USERS_GET),
  getCategories: () => ipcRenderer.invoke(MENU_GET_CATEGORIES),
  getProductsByCategory: (categoryId: number) =>
    ipcRenderer.invoke(MENU_GET_PRODUCTS_BY_CATEGORY, categoryId),
  getAllProducts: () => ipcRenderer.invoke(MENU_GET_ALL_PRODUCTS),
  getClients: () => ipcRenderer.invoke(CLIENTS_GET),
  printKitchenTicket: (kitchenTicket: KitchenTicket): Promise<boolean> =>
    ipcRenderer.invoke(PRINT_KITCHEN_TICKET, kitchenTicket),
  printCheck: (orderCheck: PreCheck): Promise<boolean> =>
    ipcRenderer.invoke(PRINT_CHECK, orderCheck),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
