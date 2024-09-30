import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductItem } from '../../types/Product';
import { OrderItem } from '../../types/Order';

interface OrderState {
  items: OrderItem[];
  totalAmount: number;
}

const initialState: OrderState = {
  items: [],
  totalAmount: 0,
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addItemToOrder(state, action: PayloadAction<ProductItem>) {
      const product = action.payload;
      const productItem = state.items.find(
        (item) => item.product.id === product.id,
      );

      if (productItem) {
        productItem.quantity += 1;
        productItem.totalPrice = productItem.quantity * product.retprice;
      } else {
        state.items.push({
          product,
          quantity: 1,
          totalPrice: product.retprice,
        });
      }
      state.totalAmount += product.retprice;
    },

    removeItemFromOrder(state, action: PayloadAction<number>) {
      const productId = action.payload;
      const productItem = state.items.find(
        (item) => item.product.id === productId,
      );

      if (productItem) {
        state.totalAmount -= productItem.product.retprice;
        if (productItem.quantity === 1) {
          state.items = state.items.filter(
            (item) => item.product.id !== productId,
          );
        } else {
          productItem.quantity -= 1;
          productItem.totalPrice =
            productItem.quantity * productItem.product.retprice;
        }
      }
    },

    deleteItemFromOrder(state, action: PayloadAction<number>) {
      const productId = action.payload;
      const productItem = state.items.find(
        (item) => item.product.id === productId,
      );

      if (productItem) {
        state.totalAmount -= productItem.totalPrice;
        state.items = state.items.filter(
          (item) => item.product.id !== productId,
        );
      }
    },

    clearOrder(state) {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const {
  addItemToOrder,
  removeItemFromOrder,
  deleteItemFromOrder,
  clearOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
