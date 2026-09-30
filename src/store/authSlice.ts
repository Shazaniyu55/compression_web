import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  email: string | null;
}

const STORAGE_KEY = 'squeeze.auth';

function load(): AuthState {
  if (typeof window === 'undefined') return { token: null, email: null };
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as AuthState;
  } catch {
    return { token: null, email: null };
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: load,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; email: string }>) {
      state.token = action.payload.token;
      state.email = action.payload.email;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    logout(state) {
      state.token = null;
      state.email = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
