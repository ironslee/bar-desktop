import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DiscountState {
  discount: number;
}

const initialState: DiscountState = {
  discount: 0,
};

export const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {
    setDiscount(state, action: PayloadAction<number>) {
      state.discount = action.payload;
    },

    addDiscountFromTableOrder(state, action: PayloadAction<number>) {
      state.discount = action.payload;
    },

    clearDiscount(state) {
      state.discount = 0;
    },
  },
});

export const { setDiscount, addDiscountFromTableOrder, clearDiscount } =
  discountSlice.actions;
export default discountSlice.reducer;
