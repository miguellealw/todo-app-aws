'use client';

import { useState, useEffect, FormEvent, CSSProperties } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data: Todo[] = await response.json();
      setTodos(data);
      setError('');
    } catch (err) {
      setError('Failed to load todos. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo }),
      });

      if (!response.ok) throw new Error('Failed to add todo');

      const data: Todo = await response.json();
      setTodos([data, ...todos]);
      setNewTodo('');
      setError('');
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    }
  };

  const toggleTodo = async (id: number, completed: boolean): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) throw new Error('Failed to update todo');

      const data: Todo = await response.json();
      setTodos(todos.map(todo => (todo.id === id ? data : todo)));
      setError('');
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const deleteTodo = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete todo');

      setTodos(todos.filter(todo => todo.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>Todo List</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={addTodo} style={styles.form}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            style={styles.input}
          />
          <button type="submit" style={styles.addButton}>
            Add
          </button>
        </form>

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <ul style={styles.list}>
            {todos.length === 0 ? (
              <li style={styles.emptyState}>No todos yet. Add one above!</li>
            ) : (
              todos.map((todo) => (
                <li key={todo.id} style={styles.todoItem}>
                  <div style={styles.todoContent}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      style={styles.checkbox}
                    />
                    <span
                      style={{
                        ...styles.todoText,
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        opacity: todo.completed ? 0.6 : 1,
                      }}
                    >
                      {todo.title}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </main>
  );
}

const styles: { [key: string]: CSSProperties } = {
  main: {
    minHeight: '100vh',
    padding: '2rem',
    background: 'linear-gradient(to bottom, #f7fafc, #edf2f7)',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#2d3748',
    textAlign: 'center',
  },
  error: {
    background: '#fed7d7',
    color: '#c53030',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '6px',
    outline: 'none',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    background: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#718096',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#a0aec0',
  },
  todoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  todoContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
  },
  checkbox: {
    width: '1.25rem',
    height: '1.25rem',
    cursor: 'pointer',
  },
  todoText: {
    fontSize: '1rem',
    color: '#2d3748',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    background: '#fc8181',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
};
