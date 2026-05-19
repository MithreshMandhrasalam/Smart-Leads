# Smart Leads Dashboard

A full-stack Lead Management Dashboard using the MERN stack with clean architecture, scalable code practices, and a professional user experience.

## Features
- **Authentication**: JWT-based auth with roles (Admin, Sales User)
- **Leads Management**: CRUD operations on leads (Name, Email, Status, Source)
- **Advanced Filtering & Search**: Filter by status and source, search by name or email, sort by created date.
- **Pagination**: Backend pagination for scalable data handling.
- **CSV Export**: Export filtered leads to CSV.
- **Responsive UI**: Built with React, TailwindCSS, and Lucide Icons. Dark mode supported.

## Prerequisites
- Node.js (v18+)
- MongoDB
- Docker (optional)

## Setup Instructions

### Environment Variables
Copy `.env.example` to `.env` in the root folder and update the variables:
```
# Backend
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_leads
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend
VITE_API_URL=http://localhost:5000/api
```

### Running Locally without Docker

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Running with Docker

Run the entire stack (MongoDB, Backend, Frontend) with Docker Compose:
```bash
docker-compose up --build
```
The frontend will be available at http://localhost:5173 and backend at http://localhost:5000.

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user (body: name, email, password, role)
- `POST /api/auth/login` - Login user (body: email, password)

### Leads
- `GET /api/leads` - Get all leads (query: page, limit, status, source, search, sort)
- `GET /api/leads/:id` - Get a single lead
- `POST /api/leads` - Create a new lead (body: name, email, status, source)
- `PUT /api/leads/:id` - Update a lead
- `DELETE /api/leads/:id` - Delete a lead (Admin only)
- `GET /api/leads/export` - Export leads as CSV (query parameters match GET /api/leads)

## Submission Details
- **Developer**: Ritik Yadav (Demo Name)
- **Tech Stack**: React, Node.js, Express, MongoDB, TailwindCSS, TypeScript
