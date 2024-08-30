import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Define a type for the slice state
interface LoadingState {
  isLoading: boolean;
}

// Define the initial state using that type
const initialState: LoadingState = {
  isLoading: false,
};

export const loadingSlice = createSlice({
  name: 'loading',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setLoading: (state, data: PayloadAction<boolean>) => {
      state.isLoading = data.payload;
    },
    clearStore: (state) => {
      state = initialState;
    },
  },
});

export const { setLoading, clearStore } = loadingSlice.actions;

export default loadingSlice.reducer;
