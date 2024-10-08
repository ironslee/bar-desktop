import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserItem } from '../../types/User';

interface UsersState {
  users: UserItem[];
  selectedUser: UserItem | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<UserItem[]>) {
      state.users = action.payload;
    },

    selectUser(state, action: PayloadAction<number>) {
      const userId = action.payload;
      state.selectedUser =
        state.users.find((user) => user.id === userId) || null;
    },

    addUserFromTableOrder(state, action: PayloadAction<UserItem>) {
      state.selectedUser = action.payload;
    },

    clearUser(state) {
      state.selectedUser = null;
    },
  },
});

export const { setUsers, selectUser, addUserFromTableOrder, clearUser } =
  usersSlice.actions;
export default usersSlice.reducer;
