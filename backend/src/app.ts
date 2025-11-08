import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool, QueryResult } from 'pg';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
export const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tododb',
  user: process.env.DB_USER || 'todouser',
  password: process.env.DB_PASSWORD || 'todopass',
});

// Types
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: Date;
}

interface CreateTodoBody {
  title: string;
}

interface UpdateTodoBody {
  title?: string;
  completed?: boolean;
}

// Initialize database
export const initDb = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// Routes

// Get all todos
app.get('/api/todos', async (req: Request, res: Response): Promise<void> => {
  try {
    const result: QueryResult<Todo> = await pool.query(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single todo
app.get('/api/todos/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result: QueryResult<Todo> = await pool.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new todo
app.post('/api/todos', async (req: Request<{}, {}, CreateTodoBody>, res: Response): Promise<void> => {
  try {
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const result: QueryResult<Todo> = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a todo
app.put('/api/todos/:id', async (req: Request<{ id: string }, {}, UpdateTodoBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const result: QueryResult<Todo> = await pool.query(
      'UPDATE todos SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
      [title, completed, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result: QueryResult<Todo> = await pool.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/health', (req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

export default app;
