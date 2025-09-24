import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  isAuthenticated: boolean;
  user?: { id: string; name: string } | null;
  // token?: string;
};

const initialState: AuthState = {
  isAuthenticated: true, // set false once you wire real auth
  user: { id: '1', name: 'Admin' }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<{ name: string }>) => {
      state.isAuthenticated = true;
      state.user = { id: '1', name: action.payload.name };
    },
    signOut: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    }
  }
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
