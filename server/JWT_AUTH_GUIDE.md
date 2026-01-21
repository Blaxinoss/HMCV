# HustleMustle Server - JWT Authentication Guide

## Overview

The server has been completely migrated from JavaScript to TypeScript with a comprehensive JWT (JSON Web Token) authentication system implemented.

## Architecture

### Converted Files to TypeScript

#### Models
- **User.ts** - User schema with proper TypeScript interfaces
- **Expense.ts** - Expense schema with validation
- **Trainers.ts** - Trainers schema with virtuals
- **Trainees.ts** - Trainees schema (already in TS)

#### Routes
- **authRoutes.ts** - NEW: Login and registration endpoints
- **expensesRoutes.ts** - Protected expense management
- **trainersRoutes.ts** - Protected trainer management
- **settingsRoutes.ts** - Protected user settings and management
- **traineeRoutes.ts** - Already in TS (minimal changes)
- **AutomationRoutes.ts** - Already in TS

#### Middleware
- **verifyToken.ts** - JWT token verification middleware
- **requireApi.ts** - API key validation for N8N automation

#### Main Server
- **server.ts** - Express server with TypeScript types and error handling

## JWT Authentication Flow

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "user": {
    "id": "mongodb_object_id",
    "username": "your_username"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Username already exists."
}
```

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "mongodb_object_id",
    "username": "your_username"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid username or password."
}
```

### 3. Using the Token

Store the token received from login and include it in all subsequent requests:

**Header:**
```
Authorization: Bearer <your_token_here>
```

### 4. Protected Routes

All the following routes now require JWT authentication:

#### Expenses Routes
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

#### Trainers Routes
- `GET /api/trainers` - Get all trainers
- `POST /api/trainers` - Create new trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer (soft delete)

#### Settings Routes
- `GET /api/settings` - Get all users (admin)
- `PUT /api/settings/:id` - Update user
- `DELETE /api/settings/:id` - Delete user

#### Trainees Routes
- `GET /api/trainees` - Get all trainees
- `POST /api/trainees` - Create new trainee
- `GET /api/trainees/:id` - Get trainee details
- `PUT /api/trainees/:id` - Update trainee
- `PUT /api/trainees/:id/freeze` - Freeze/Unfreeze account
- `POST /api/trainees/:id/check-in` - Check-in
- `DELETE /api/trainees/:id` - Delete trainee

## Environment Variables

Add these to your `.env` file:

```env
PORT=5000
DB_URI=your_mongodb_uri
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
N8N_WELCOME_WEBHOOK=http://localhost:5678/webhook-test/...
N8N_API_SECRET=your_api_secret
NODE_ENV=development
```

### Important
Change the `JWT_SECRET` to a strong, secure value in production. Never commit it to version control.

## Token Details

- **Algorithm:** HS256 (HMAC SHA-256)
- **Expiration:** 7 days from issuance
- **Payload:**
  ```json
  {
    "id": "user_mongodb_id",
    "username": "username",
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```

## Error Responses

### 401 - Unauthorized (No Token)
```json
{
  "success": false,
  "message": "No token provided. Access denied."
}
```

### 401 - Token Expired
```json
{
  "success": false,
  "message": "Token has expired. Please login again."
}
```

### 403 - Invalid Token
```json
{
  "success": false,
  "message": "Invalid token. Access denied."
}
```

## Running the Server

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm install
npm run build
npm start
```

## TypeScript Benefits

- **Type Safety:** All routes, models, and middleware are fully typed
- **Better IDE Support:** Full autocomplete and error detection
- **Easier Maintenance:** Self-documenting code with clear types
- **Compile Time Checks:** Catch errors before runtime

## Security Features

1. **Password Hashing:** Bcrypt with 10 salt rounds
2. **JWT Tokens:** Secure token-based authentication
3. **Token Expiration:** Tokens expire after 7 days
4. **Request Validation:** Input validation on all routes
5. **Error Handling:** Comprehensive error handling across all endpoints
6. **Environment Variables:** Sensitive data in `.env` file

## Testing with Postman

### 1. Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

Save the token from response.

### 3. Use Protected Route
```
GET http://localhost:5000/api/expenses
Authorization: Bearer <your_token>
```

## Migration Notes

All JavaScript files in the server folder have been converted to TypeScript. The migration maintains:
- All existing functionality
- Database schema compatibility
- API endpoint structure
- Error handling patterns

New additions:
- JWT authentication system
- TypeScript strict mode enabled
- Proper type definitions for all models
- Enhanced error responses
