import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DiscountItem } from '../../types/Discount';

interface DiscountState {
  discount: number;
  discount_items: DiscountItem[];
  selectedDiscount: DiscountItem | null;
}

const initialState: DiscountState = {
  discount: 0,
  discount_items: [],
  selectedDiscount: null,
};

export const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {
    setDiscount(state, action: PayloadAction<number>) {
      state.discount = action.payload;
    },
    setDiscountItems(state, action: PayloadAction<DiscountItem[]>) {
      state.discount_items = action.payload;
    },

    selectDiscount(state, action: PayloadAction<number | null>) {
      const discId = action.payload;
      const selectedDiscount = state.discount_items.find(
        (disc) => disc.id === discId,
      );
      state.selectedDiscount = selectedDiscount ?? null;
    },

    selectDiscountFromDb(state, action: PayloadAction<DiscountItem | null>) {
      state.selectedDiscount = action.payload;
    },

    addDiscountFromTableOrder(
      state,
      action: PayloadAction<DiscountItem | null>,
    ) {
      state.selectedDiscount = action.payload;
    },

    clearDiscount(state) {
      state.selectedDiscount = null;
    },
  },
});

export const {
  setDiscount,
  addDiscountFromTableOrder,
  clearDiscount,
  selectDiscount,
  setDiscountItems,
  selectDiscountFromDb,
} = discountSlice.actions;
export default discountSlice.reducer;
