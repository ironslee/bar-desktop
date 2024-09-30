import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserItem } from '../../types/User';
import { ClientItem } from '../../types/Client';

interface ClientsState {
  clients: ClientItem[];
  selectedClient: ClientItem | null;
}

const initialState: ClientsState = {
  clients: [],
  selectedClient: null,
};

export const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients(state, action: PayloadAction<ClientItem[]>) {
      state.clients = action.payload;
    },
    selectClient(state, action: PayloadAction<number>) {
      const clientId = action.payload;
      state.selectedClient =
        state.clients.find((client) => client.id === clientId) || null;
    },
  },
});

export const { setClients, selectClient } = clientsSlice.actions;
export default clientsSlice.reducer;
