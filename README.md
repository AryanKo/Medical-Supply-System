# Hospify — Medical Inventory & Order Management (Admin-only)

Hospify is a production-grade academic DBMS project for managing **hospital departments**, **inventory**, **low-stock alerts**, **vendors**, and **pending orders**.

## Project structure (mandatory)

```
root/
  frontend/
  backend/
  README.md

backend/
  models/
  routes/
  controllers/
  config/
  server.js

frontend/
  src/
    pages/
    components/
    services/
    App.jsx
```

## Tech stack (fixed)

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)

## Setup

### 1) Prereqs

- Node.js 18+
- MongoDB running locally (or a MongoDB URI)

If you use local MongoDB, ensure it’s reachable at `mongodb://127.0.0.1:27017`.

### 2) Install dependencies

From repo root:

```bash
npm run install:all
```

### 3) Backend environment

Create `backend/.env` from `backend/.env.example` and set:

- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_SEED_USERNAME`
- `ADMIN_SEED_PASSWORD`

Important:
- **No credentials are hardcoded** in code or UI.
- Initial admin + departments + realistic dummy items/vendors are created **only when** `SEED=true`.

### 4) Run the app

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Frontend env (optional):

- Create `frontend/.env` from `frontend/.env.example` if your API is not `http://localhost:5000`.

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Open the frontend at `http://localhost:5173`.

## Core flows to validate (checklist)

- Login works (JWT)
- Departments load (seeded: Radiology, Cardiology, Pediatrics)
- Enter department → items list
- Items CRUD works (name/quantity/threshold)
- Low-stock alert triggers when `quantity < threshold`
- Dashboard shows alerts + pending orders on page load
- Place Order flow saves an order with `status="pending"`
- Vendors are manageable per item (add/edit/delete)

## API (REST)

All routes below (except `/health` and `/auth/login`) require `Authorization: Bearer <token>`.

- `GET /health`
- `POST /auth/login`

- `GET /dashboard/summary`

- `GET /departments`
- `GET /departments/:id`

- `GET /items?departmentId=...`
- `POST /items`
- `PUT /items/:id`
- `DELETE /items/:id`

- `GET /vendors?itemId=...`
- `POST /vendors`
- `PUT /vendors/:id`
- `DELETE /vendors/:id`

- `GET /orders?status=pending`
- `POST /orders`

