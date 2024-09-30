import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableItem, TableStatus } from '../../types/Table';

interface TablesState {
  tables: TableItem[];
  selectedTable: TableItem | null;
}

const initialState: TablesState = {
  tables: [],
  selectedTable: null,
};

export const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setTables(state, action: PayloadAction<TableItem[]>) {
      state.tables = action.payload;
    },
    selectTable(state, action: PayloadAction<number>) {
      const tableId = action.payload;
      state.selectedTable =
        state.tables.find((table) => table.id === tableId) || null;
    },
  },
});

export const { setTables, selectTable } = tablesSlice.actions;
export default tablesSlice.reducer;
