/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RegisterPage from '../pages/RegisterPage';
import useAuthStore from '../store/authStore';

// Mock the auth store
jest.mock('../store/authStore');

// Mock react-router-dom useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
      <Toaster />
    </BrowserRouter>
  );
};

describe('RegisterPage', () => {
  let mockRegister;

  beforeEach(() => {
    mockRegister = jest.fn();
    mockNavigate.mockClear();
    
    // Mock the store to return our mock functions
    useAuthStore.mockImplementation((selector) => {
      const mockState = {
        register: mockRegister,
        isLoading: false,
        user: null,
      };
      return selector ? selector(mockState) : mockState;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render register form', () => {
    renderWithRouter(<RegisterPage />);
    
    expect(screen.getByPlaceholderText('Choose a username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    mockRegister.mockResolvedValue();
    
    renderWithRouter(<RegisterPage />);
    
    const usernameInput = screen.getByPlaceholderText('Choose a username');
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser', 'password123');
    });
  });

  it('should show loading state during submission', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithRouter(<RegisterPage />);
    
    const usernameInput = screen.getByPlaceholderText('Choose a username');
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });

  it('should handle registration error', async () => {
    mockRegister.mockRejectedValue({
      response: { data: { message: 'Username already exists' } }
    });
    
    renderWithRouter(<RegisterPage />);
    
    const usernameInput = screen.getByPlaceholderText('Choose a username');
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it('should validate password confirmation', async () => {
    renderWithRouter(<RegisterPage />);
    
    const usernameInput = screen.getByPlaceholderText('Choose a username');
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);
    
    // Should not call register with mismatched passwords
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should have link to login page', () => {
    renderWithRouter(<RegisterPage />);
    
    const loginLink = screen.getByRole('link', { name: /sign in here/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});