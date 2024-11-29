import { configureStore } from '@reduxjs/toolkit';
import { loadingReducer } from '../../../components/Loader';
import { tablesReducer } from '../../../components/Tables';
import { usersReducer } from '../../../components/Users';
import { menuReducer } from '../../../components/Menu';
import { orderReducer } from '../../../components/Order';
import { clientsReducer } from '../../../components/Clients';
import { discountReducer } from '../../../components/Discount';
import { uploadReducer } from '../../../pages/Upload';

export const store = configureStore({
  reducer: {
    loadingStore: loadingReducer,
    tablesStore: tablesReducer,
    usersStore: usersReducer,
    menuStore: menuReducer,
    orderStore: orderReducer,
    clientsStore: clientsReducer,
    discountStore: discountReducer,
    uploadStore: uploadReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
