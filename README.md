# Team Task Manager

A full-stack team task management application with role-based access control.

## Features

- User authentication (Signup/Login) with JWT
- Role-based access control (Admin/Member)
- Project management
- Task assignment and tracking
- Dashboard with task statistics
- Responsive UI with sidebar navigation

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
team-task-manager/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   └── index.html
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd team-task-manager
```

### 2. Install dependencies

```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all
```

### 3. Configure environment variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Backend server port (default: 5000)

### 4. Start the application

```bash
# From the root directory, start both frontend and backend
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Admin Account

On first run, you can register as the first user who will automatically become an admin.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/role` - Update user role

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Admin)
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)
- `POST /api/projects/:id/members` - Add member to project (Admin)

### Tasks
- `GET /api/tasks` - Get tasks (filtered by user role)
- `POST /api/tasks` - Create task (Admin)
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task (Admin)

## License

MIT
