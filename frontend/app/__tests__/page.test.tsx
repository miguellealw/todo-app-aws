import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';

describe('Home Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render the todo list title', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Home />);
    expect(screen.getByText('Todo List')).toBeInTheDocument();
  });

  it('should render the add todo form', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Home />);
    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('should fetch and display todos on mount', async () => {
    const mockTodos = [
      {
        id: 1,
        title: 'Test Todo 1',
        completed: false,
        created_at: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        title: 'Test Todo 2',
        completed: true,
        created_at: '2024-01-02T00:00:00.000Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/todos'
    );
  });

  it('should display error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load todos. Make sure the backend is running.')
      ).toBeInTheDocument();
    });
  });

  it('should display empty state when there are no todos', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });
  });

  it('should add a new todo', async () => {
    const user = userEvent.setup();
    const mockTodos = [];
    const newTodo = {
      id: 1,
      title: 'New Todo',
      completed: false,
      created_at: '2024-01-01T00:00:00.000Z',
    };

    // Mock initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<Home />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });

    // Mock add todo request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => newTodo,
    });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'New Todo');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Todo')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Todo' }),
    });

    // Input should be cleared
    expect(input).toHaveValue('');
  });

  it('should not add todo with empty title', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: 'Add' });
    await user.click(addButton);

    // Fetch should only be called once (for initial load)
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should toggle todo completion', async () => {
    const user = userEvent.setup();
    const mockTodos = [
      {
        id: 1,
        title: 'Test Todo',
        completed: false,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ];

    const updatedTodo = {
      ...mockTodos[0],
      completed: true,
    };

    // Mock initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    // Mock update request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedTodo,
    });

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/todos/1',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true }),
        }
      );
    });
  });

  it('should delete a todo', async () => {
    const user = userEvent.setup();
    const mockTodos = [
      {
        id: 1,
        title: 'Test Todo',
        completed: false,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ];

    // Mock initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    // Mock delete request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Todo deleted successfully' }),
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Todo')).not.toBeInTheDocument();
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/todos/1',
      {
        method: 'DELETE',
      }
    );
  });

  it('should display error when adding todo fails', async () => {
    const user = userEvent.setup();

    // Mock initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });

    // Mock failed add request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'New Todo');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to add todo')).toBeInTheDocument();
    });
  });

  it('should display error when updating todo fails', async () => {
    const user = userEvent.setup();
    const mockTodos = [
      {
        id: 1,
        title: 'Test Todo',
        completed: false,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ];

    // Mock initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    // Mock failed update request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText('Failed to update todo')).toBeInTheDocument();
    });
  });

  it('should display error when deleting todo fails', async () => {
    const user = userEvent.setup();
    const mockTodos = [
      {
        id: 1,
        title: 'Test Todo',
        completed: false,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ];

    // Mock initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    // Mock failed delete request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete todo')).toBeInTheDocument();
    });
  });
});
