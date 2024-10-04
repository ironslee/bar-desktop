import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableItem, TableStatus } from '../../types/Table';
import { OrderItem } from '../../types/Order';
import { ClientItem } from '../../types/Client';

interface TableOrder {
  tableId: number;
  checkNumber?: number;
  orderItems?: OrderItem[];
  orderDiscount?: number;
  orderClient?: ClientItem | null;
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
        // Генерация номера чека
        const newOrderId = Math.floor(Math.random() * 1000);
        state.tableOrders.push({
          tableId: selectedTable.id,
          checkNumber: newOrderId,
        });
      }

      state.selectedTable = selectedTable || null;
    },

    syncTableOrder(
      state,
      action: PayloadAction<{
        tableId: number;
        orderItems: OrderItem[];
        orderClient?: ClientItem;
        orderDiscount: number;
      }>,
    ) {
      const { tableId, orderItems, orderClient, orderDiscount } =
        action.payload;

      // Поиск заказа для стола
      const tableOrder = state.tableOrders.find(
        (order) => order.tableId === tableId,
      );
      // Привязка товаров из заказа к столу
      if (tableOrder) {
        tableOrder.orderItems = orderItems;
        tableOrder.orderDiscount = orderDiscount;
        tableOrder.orderClient = orderClient;
      }
    },
  },
});

export const { setTables, selectTable, syncTableOrder } = tablesSlice.actions;
export default tablesSlice.reducer;
