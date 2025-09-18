import { create } from 'zustand';
import axios from '../lib/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  
  checkAuth: async () => {
    try {
      const response = await axios.get('/auth/me');
      set({ user: response.data, isAuthenticated: true, loading: false });
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
  login: async (username, password) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      set({ user: response.data, isAuthenticated: true });
      return response.data;
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  },
  register: async (username, password) => {
    try {
      const response = await axios.post('/auth/register', { username, password });
      set({ user: response.data, isAuthenticated: true });
      return response.data;
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  },
  logout: async () => {
    try {
      await axios.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      // Even if the server request fails, clear the local state
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  },
}));

export default useAuthStore;