import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryItem } from '../../types/Category';
import { ProductItem } from '../../types/Product';

interface MenuState {
  categories: CategoryItem[];
  products: ProductItem[];
  selectedCategory: CategoryItem | null;
}

const initialState: MenuState = {
  categories: [],
  products: [],
  selectedCategory: null,
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<CategoryItem[]>) {
      state.categories = action.payload;
    },
    setProducts(state, action: PayloadAction<ProductItem[]>) {
      state.products = action.payload;
    },
    selectCategory(state, action: PayloadAction<number | null>) {
      const categoryId = action.payload;
      state.selectedCategory =
        state.categories.find((category) => category.id === categoryId) || null;
    },
  },
});

export const { setCategories, setProducts, selectCategory } = menuSlice.actions;
export default menuSlice.reducer;
