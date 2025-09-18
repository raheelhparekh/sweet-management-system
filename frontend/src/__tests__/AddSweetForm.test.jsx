/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AddSweetForm from '../components/admin/AddSweetForm';
import useSweetStore from '../store/sweetStore';

// Mock the sweet store
jest.mock('../store/sweetStore');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
      <Toaster />
    </BrowserRouter>
  );
};

describe('AddSweetForm', () => {
  let mockAddSweet;
  const mockOnSweetAdded = jest.fn();
  
  beforeEach(() => {
    mockAddSweet = jest.fn();
    
    // Mock the store to return our mock functions
    useSweetStore.mockImplementation((selector) => {
      const mockState = {
        addSweet: mockAddSweet,
        loading: false,
        error: null,
      };
      return selector ? selector(mockState) : mockState;
    });
    
    mockOnSweetAdded.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render add sweet form', () => {
    renderWithRouter(<AddSweetForm onSweetAdded={mockOnSweetAdded} />);
    
    expect(screen.getByText('Add New Sweet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter sweet name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add sweet/i })).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    mockAddSweet.mockResolvedValue({ name: 'Test Sweet' });
    
    renderWithRouter(<AddSweetForm onSweetAdded={mockOnSweetAdded} />);
    
    const nameInput = screen.getByPlaceholderText('Enter sweet name');
    const categoryInput = screen.getByPlaceholderText('Enter category');
    const priceInput = screen.getByPlaceholderText('0.00');
    const quantityInput = screen.getByPlaceholderText('0');
    const submitButton = screen.getByRole('button', { name: /add sweet/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Sweet' } });
    fireEvent.change(categoryInput, { target: { value: 'Candy' } });
    fireEvent.change(priceInput, { target: { value: '5.99' } });
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddSweet).toHaveBeenCalledWith({
        name: 'Test Sweet',
        category: 'Candy',
        price: 5.99,
        quantity: 10
      });
    });
    
    await waitFor(() => {
      expect(mockOnSweetAdded).toHaveBeenCalled();
    });
  });

  it('should show validation error for missing name', async () => {
    renderWithRouter(<AddSweetForm onSweetAdded={mockOnSweetAdded} />);
    
    const categoryInput = screen.getByPlaceholderText('Enter category');
    const priceInput = screen.getByPlaceholderText('0.00');
    const quantityInput = screen.getByPlaceholderText('0');
    const submitButton = screen.getByRole('button', { name: /add sweet/i });
    
    fireEvent.change(categoryInput, { target: { value: 'Candy' } });
    fireEvent.change(priceInput, { target: { value: '5.99' } });
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.click(submitButton);
    
    expect(mockAddSweet).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid price', async () => {
    renderWithRouter(<AddSweetForm onSweetAdded={mockOnSweetAdded} />);
    
    const nameInput = screen.getByPlaceholderText('Enter sweet name');
    const categoryInput = screen.getByPlaceholderText('Enter category');
    const priceInput = screen.getByPlaceholderText('0.00');
    const quantityInput = screen.getByPlaceholderText('0');
    const submitButton = screen.getByRole('button', { name: /add sweet/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Sweet' } });
    fireEvent.change(categoryInput, { target: { value: 'Candy' } });
    fireEvent.change(priceInput, { target: { value: '-5' } });
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.click(submitButton);
    
    expect(mockAddSweet).not.toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    mockAddSweet.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithRouter(<AddSweetForm onSweetAdded={mockOnSweetAdded} />);
    
    const nameInput = screen.getByPlaceholderText('Enter sweet name');
    const categoryInput = screen.getByPlaceholderText('Enter category');
    const priceInput = screen.getByPlaceholderText('0.00');
    const quantityInput = screen.getByPlaceholderText('0');
    const submitButton = screen.getByRole('button', { name: /add sweet/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Sweet' } });
    fireEvent.change(categoryInput, { target: { value: 'Candy' } });
    fireEvent.change(priceInput, { target: { value: '5.99' } });
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Adding Sweet...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should reset form after successful submission', async () => {
    mockAddSweet.mockResolvedValue({ name: 'Test Sweet' });
    
    renderWithRouter(<AddSweetForm onSweetAdded={mockOnSweetAdded} />);
    
    const nameInput = screen.getByPlaceholderText('Enter sweet name');
    const categoryInput = screen.getByPlaceholderText('Enter category');
    const priceInput = screen.getByPlaceholderText('0.00');
    const quantityInput = screen.getByPlaceholderText('0');
    const submitButton = screen.getByRole('button', { name: /add sweet/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Sweet' } });
    fireEvent.change(categoryInput, { target: { value: 'Candy' } });
    fireEvent.change(priceInput, { target: { value: '5.99' } });
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddSweet).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(categoryInput.value).toBe('');
      expect(priceInput.value).toBe('');
      expect(quantityInput.value).toBe('');
    });
  });
});