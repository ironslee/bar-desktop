import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductItem } from '../../types/Product';
import { OrderItem } from '../../types/Order';
import { RootState } from '../../app/providers/StoreProvider';

interface OrderState {
  items: OrderItem[];
  totalAmount: number;
  orderId: number | null;
}

const initialState: OrderState = {
  items: [],
  totalAmount: 0,
  orderId: null,
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderId(state, action: PayloadAction<number>) {
      state.orderId = action.payload;
    },

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
          printedQuantity: 0,
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

    addItemsFromTableOrder(state, action: PayloadAction<OrderItem[]>) {
      state.items = action.payload;
      state.totalAmount = action.payload.reduce(
        (total, item) => total + item.totalPrice,
        0,
      );
    },

    updatePrintedQuantity(
      state,
      action: PayloadAction<{ productId: number; printedQuantity: number }>,
    ) {
      const { productId, printedQuantity } = action.payload;
      const productItem = state.items.find(
        (item) => item.product.id === productId,
      );

      if (productItem) {
        productItem.printedQuantity = printedQuantity;
      }
    },
  },
});

export const {
  setOrderId,
  addItemToOrder,
  removeItemFromOrder,
  deleteItemFromOrder,
  clearOrder,

  addItemsFromTableOrder,
  updatePrintedQuantity,
} = orderSlice.actions;

export default orderSlice.reducer;
