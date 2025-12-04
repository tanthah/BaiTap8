// Fontend/src/store.js - CẬP NHẬT
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/authSlice';
import wishlistReducer from './redux/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
  },
});