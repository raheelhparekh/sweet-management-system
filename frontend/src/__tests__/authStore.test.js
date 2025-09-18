/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import axios from '../lib/axios';
import useAuthStore from '../store/authStore';

// Mock axios
jest.mock('../lib/axios');
const mockedAxios = axios;

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state
    act(() => {
      useAuthStore.setState({ 
        user: null, 
        isAuthenticated: false, 
        loading: true 
      });
    });
    jest.clearAllMocks();
  });

  describe('checkAuth', () => {
    it('should set user and isAuthenticated to true on successful auth check', async () => {
      const mockUser = { id: 1, username: 'testuser', isAdmin: false };
      mockedAxios.get.mockResolvedValue({ data: mockUser });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should set user to null and isAuthenticated to false on failed auth check', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('login', () => {
    it('should set user and isAuthenticated on successful login', async () => {
      const mockUser = { id: 1, username: 'testuser', isAdmin: false };
      mockedAxios.post.mockResolvedValue({ data: mockUser });

      const { result } = renderHook(() => useAuthStore());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('testuser', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(loginResult).toEqual(mockUser);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should throw error and reset state on failed login', async () => {
      const errorResponse = { response: { data: { message: 'Invalid credentials' } } };
      mockedAxios.post.mockRejectedValue(errorResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login('testuser', 'wrongpassword');
        } catch (error) {
          expect(error).toEqual(errorResponse);
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should set user and isAuthenticated on successful registration', async () => {
      const mockUser = { id: 1, username: 'newuser', isAdmin: false };
      mockedAxios.post.mockResolvedValue({ data: mockUser });

      const { result } = renderHook(() => useAuthStore());

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register('newuser', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(registerResult).toEqual(mockUser);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', {
        username: 'newuser',
        password: 'password123'
      });
    });

    it('should throw error and reset state on failed registration', async () => {
      const errorResponse = { response: { data: { message: 'User already exists' } } };
      mockedAxios.post.mockRejectedValue(errorResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.register('existinguser', 'password123');
        } catch (error) {
          expect(error).toEqual(errorResponse);
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should reset user state on successful logout', async () => {
      mockedAxios.post.mockResolvedValue({});

      const { result } = renderHook(() => useAuthStore());

      // Set initial state
      act(() => {
        useAuthStore.setState({
          user: { id: 1, username: 'testuser' },
          isAuthenticated: true
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should reset user state even if logout request fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      // Set initial state
      act(() => {
        useAuthStore.setState({
          user: { id: 1, username: 'testuser' },
          isAuthenticated: true
        });
      });

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          // Expected to throw error, but state should still be cleared
          expect(error.message).toBe('Network error');
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});