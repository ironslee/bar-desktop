import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryItem } from '../../types/Category';
import { CurrentCount, ProductItem } from '../../types/Product';

interface MenuState {
  categories: CategoryItem[];
  products: ProductItem[];
  selectedCategory: CategoryItem | null;
  currentCounts: CurrentCount[];
}

const initialState: MenuState = {
  categories: [],
  products: [],
  selectedCategory: null,
  currentCounts: [],
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
    setCurrentCounts(state, action: PayloadAction<CurrentCount[]>) {
      state.currentCounts = action.payload;
    },
  },
});

export const { setCategories, setProducts, selectCategory } = menuSlice.actions;
export default menuSlice.reducer;
