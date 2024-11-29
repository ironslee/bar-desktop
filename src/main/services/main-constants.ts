export const TABLES_GET = 'tables:get';
export const TABLES_IMPORT = 'tables:import';

export const USERS_GET = 'users:get';
export const USERS_GET_BY_ID = 'users:getById';
export const USERS_UPDATE_OPEN_ORDER = 'users:updateOpenOrder';

export const MENU_GET_CATEGORIES = 'menu:getCategories';
export const MENU_GET_PRODUCTS_BY_CATEGORY = 'menu:getProductsByCategory';
export const MENU_GET_ALL_PRODUCTS = 'menu:getAllProducts';
export const MENU_GET_PRODUCT_BY_ID = 'menu:getProductById';
export const MENU_IMPORT_CATEGORIES = 'menu:importCategories';
export const MENU_IMPORT_PRODUCTS = 'menu:importProducts';

export const CLIENTS_GET = 'clients:get';
export const CLIENTS_GET_BY_ID = 'clients:getById';
export const CLIENTS_UPDATE_OPEN_ORDER = 'clients:updateOpenOrder';
export const CLIENTS_IMPORT = 'clients:import';

export const DISCOUNT_GET = 'discount:get';
export const DISCOUNT_GET_ORDER_DISCOUNT = 'discount:getOrderDiscount';
export const DISCOUNT_GET_BY_ID = 'discount:getById';
export const DISCOUNT_UPDATE_OPEN_ORDER = 'discount:updateOpenOrder';
export const DISCOUNT_IMPORT = 'discount:import';

export const PRINT_KITCHEN_TICKET = 'print:kitchenTicket';
export const PRINT_CHECK = 'print:check';

export const ORDER_SAVE = 'order:saveOrder';
export const ORDER_CLOSE = 'order:closeOrder';
export const ORDER_GET_OPEN = 'order:getOpenOrders';
export const ORDERS_UPLOAD = 'orders:upload';
export const ORDERS_SET_UPLOADED = 'orders:setUploaded';

export const OPEN_ROUTE = 'openRoute';
// export const PRINT_RECEIPT = 'print:receipt';
// export const APP_ID = 'app:id';

export const apiUrl =
  process?.env?.NODE_ENV === 'development'
    ? 'http://91.147.93.105:8000'
    : 'http://91.147.93.105:8000';
