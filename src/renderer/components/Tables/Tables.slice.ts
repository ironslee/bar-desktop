import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableItem, TableStatus } from '../../types/Table';
import { OrderItem } from '../../types/Order';
import { ClientItem } from '../../types/Client';
import { UserItem } from '../../types/User';
import { DiscountItem } from '../../types/Discount';

// interface OrderItemPrinted extends OrderItem {
//   printedQuantity?: number;
// }

interface TableOrder {
  tableId: number;
  checkNumber?: number;
  orderItems?: OrderItem[];
  orderDiscount: DiscountItem | null;
  orderClient?: ClientItem | null;
  orderUser?: UserItem;
}

interface TablesState {
  tables: TableItem[];
  selectedTable: TableItem | null;
  tableOrders: TableOrder[];
}

const initialState: TablesState = {
  tables: [],
  selectedTable: null,
  tableOrders: [],
};

export const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setTables(state, action: PayloadAction<TableItem[]>) {
      state.tables = action.payload;
    },
    // selectTable(state, action: PayloadAction<number>) {
    //   const tableId = action.payload;
    //   state.selectedTable =
    //     state.tables.find((table) => table.id === tableId) || null;
    // },
    selectTable(state, action: PayloadAction<number>) {
      const tableId = action.payload;
      const selectedTable = state.tables.find((table) => table.id === tableId);
      const selectedTableOrder = state.tableOrders.find(
        (table) => table.tableId === tableId,
      );

      if (selectedTable && !selectedTableOrder) {
        state.tableOrders.push({
          tableId: selectedTable.id,
          orderDiscount: null,
          // orderUser: undefined,
        });
      }

      state.selectedTable = selectedTable || null;
    },

    syncTableOrder(
      state,
      action: PayloadAction<{
        tableId: number;
        orderItems: OrderItem[];
        orderUser: UserItem;
        orderClient: ClientItem | null;
        orderDiscount: DiscountItem | null;
        checkNumber?: number;
      }>,
    ) {
      const {
        tableId,
        orderItems,
        orderClient,
        orderDiscount,
        orderUser,
        checkNumber,
      } = action.payload;

      // Поиск заказа для стола
      let tableOrder = state.tableOrders.find(
        (order) => order.tableId === tableId,
      );

      if (!tableOrder) {
        tableOrder = {
          tableId,
          orderItems: [],
          orderDiscount: null,
          orderClient: null,
          orderUser,
          checkNumber: undefined,
        };
        state.tableOrders.push(tableOrder); // Добавляем новый заказ в tableOrders
      }

      if (tableOrder) {
        // if (
        //   tableOrder.orderUser !== undefined ||
        //   tableOrder.orderUser !== null
        // ) {
        //   tableOrder.orderUser = orderUser;
        // }

        // if (
        //   tableOrder.orderUser === undefined ||
        //   tableOrder.orderUser === null
        // ) {
        //   tableOrder.orderUser = undefined;
        // } else {
        //   tableOrder.orderUser = orderUser;
        // }

        if (
          tableOrder.orderClient === undefined ||
          tableOrder.orderClient === null
        ) {
          tableOrder.orderClient = null; // Сбрасываем клиента
        } else {
          tableOrder.orderClient = orderClient; // Устанавливаем нового клиента
        }

        if (
          tableOrder.orderDiscount === undefined ||
          tableOrder.orderDiscount === null
        ) {
          tableOrder.orderDiscount = null;
        } else {
          tableOrder.orderDiscount = orderDiscount;
        }

        tableOrder.orderItems = orderItems.map((newItem) => {
          const existingItem = tableOrder.orderItems?.find(
            (item) => item.product.id === newItem.product.id,
          );
          return {
            ...newItem,
            // printedQuantity: existingItem ? existingItem.printedQuantity : 0,
            printedQuantity: existingItem
              ? existingItem.printedQuantity
              : (newItem.printedQuantity ?? 0),
          };
        });

        // tableOrder.orderDiscount = orderDiscount;
        // tableOrder.orderClient = orderClient;
        // if (orderUser !== undefined || orderUser !== null) {
        //   tableOrder.orderUser = orderUser;
        // }

        if (orderClient !== undefined || orderClient !== null) {
          tableOrder.orderClient = orderClient;
        }

        if (orderDiscount !== undefined || orderDiscount !== null) {
          tableOrder.orderDiscount = orderDiscount;
        }

        tableOrder.orderUser = orderUser;

        if (checkNumber !== undefined) {
          tableOrder.checkNumber = checkNumber;
        }
      }
    },

    savePrintedItems(
      state,
      action: PayloadAction<{
        tableId: number;
        printedItems: OrderItem[];
      }>,
    ) {
      const { tableId, printedItems } = action.payload;
      const tableOrder = state.tableOrders.find(
        (order) => order.tableId === tableId,
      );

      if (tableOrder) {
        printedItems.forEach((printedItem) => {
          const existingItem = tableOrder.orderItems?.find(
            (item) => item.product.id === printedItem.product.id,
          );
          if (
            existingItem &&
            printedItem.quantity > existingItem.printedQuantity
          ) {
            // Увеличиваем только на количество, которое еще не было отправлено на печать
            const notPrintedQuantity =
              printedItem.quantity - existingItem.printedQuantity;
            existingItem.printedQuantity += notPrintedQuantity;
          }
        });
      }
    },
  },
});

export const { setTables, selectTable, syncTableOrder, savePrintedItems } =
  tablesSlice.actions;
export default tablesSlice.reducer;
