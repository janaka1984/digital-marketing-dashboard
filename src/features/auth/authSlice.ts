import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  isAuthenticated: boolean;
  user?: { id?: string; name?: string; email?: string; role?: string } | null;
  accessToken?: string | null;
  refreshToken?: string | null;
};

const savedState = localStorage.getItem("authState");
const initialState: AuthState = savedState
  ? JSON.parse(savedState)
  : {
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (
      state,
      action: PayloadAction<{
        name?: string;
        email?: string;
        role?: string;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = {
        name: action.payload.name || action.payload.email || "User",
        email: action.payload.email || "",
        role: action.payload.role || "client", 
      };
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      // persist login info
      localStorage.setItem(
        "authState",
        JSON.stringify({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        })
      );
    },

    signOut: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("authState");
    },
  },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
