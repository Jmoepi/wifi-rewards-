# Technical Notes

## 1. Architecture

The project follows a feature-based structure with clear separation of concerns:

```
src/
  app/
    (protected)/       # Authenticated route group
      layout.tsx       # Shared nav bar with logout
      dashboard/       # Main dashboard page + client components
      history/         # Transaction history (server-rendered)
    api/               # Route handlers for all API endpoints
    login/             # Public auth pages
    register/
  lib/
    prisma.ts          # Prisma client singleton
    session.ts         # JWT session management (encrypt/decrypt/cookies)
    dal.ts             # Data Access Layer for auth verification
    actions/auth.ts    # Server Actions for register/login/logout
```

The `(protected)` route group ensures all child routes share the authenticated layout without affecting the URL structure.

## 2. Authentication

- **Implementation**: Custom JWT-based authentication using `jose` for token signing/verification, stored in HTTP-only cookies.
- **Why**: A custom implementation is simpler to explain and audit than a full library like NextAuth.js. HTTP-only cookies prevent XSS attacks since JavaScript cannot access the token. The `jose` library is edge-compatible and lightweight.
- **Flow**: Register/Login -> Server Action validates credentials -> `createSession()` signs JWT and sets cookie -> `proxy.ts` (Next.js 16 route handler) checks session on every request -> Protected pages call `verifySession()` in the DAL.
- **Route Protection**: Uses Next.js 16's `proxy.ts` for optimistic route checks (cookie-only, no DB calls) plus server-side `verifySession()` in the DAL for secure checks.

## 3. Database

- **ORM**: Prisma 7 with `@prisma/adapter-libsql` driver adapter
- **Database**: SQLite (zero-configuration, file-based)
- **Why SQLite**: Evaluators can clone the repo and run `npm install && npx prisma db push && npm run dev` without Docker, cloud accounts, or external dependencies.
- **Why Prisma**: End-to-end type safety between the database schema and Next.js. Prisma 7 requires driver adapters for SQLite, so `@prisma/adapter-libsql` is used.
- **Schema**: Two models - `User` (id, name, email, passwordHash, sbBalance) and `Transaction` (id, userId, bundleId, bundleName, cost, createdAt) with a one-to-many relationship and cascade delete.

## 4. Server vs Client Components

**Server Components (data fetching, layouts, pages)**:
- `dashboard/page.tsx` - Fetches user profile directly from the database, eliminating client-side loading waterfalls
- `history/page.tsx` - Queries transactions directly on the server for immediate rendering
- `(protected)/layout.tsx` - Server-rendered navigation bar

**Client Components (interactive islands only)**:
- `login/page.tsx` & `register/page.tsx` - Forms with `useActionState` for validation feedback and pending states
- `bundle-list.tsx` - Fetches bundles from API, manages redeem flow with `useTransition` for non-blocking UI during the 1.5s API delay
- `balance-admin.tsx` - Controlled inputs with optimistic state updates after successful PATCH

This split minimizes JavaScript sent to the client while keeping interactive elements responsive.

## 5. Improvements

If given another day I would add the following:

- **Rate Limiting**: rate limiting on auth endpoints to prevent brute-force attacks
- **Pagination**:  paginated table controls and date/bundle filtering on the Transaction History page
