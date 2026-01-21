# Quick Start Guide - HustleMustle Server

## Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Build TypeScript
```bash
npm run build
```

### 3. Start Development Server
```bash
npm run dev
```

Server will be running at `http://localhost:5000`

## First Steps - Create User Account

### Step 1: Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully.",
  "user": {
    "id": "63f...",
    "username": "admin"
  }
}
```

### Step 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "63f...",
    "username": "admin"
  }
}
```

**Save the `token` value - you'll need it for all requests!**

## Making Authenticated Requests

All protected routes require the JWT token in the `Authorization` header:

```bash
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token you got from login.

## Available Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token

### Expenses (Protected)
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Trainers (Protected)
- `GET /api/trainers` - List all trainers
- `POST /api/trainers` - Create new trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer

### Settings (Protected)
- `GET /api/settings` - List all users
- `PUT /api/settings/:id` - Update user
- `DELETE /api/settings/:id` - Delete user

### Trainees (Protected)
- `GET /api/trainees` - List all trainees
- `POST /api/trainees` - Create new trainee
- `GET /api/trainees/:id` - Get trainee details
- `PUT /api/trainees/:id` - Update trainee
- `PUT /api/trainees/:id/freeze` - Freeze/unfreeze account
- `POST /api/trainees/:id/check-in` - Check-in trainee
- `DELETE /api/trainees/:id` - Delete trainee

### Health Check
- `GET /health` - Check if server is running

## Example: Create an Expense

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Monthly Rent",
    "category": "Place Expenses",
    "amount": 5000,
    "dateOfPayment": "2026-01-21"
  }'
```

## Environment Variables

Edit `.env` file in the server folder:

```env
PORT=5000                          # Server port
DB_URI=mongodb+srv://...          # MongoDB connection string
JWT_SECRET=your-secret-key         # Change this in production!
N8N_WELCOME_WEBHOOK=...           # N8N webhook URL
N8N_API_SECRET=...                # N8N API key
NODE_ENV=development              # development or production
```

## Troubleshooting

### "No token provided. Access denied."
- Make sure you're including the `Authorization: Bearer <token>` header
- Check that your token is valid and hasn't expired

### "Token has expired"
- Login again to get a new token
- Tokens expire after 7 days

### "Invalid or missing API Key" (for automation routes)
- Make sure `N8N_API_SECRET` in `.env` matches what you're sending

### MongoDB connection error
- Check your `DB_URI` in `.env`
- Verify internet connection
- Check MongoDB Atlas credentials

## Development Tips

### Use Postman
1. Download [Postman](https://www.postman.com/)
2. Create a request to `POST http://localhost:5000/api/auth/login`
3. In "Tests" tab, add:
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```
4. Use `{{token}}` in Authorization header for other requests

### Enable Hot Reload
The `npm run dev` command uses `nodemon` which auto-restarts on file changes.

### Check Logs
Look at console output for:
- "✓ MongoDB connected successfully"
- "✓ Server running at http://localhost:5000"

## Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Important Production Changes
1. Change `JWT_SECRET` to a strong, random value
2. Set `NODE_ENV=production`
3. Use a production MongoDB URI
4. Enable HTTPS
5. Set proper CORS origins instead of `*`

## Support Documentation

- **Full JWT Guide**: See `JWT_AUTH_GUIDE.md`
- **Migration Details**: See `MIGRATION_SUMMARY.md`
- **TypeScript Models**: Check individual model files in `src/models/`
- **Route Details**: Check individual route files in `src/Routes/`
