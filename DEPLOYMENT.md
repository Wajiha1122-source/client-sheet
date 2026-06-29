# Deployment

This is a single Next.js application with PostgreSQL.

## Required environment variables

- `DATABASE_URL`: PostgreSQL connection string.
- `SESSION_SECRET`: Long random secret used to sign login sessions.

## Render

Create a PostgreSQL database first, then create a Web Service from the same Git repository.

- Root Directory: leave blank
- Runtime: Node
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment Variables:
  - `DATABASE_URL`: use the external PostgreSQL connection string from Render
  - `SESSION_SECRET`: a long random string
  - `NODE_ENV`: `production`

After the first deploy, run these commands from Render Shell:

```sh
npm run db:migrate
npm run db:create-ceo -- ceo "ChangeMe123!" "CEO"
```

Change the CEO password after the first login.

## Vercel

Import the same Git repository as a Next.js project.

- Framework Preset: Next.js
- Root Directory: `./`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave blank
- Environment Variables:
  - `DATABASE_URL`: PostgreSQL connection string
  - `SESSION_SECRET`: a long random string
  - `NODE_ENV`: `production`

Run the database setup before logging in. If you use Render PostgreSQL, run the migration and CEO creation in Render Shell, or run them locally with the production `DATABASE_URL` set.
