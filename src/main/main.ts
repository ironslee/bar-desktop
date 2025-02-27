/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { getTables, importTables } from './services/tables.service';
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
  MENU_ADD_PRODUCT_TO_CURRENT_COUNT,
  MENU_CLEAR_TEMPORARY_COUNTS,
  MENU_CLOSE_ORDER_IN_CURRENT_COUNT,
  MENU_DECREASE_PRODUCT_IN_CURRENT_COUNT,
  MENU_DELETE_PRODUCT_FROM_CURRENT_COUNT,
  MENU_GET_ALL_PRODUCTS,
  MENU_GET_CATEGORIES,
  MENU_GET_CURRENT_COUNTS,
  MENU_GET_PRODUCT_BY_ID,
  MENU_GET_PRODUCTS_BY_CATEGORY,
  MENU_IMPORT_CATEGORIES,
  MENU_IMPORT_PRODUCTS,
  MENU_RECALCULATE_STOCK,
  MENU_UPDATE_ORDER_ID_IN_CURRENT_COUNT,
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
import { openRoute } from './services/route.service';
import {
  getUserById,
  getUsers,
  importUsers,
  updateOpenOrderUser,
} from './services/users.service';
import {
  addProductToCurrentCount,
  clearTemporaryCounts,
  closeOrderInCurrentCount,
  decreaseProductInCurrentCount,
  deleteProductFromCurrentCount,
  getAllProducts,
  getCategories,
  getCurrentCounts,
  getProductById,
  getProductsByCategory,
  importCategories,
  importProducts,
  recalculateStock,
  updateOrderIdInCurrentCount,
} from './services/menu.service';
import {
  getClientById,
  getClients,
  importClients,
  updateOpenOrderClient,
} from './services/clients.service';
import { KitchenTicket, PreCheck } from '../renderer/types/Print';
import { printCheck, printKitchenTicket } from './services/print.service';
import { CloseOrderData, SaveOrderData } from '../renderer/types/Order';
import {
  closeOrder,
  getOpenOrders,
  getOrdersToUpload,
  saveOrder,
  setUploadedOrderById,
  setUploadedOrders,
} from './services/order.service';
import {
  getDiscount,
  getDiscountById,
  getDiscountByOrderId,
  importDiscount,
  updateOpenOrderDiscount,
} from './services/discount.service';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    // Tables
    ipcMain.handle(TABLES_GET, async () => {
      return getTables();
    });
    ipcMain.handle(TABLES_IMPORT, async (_) => {
      return importTables();
    });

    // Users
    ipcMain.handle(USERS_GET, async () => {
      return getUsers();
    });
    ipcMain.handle(USERS_GET_BY_ID, async (_, userId: number) => {
      return getUserById(userId);
    });
    ipcMain.handle(
      USERS_UPDATE_OPEN_ORDER,
      async (_, userId: number, orderNumber: number) => {
        return updateOpenOrderUser(userId, orderNumber);
      },
    );
    ipcMain.handle(USERS_IMPORT, async (_) => {
      return importUsers();
    });

    // Menu
    ipcMain.handle(MENU_GET_CATEGORIES, async () => {
      return getCategories();
    });
    ipcMain.handle(
      MENU_GET_PRODUCTS_BY_CATEGORY,
      async (_, category_id: number) => {
        return getProductsByCategory(category_id);
      },
    );
    ipcMain.handle(MENU_GET_ALL_PRODUCTS, async () => {
      return getAllProducts();
    });
    ipcMain.handle(MENU_GET_PRODUCT_BY_ID, async (_, id: number) => {
      return getProductById(id);
    });
    ipcMain.handle(MENU_IMPORT_CATEGORIES, async (_) => {
      return importCategories();
    });
    ipcMain.handle(MENU_IMPORT_PRODUCTS, async (_) => {
      return importProducts();
    });
    ipcMain.handle(
      MENU_ADD_PRODUCT_TO_CURRENT_COUNT,
      async (_, productId: number, tableId: number, orderId?: number) => {
        return addProductToCurrentCount(productId, tableId, orderId);
      },
    );
    ipcMain.handle(
      MENU_UPDATE_ORDER_ID_IN_CURRENT_COUNT,
      async (_, tableId: number, orderId: number) => {
        return updateOrderIdInCurrentCount(tableId, orderId);
      },
    );
    ipcMain.handle(
      MENU_DECREASE_PRODUCT_IN_CURRENT_COUNT,
      async (_, productId: number, tableId: number, orderId?: number) => {
        return decreaseProductInCurrentCount(productId, tableId, orderId);
      },
    );
    ipcMain.handle(
      MENU_DELETE_PRODUCT_FROM_CURRENT_COUNT,
      async (_, productId: number, tableId: number, orderId?: number) => {
        return deleteProductFromCurrentCount(productId, tableId, orderId);
      },
    );
    ipcMain.handle(MENU_RECALCULATE_STOCK, async (_) => {
      return recalculateStock();
    });
    ipcMain.handle(
      MENU_CLOSE_ORDER_IN_CURRENT_COUNT,
      async (_, orderId: number, tableId: number) => {
        return closeOrderInCurrentCount(orderId, tableId);
      },
    );
    ipcMain.handle(MENU_GET_CURRENT_COUNTS, async (_) => {
      return getCurrentCounts();
    });
    ipcMain.handle(MENU_CLEAR_TEMPORARY_COUNTS, async (_) => {
      return clearTemporaryCounts();
    });

    // Clients
    ipcMain.handle(CLIENTS_GET, async () => {
      return getClients();
    });
    ipcMain.handle(CLIENTS_GET_BY_ID, async (_, clientId: number) => {
      return getClientById(clientId);
    });
    ipcMain.handle(
      CLIENTS_UPDATE_OPEN_ORDER,
      async (_, clientId: number, orderNumber: number) => {
        return updateOpenOrderClient(clientId, orderNumber);
      },
    );
    ipcMain.handle(CLIENTS_IMPORT, async (_) => {
      return importClients();
    });

    // Discount
    ipcMain.handle(DISCOUNT_GET, async () => {
      return getDiscount();
    });
    ipcMain.handle(DISCOUNT_GET_ORDER_DISCOUNT, async (_, number: number) => {
      return getDiscountByOrderId(number);
    });
    ipcMain.handle(DISCOUNT_GET_BY_ID, async (_, id: number) => {
      return getDiscountById(id);
    });
    ipcMain.handle(
      DISCOUNT_UPDATE_OPEN_ORDER,
      async (_, discountId: number | null, orderNumber: number) => {
        return updateOpenOrderDiscount(discountId, orderNumber);
      },
    );
    ipcMain.handle(DISCOUNT_IMPORT, async (_) => {
      return importDiscount();
    });

    //Order methods
    ipcMain.handle(ORDER_SAVE, async (_, data: SaveOrderData) => {
      return saveOrder(data);
    });
    ipcMain.handle(ORDER_GET_OPEN, async () => {
      return getOpenOrders();
    });
    ipcMain.handle(ORDER_CLOSE, async (_, data: SaveOrderData) => {
      return closeOrder(data);
    });
    ipcMain.handle(ORDERS_UPLOAD, async (_) => {
      return getOrdersToUpload();
    });
    ipcMain.handle(ORDERS_SET_UPLOADED, async (_) => {
      return setUploadedOrders();
    });
    ipcMain.handle(ORDERS_SET_UPLOADED_BY_ID, async (_, orderId: number) => {
      return setUploadedOrderById(orderId);
    });

    // Menu methods
    ipcMain.on(OPEN_ROUTE, (_, route: string) => {
      return openRoute(route);
    });

    // Print methods
    ipcMain.handle(
      PRINT_KITCHEN_TICKET,
      (_, kitchenTicket: KitchenTicket): Promise<boolean> => {
        return printKitchenTicket(kitchenTicket);
      },
    );

    ipcMain.handle(PRINT_CHECK, (_, orderCheck: PreCheck): Promise<boolean> => {
      return printCheck(orderCheck);
    });

    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
