import request from 'supertest';
import app, { pool } from '../app';
import { QueryResult, QueryResultRow } from 'pg';

// Mock the pool
jest.mock('../app', () => {
  const actual = jest.requireActual('../app');
  return {
    ...actual,
    pool: {
      query: jest.fn(),
    },
  };
});

// Helper function to create mock QueryResult
const createMockQueryResult = <T extends QueryResultRow>(rows: T[]): QueryResult<T> => ({
  rows,
  command: 'SELECT',
  rowCount: rows.length,
  oid: 0,
  fields: [],
});

describe('Todo API Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const mockTodos = [
        {
          id: 1,
          title: 'Test Todo 1',
          completed: false,
          created_at: new Date(),
        },
        {
          id: 2,
          title: 'Test Todo 2',
          completed: true,
          created_at: new Date(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue(createMockQueryResult(mockTodos));

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTodos);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM todos ORDER BY created_at DESC'
      );
    });

    it('should handle server errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a single todo', async () => {
      const mockTodo = {
        id: 1,
        title: 'Test Todo',
        completed: false,
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue(createMockQueryResult([mockTodo]));

      const response = await request(app).get('/api/todos/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTodo);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM todos WHERE id = $1',
        ['1']
      );
    });

    it('should return 404 if todo not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue(createMockQueryResult([]));

      const response = await request(app).get('/api/todos/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Todo not found' });
    });

    it('should handle server errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/todos/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = {
        id: 1,
        title: 'New Todo',
        completed: false,
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue(createMockQueryResult([newTodo]));

      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'New Todo' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newTodo);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO todos (title) VALUES ($1) RETURNING *',
        ['New Todo']
      );
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app).post('/api/todos').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Title is required' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should handle server errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'New Todo' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      const updatedTodo = {
        id: 1,
        title: 'Updated Todo',
        completed: true,
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue(createMockQueryResult([updatedTodo]));

      const response = await request(app)
        .put('/api/todos/1')
        .send({ title: 'Updated Todo', completed: true });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTodo);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE todos SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
        ['Updated Todo', true, '1']
      );
    });

    it('should return 404 if todo not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue(createMockQueryResult([]));

      const response = await request(app)
        .put('/api/todos/999')
        .send({ completed: true });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Todo not found' });
    });

    it('should handle server errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/todos/1')
        .send({ completed: true });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const deletedTodo = {
        id: 1,
        title: 'Deleted Todo',
        completed: false,
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue(createMockQueryResult([deletedTodo]));

      const response = await request(app).delete('/api/todos/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Todo deleted successfully' });
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM todos WHERE id = $1 RETURNING *',
        ['1']
      );
    });

    it('should return 404 if todo not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue(createMockQueryResult([]));

      const response = await request(app).delete('/api/todos/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Todo not found' });
    });

    it('should handle server errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/api/todos/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });
});
