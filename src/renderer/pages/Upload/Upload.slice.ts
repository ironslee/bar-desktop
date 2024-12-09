import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Tokens } from '../../types/User';

// Define a type for the slice state
interface UploadState {
  tokens: Tokens;
}

// Define the initial state using that type
const initialState: UploadState = {
  tokens: {
    access_token: '',
    token_type: '',
  },
};

export const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setTokens: (state, data: PayloadAction<Tokens>) => {
      state.tokens = data.payload;
    },
    clearStore: (state) => {
      state = initialState;
    },
  },
});

export const { clearStore, setTokens } = uploadSlice.actions;

export default uploadSlice.reducer;
