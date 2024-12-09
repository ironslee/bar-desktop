// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import {
  CLIENTS_GET,
  CLIENTS_GET_BY_ID,
  CLIENTS_IMPORT,
  CLIENTS_UPDATE_OPEN_ORDER,
  DISCOUNT_GET,
  DISCOUNT_GET_BY_ID,
  DISCOUNT_GET_ORDER_DISCOUNT,
  DISCOUNT_IMPORT,
  DISCOUNT_UPDATE_OPEN_ORDER,
  MENU_GET_ALL_PRODUCTS,
  MENU_GET_CATEGORIES,
  MENU_GET_PRODUCT_BY_ID,
  MENU_GET_PRODUCTS_BY_CATEGORY,
  MENU_IMPORT_CATEGORIES,
  MENU_IMPORT_PRODUCTS,
  OPEN_ROUTE,
  ORDER_CLOSE,
  ORDER_GET_OPEN,
  ORDER_SAVE,
  ORDERS_SET_UPLOADED,
  ORDERS_SET_UPLOADED_BY_ID,
  ORDERS_UPLOAD,
  PRINT_CHECK,
  PRINT_KITCHEN_TICKET,
  TABLES_GET,
  TABLES_IMPORT,
  USERS_GET,
  USERS_GET_BY_ID,
  USERS_IMPORT,
  USERS_UPDATE_OPEN_ORDER,
} from './services/main-constants';
import {
  getClientById,
  getClients,
  updateOpenOrderClient,
} from './services/clients.service';
import {
  getAllProducts,
  importCategories,
  importProducts,
} from './services/menu.service';
import { KitchenTicket, PreCheck } from '../renderer/types/Print';
import { printCheck, printKitchenTicket } from './services/print.service';
import { CloseOrderData, SaveOrderData } from '../renderer/types/Order';
import { saveOrder, setUploadedOrderById } from './services/order.service';
import {
  getUserById,
  importUsers,
  updateOpenOrderUser,
} from './services/users.service';
import {
  getDiscount,
  getDiscountById,
  getDiscountByOrderId,
  importDiscount,
  updateOpenOrderDiscount,
} from './services/discount.service';
import { importTables } from './services/tables.service';

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
  importTables: () => ipcRenderer.invoke(TABLES_IMPORT),
  getUsers: () => ipcRenderer.invoke(USERS_GET),
  getUserById: (userId: number) => ipcRenderer.invoke(USERS_GET_BY_ID, userId),
  updateOpenOrderUser: (userId: number, orderNumber: number) =>
    ipcRenderer.invoke(USERS_UPDATE_OPEN_ORDER, userId, orderNumber),
  importUsers: () => ipcRenderer.invoke(USERS_IMPORT),
  getCategories: () => ipcRenderer.invoke(MENU_GET_CATEGORIES),
  getProductsByCategory: (category_id: number) =>
    ipcRenderer.invoke(MENU_GET_PRODUCTS_BY_CATEGORY, category_id),
  importCategories: () => ipcRenderer.invoke(MENU_IMPORT_CATEGORIES),
  importProducts: () => ipcRenderer.invoke(MENU_IMPORT_PRODUCTS),
  getAllProducts: () => ipcRenderer.invoke(MENU_GET_ALL_PRODUCTS),
  getProductById: (id: number) =>
    ipcRenderer.invoke(MENU_GET_PRODUCT_BY_ID, id),
  getClients: () => ipcRenderer.invoke(CLIENTS_GET),
  getClientById: (clientId: number) =>
    ipcRenderer.invoke(CLIENTS_GET_BY_ID, clientId),
  updateOpenOrderClient: (clientId: number, orderNumber: number) =>
    ipcRenderer.invoke(CLIENTS_UPDATE_OPEN_ORDER, clientId, orderNumber),
  importClients: () => ipcRenderer.invoke(CLIENTS_IMPORT),
  getDiscount: () => ipcRenderer.invoke(DISCOUNT_GET),
  getDiscountByOrderId: (number: number) =>
    ipcRenderer.invoke(DISCOUNT_GET_ORDER_DISCOUNT, number),
  getDiscountById: (id: number) => ipcRenderer.invoke(DISCOUNT_GET_BY_ID, id),
  updateOpenOrderDiscount: (discountId: number | null, orderNumber: number) =>
    ipcRenderer.invoke(DISCOUNT_UPDATE_OPEN_ORDER, discountId, orderNumber),
  importDiscount: () => ipcRenderer.invoke(DISCOUNT_IMPORT),
  saveOrder: (data: SaveOrderData) => ipcRenderer.invoke(ORDER_SAVE, data),
  closeOrder: (data: SaveOrderData) => ipcRenderer.invoke(ORDER_CLOSE, data),
  getOpenOrders: () => ipcRenderer.invoke(ORDER_GET_OPEN),
  getOrdersToUpload: () => ipcRenderer.invoke(ORDERS_UPLOAD),
  setUploadedOrders: () => ipcRenderer.invoke(ORDERS_SET_UPLOADED),
  setUploadedOrderById: (orderId: number) =>
    ipcRenderer.invoke(ORDERS_SET_UPLOADED_BY_ID, orderId),
  printKitchenTicket: (kitchenTicket: KitchenTicket): Promise<boolean> =>
    ipcRenderer.invoke(PRINT_KITCHEN_TICKET, kitchenTicket),
  printCheck: (orderCheck: PreCheck): Promise<boolean> =>
    ipcRenderer.invoke(PRINT_CHECK, orderCheck),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
