# HMCV — Hustle Muscle Club Manager

HMCV is a bilingual gym-management application for trainees, subscriptions, attendance, trainers, expenses, coupons, CRM activity, and business reporting. The repository contains a React/Vite client and an Express/MongoDB server written in TypeScript.

This is the single source of project documentation. It replaces the older migration summaries, quick-reference files, audit notes, and implementation checklists that previously lived throughout the repository.

## Current status

The application builds successfully and the server behavioral test suite passes. Core workflows are implemented, including tenant-scoped data, JWT authentication, trainee management, attendance, freezing, renewals, coupons, expenses, dashboard reporting, a payment ledger, and audit records.

The project is still not approved for an unmonitored production transfer. Before a production handoff, complete the items in [Production readiness](#production-readiness), run the legacy payment migration against a backed-up staging database, and perform database-backed integration and end-to-end testing.

Verified on 2026-10-05:

- Client production build: passed.
- Server TypeScript build: passed.
- Server behavioral tests: 12 passed.
- Client build warning: the main JavaScript bundle is larger than 500 kB and should eventually be split.

## Technology

### Client

- React 18 and TypeScript
- Vite
- Redux Toolkit
- React Router
- React Hook Form and Yup
- Tailwind CSS
- Chart.js and Recharts
- i18next with English and Arabic translations
- Axios

### Server

- Node.js, Express, and TypeScript
- MongoDB and Mongoose
- JWT authentication and bcrypt password hashing
- Tenant-specific MongoDB databases
- Node's built-in test runner
- Optional n8n webhook integration

## Repository layout

```text
HMCV/
├── client/                 React application
│   └── src/
│       ├── components/     Screens and reusable UI
│       ├── slices/         Redux state and API actions
│       ├── locales/        English and Arabic strings
│       ├── types/          Client contracts
│       └── utils/          API, auth, business logic, and helpers
├── server/                 Express application
│   ├── midware/            Authentication, authorization, tenancy, rate limits
│   ├── src/
│   │   ├── Routes/         HTTP route modules
│   │   ├── models/         Mongoose schemas
│   │   ├── services/       Finance, coupons, and audit behavior
│   │   ├── scripts/        Data migrations
│   │   └── utils/          Validation, money, dates, and targets
│   └── tests/              Behavioral tests
└── README.md               Project documentation
```

## Features

### Authentication and tenancy

- Username/password login with bcrypt verification.
- Seven-day JWT access tokens.
- Fresh user lookup on each protected request.
- Admin authorization for the main management APIs.
- Login rate limiting.
- Admin-only account creation; public registration is disabled.
- Tenant databases named from the `x-tenant-id` request header.
- Tenant-scoped users, trainees, trainers, coupons, expenses, payment transactions, and audit logs.

### Trainees and subscriptions

- Create, search, filter, paginate, view, edit, and soft-delete trainees.
- Time-based and session-based subscriptions.
- Subscription renewal and debt tracking.
- Attendance history, normal check-in, and quick check-in.
- Frozen, expired, debt, and active status handling.
- Freeze/unfreeze history with actor, reason, effective date, and before/after expiry dates.
- Optimistic concurrency for freeze transitions.
- CRM fields and program information.

### Finance and coupons

- Immutable payment, refund, and adjustment records in integer minor currency units.
- Billing-cycle IDs prevent renewal payments from mixing with earlier subscriptions.
- Derived paid, refunded, adjusted, and outstanding totals.
- Fixed and percentage coupons with expiry and usage limits.
- Atomic coupon usage increments.
- Soft-deleted expenses with validation and audit records.
- Legacy financial snapshots remain temporarily available during ledger migration.

### Dashboard and user experience

- Membership, attendance, debt, revenue, expense, and profit reporting.
- Recent financial activity and transaction history.
- Responsive management UI.
- English and Arabic localization.
- Loading, toast, confirmation, and error-boundary components.

## Local setup

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB
- Optional: n8n for welcome and campaign webhooks

### 1. Install dependencies

```powershell
Set-Location client
npm install

Set-Location ..\server
npm install
```

### 2. Configure the server

Create `server/.env`. Never commit this file.

```dotenv
DB_URI=mongodb://localhost:27017
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
NODE_ENV=development
GYM_TIMEZONE=Africa/Cairo

DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=replace-this-password
SYSTEM_SECRET=replace-with-a-system-secret

N8N_API_SECRET=replace-if-n8n-is-enabled
N8N_WELCOME_WEBHOOK=http://localhost:5678/webhook-test/welcome_user
N8N_CAMPAIGN_WEBHOOK=http://localhost:5678/webhook-test/campaign
```

`MONGO_URI` is used only by the older seed script. Prefer `DB_URI` for the application and migration commands.

The client API base URL is currently defined in `client/src/utils/constants.ts` as `http://localhost:5000/api`. Change that value, or restore its existing `VITE_API_URL` expression, for a non-local environment.

### 3. Start development servers

In one terminal:

```powershell
Set-Location server
npm run dev
```

In another terminal:

```powershell
Set-Location client
npm run dev
```

The default client is served by Vite and the default API listens on port `5000`.

### 4. Initialize a tenant administrator

All server requests currently pass through tenant middleware. Include `x-tenant-id` so the server selects the correct tenant database.

```http
POST /seed/init-tenant
x-tenant-id: demo-gym
x-system-secret: <SYSTEM_SECRET>
```

The route creates the first administrator from `DEFAULT_ADMIN_USERNAME` and `DEFAULT_ADMIN_PASSWORD` when that tenant has no administrator.

## Authentication and request headers

Login requires the tenant header:

```http
POST /api/auth/login
Content-Type: application/json
x-tenant-id: demo-gym

{
  "username": "admin",
  "password": "your-password"
}
```

Protected API calls require both tenant and authorization headers:

```http
Authorization: Bearer <jwt>
x-tenant-id: demo-gym
Content-Type: application/json
```

Most management APIs are restricted to users whose role is `admin`.

## API reference

All paths below are relative to the server origin.

| Area | Method and path | Purpose |
|---|---|---|
| Health | `GET /health` | Basic process response |
| Health | `GET /health/live` | Liveness response |
| Health | `GET /health/ready` | MongoDB-aware readiness response |
| Tenant setup | `POST /seed/init-tenant` | Seed a tenant's first administrator |
| Auth | `POST /api/auth/login` | Authenticate and return a JWT |
| Auth | `POST /api/auth/create-admin` | Create an administrator |
| Auth | `PUT /api/auth/:userId` | Update a user account |
| Auth | `DELETE /api/auth/deleteUser/:id` | Delete a user account |
| Trainees | `GET /api/trainees` | Paginated/searchable trainee list |
| Trainees | `POST /api/trainees` | Create a trainee and subscription |
| Trainees | `GET /api/trainees/:id` | Get one trainee |
| Trainees | `PUT /api/trainees/:id` | Replace editable trainee details |
| Trainees | `PATCH /api/trainees/:id` | Update allowed trainee fields |
| Trainees | `DELETE /api/trainees/:id` | Soft-delete a trainee |
| Attendance | `POST /api/trainees/check-in/:id` | Check in a trainee |
| Subscription | `PUT /api/trainees/:id/freeze` | Freeze or unfreeze a subscription |
| Subscription | `POST /api/trainees/:id/renew` | Renew a subscription |
| Finance | `POST /api/trainees/:id/transactions` | Record payment/refund/adjustment |
| Finance | `GET /api/trainees/:id/transactions` | Get ledger history and summary |
| Coupons | `GET /api/coupons` | List coupons |
| Coupons | `POST /api/coupons` | Create a coupon |
| Coupons | `DELETE /api/coupons/:id` | Delete a coupon |
| Coupons | `POST /api/coupons/validate-coupon` | Validate a coupon |
| Expenses | `GET /api/expenses` | List active expenses |
| Expenses | `POST /api/expenses` | Create an expense |
| Expenses | `PUT /api/expenses/:id` | Update an expense |
| Expenses | `DELETE /api/expenses/:id` | Soft-delete an expense |
| Trainers | `GET /api/trainers` | List active trainers |
| Trainers | `POST /api/trainers` | Create a trainer |
| Trainers | `PUT /api/trainers/:id` | Update allowed trainer fields |
| Trainers | `DELETE /api/trainers/:id` | Soft-delete a trainer |
| Settings | `GET /api/settings` | List users |
| Settings | `PUT /api/settings/:id` | Update a user |
| Settings | `DELETE /api/settings/:id` | Delete a user |
| Dashboard | `GET /api/dashboard/raw-data` | Get dashboard source records |
| Dashboard | `GET /api/dashboard/stats` | Get aggregated dashboard statistics |
| Marketing | `POST /api/marketing/trigger-reminders` | Trigger reminder automation |
| Marketing | `POST /api/marketing/log/:id` | Log trainee messaging activity |
| Marketing | `POST /api/marketing/validate-coupon` | Validate coupon data for marketing |

Response envelopes are not yet fully standardized. Client code should accept server errors from either `message` or `error` until that work is completed.

## Important business rules

### Money

- New ledger entries use `amountMinor` integers; for EGP, `10000` represents `100.00 EGP`.
- Transaction types are `payment`, `refund`, and `adjustment`.
- Voided transactions do not contribute to summaries.
- Outstanding balance never becomes negative.
- A billing cycle is regenerated when a subscription renews.
- The legacy `paid` and `remaining` trainee fields are compatibility snapshots until migration is complete.

### Freeze and attendance

- A subscription with debt or an expired end date cannot be frozen.
- If the trainee attended on the current gym day, the freeze begins on the next gym day.
- Unfreezing extends the subscription by elapsed frozen calendar days.
- Freeze calculations use `GYM_TIMEZONE`, defaulting to `Africa/Cairo`.
- A frozen or expired trainee cannot check in.
- Session subscriptions decrement `sessionsRemaining` on valid check-in.

### Deletion

Trainees, trainers, and expenses use soft deletion for normal workflows. Queries should keep `deleteFlag: false` filters so historical and financial records are not destroyed.

## Development commands

### Client

```powershell
Set-Location client
npm run dev       # Vite development server
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production output
```

### Server

```powershell
Set-Location server
npm run dev       # Nodemon + ts-node
npm run build     # TypeScript compilation
npm test          # Build and execute behavioral tests
npm start         # Run compiled dist/server.js
```

## Legacy payment migration

The ledger migration creates an initial payment transaction from each unmigrated trainee's legacy `paid` value, assigns a billing cycle when needed, and records `ledgerMigratedAt`.

Before running it:

1. Back up the target database.
2. Run against staging first.
3. Confirm the connection selects the intended database/tenant.
4. Compare trainee counts, transaction totals, and dashboard totals before and after.

```powershell
Set-Location server
npm run migrate:legacy-payments
```

Do not run the migration blindly against production. The current script uses the database selected by `DB_URI`; tenant-by-tenant execution and verification must be part of the deployment plan.

## Testing

Current server tests cover:

- Ledger calculations, refunds, adjustments, voids, overpayment, and invalid minor-unit values.
- Payment transaction schema validation.
- Expense validation, including zero and invalid values.
- Coupon discount caps.
- Freeze timing across the configured gym timezone.
- Optimistic concurrency configuration.

Before merging substantial changes, run:

```powershell
Set-Location client
npm run build
npm run lint

Set-Location ..\server
npm run build
npm test
```

Database-backed route tests, concurrent MongoDB transaction tests, and complete browser end-to-end tests are still required.

## Deployment

- The client can be built with Vite and deployed as a static application.
- `server/vercel.json` contains the current Vercel server routing and CORS headers.
- Configure secrets in the hosting platform; never deploy `server/.env`.
- Verify the deployed client API base URL, allowed origins, tenant header behavior, health endpoints, MongoDB connectivity, n8n credentials, and JWT secret.
- Verify backup and rollback procedures before customer data is introduced.

## Production readiness

Complete these items before a formal product transfer:

1. Rotate every database, JWT, webhook, system, and administrator secret that has been used during development.
2. Make CORS environment-specific and remove duplicate server CORS middleware.
3. Back up staging data and complete the legacy payment migration per tenant.
4. Move all dashboard finance calculations from legacy snapshots to the ledger.
5. Add MongoDB replica-set integration tests for ledger, coupon, freeze, check-in, and concurrent requests.
6. Standardize request validation and response/error envelopes across all routes.
7. Finish authorization review for user-management and sensitive mutation routes.
8. Add password reset and decide on token revocation/session policy.
9. Apply gym-timezone logic consistently to check-in and dashboard aggregation.
10. Add pagination/aggregation limits to dashboard raw data and large lists.
11. Expand immutable auditing to coupon, role, and remaining sensitive changes.
12. Add CI, monitoring, alerting, automated backups, restore drills, and a documented rollback procedure.
13. Split the large client bundle and complete accessibility, keyboard, mobile, Arabic RTL, loading, and empty-state testing.
14. Run staging end-to-end tests for login, trainee CRUD, attendance, freeze/unfreeze, payments, renewal, coupons, expenses, and dashboards.

## Known limitations

- Public registration is intentionally disabled; administrators create accounts.
- Password reset and server-side token revocation are not implemented.
- Login throttling is in memory and should use a shared store for horizontally scaled deployments.
- Dashboard raw data is capped for transactions but still needs a proper paginated/aggregated contract.
- Some server date calculations outside freeze policy still use local server time.
- API envelopes and update semantics are not fully uniform.
- The client API URL is currently hardcoded for local development.
- The client production bundle triggers Vite's large-chunk warning.

## Troubleshooting

### `Missing x-tenant-id header`

Add `x-tenant-id` to login and API requests. The same tenant value must be used when initializing the tenant and logging in.

### `No token provided` or `Invalid token`

Log in again, copy the returned token, and send `Authorization: Bearer <token>`. Confirm `JWT_SECRET` did not change between login and the protected request.

### MongoDB connection failure

Confirm `DB_URI`, network access, credentials, and the MongoDB service. Use `/health/ready` with the tenant header to check readiness.

### Client cannot reach the API

Confirm the server is running, inspect `client/src/utils/constants.ts`, and verify the browser request contains the required tenant header and a valid token.

### Coupon, check-in, or freeze request fails

Inspect the response `message` or `error`. Common causes are an expired/exhausted coupon, an already-recorded attendance day, a frozen/expired subscription, zero remaining sessions, or outstanding debt.

## Branch workflow

- `main` is the development integration branch and should contain the complete current work.
- `Deploy` represents the customer-facing deployed state and should advance only when a release is approved.
- Create short-lived feature branches from `main`; merge them back after builds and tests pass.
- Promote an approved `main` commit to `Deploy` instead of developing directly on `Deploy`.

## Security notes

- Never commit `.env` files, JWTs, database URLs, passwords, system secrets, or webhook credentials.
- Never place secrets in screenshots, logs, documentation, commits, or issue reports.
- Rotate exposed or shared development credentials before deployment.
- Keep tenant data isolated by using models returned from the request-scoped `db(req)` helper.
