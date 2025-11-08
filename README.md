# Todo List Application

A full-stack todo list application with Next.js (TypeScript) frontend, Express.js (TypeScript) backend, and PostgreSQL database, all containerized with Docker.

## Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── __tests__/
│   │   │   └── api.test.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .env
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── app/
│   │   ├── __tests__/
│   │   │   └── page.test.tsx
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── .env.local
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
└── README.md
```

## Features

- Add new todos
- Mark todos as completed
- Delete todos
- Persistent storage with PostgreSQL
- Responsive UI
- Fully containerized with Docker
- Comprehensive unit tests for frontend and backend
- TypeScript for type safety

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Navigate to the project directory:
```bash
cd todo-app
```

2. Start the application using Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a single todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `GET /health` - Health check endpoint

## Development

### Running without Docker

**Backend:**
```bash
cd backend
npm install
npm run dev  # For development with hot reload
# OR
npm run build && npm start  # For production
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Running Tests

**Backend Tests:**
```bash
cd backend
npm install
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

**Frontend Tests:**
```bash
cd frontend
npm install
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Environment Variables

**Backend (.env):**
- `PORT` - Server port (default: 5000)
- `DB_HOST` - Database host (default: db)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: tododb)
- `DB_USER` - Database user (default: todouser)
- `DB_PASSWORD` - Database password (default: todopass)

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000)

## Stopping the Application

```bash
docker-compose down
```

To remove volumes as well:
```bash
docker-compose down -v
```

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Backend:** Express.js, Node.js, TypeScript
- **Database:** PostgreSQL 15
- **Testing:** Jest, React Testing Library, Supertest
- **Containerization:** Docker, Docker Compose
