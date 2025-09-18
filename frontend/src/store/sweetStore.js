/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
import { create } from 'zustand';
import axios from '../lib/axios';

const useSweetStore = create((set) => ({
  sweets: [],
  loading: false,
  error: null,

  // all sweets from the API
  fetchSweets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/sweets');
      set({ sweets: response.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch sweets.', loading: false });
    }
  },

  // Search sweets with filters
  searchSweets: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/sweets/search', { params });
      set({ sweets: response.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to search sweets.', loading: false });
      throw err;
    }
  },

  // Updates the quantity of a specific sweet
  purchaseSweet: async (id) => {
    try {
      const response = await axios.post(`/sweets/${id}/purchase`);
      const updatedSweet = response.data;
      set((state) => ({
        sweets: state.sweets.map((sweet) =>
          sweet._id === updatedSweet._id ? updatedSweet : sweet
        ),
      }));
      return updatedSweet;
    } catch (err) {
      throw err;
    }
  },

  // (Admin) Adds a new sweet
  addSweet: async (newSweetData) => {
    try {
      const response = await axios.post('/sweets', newSweetData);
      const newSweet = response.data;
      set((state) => ({ sweets: [...state.sweets, newSweet] }));
      return newSweet;
    } catch (err) {
      throw err;
    }
  },

  // (Admin) Deletes a sweet
  deleteSweet: async (id) => {
    try {
      await axios.delete(`/sweets/${id}`);
      set((state) => ({
        sweets: state.sweets.filter((sweet) => sweet._id !== id),
      }));
    } catch (err) {
      throw err;
    }
  },

  // (Admin) Updates a sweet
  updateSweet: async (id, sweetData) => {
    try {
      const response = await axios.put(`/sweets/${id}`, sweetData);
      const updatedSweet = response.data;
      set((state) => ({
        sweets: state.sweets.map((sweet) =>
          sweet._id === updatedSweet._id ? updatedSweet : sweet
        ),
      }));
      return updatedSweet;
    } catch (err) {
      throw err;
    }
  },

  // (Admin) Restocks a sweet
  restockSweet: async (id, quantity) => {
    try {
      const response = await axios.post(`/sweets/${id}/restock`, { quantity });
      const updatedSweet = response.data;
      set((state) => ({
        sweets: state.sweets.map((sweet) =>
          sweet._id === updatedSweet._id ? updatedSweet : sweet
        ),
      }));
      return updatedSweet;
    } catch (err) {
      throw err;
    }
  },
}));

export default useSweetStore;