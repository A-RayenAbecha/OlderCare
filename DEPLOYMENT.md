# Deployment Notes

This project now has a Next.js + Supabase/PostgreSQL version for Vercel.

The previous Spring Boot source is still kept in `src/main` for reference, but `.vercelignore` excludes it from Vercel uploads so Vercel deploys the Next.js app from the repository root.

## Vercel Environment Variables

Set these in Vercel Project Settings > Environment Variables:

```properties
SUPABASE_DB_URL=jdbc:postgresql://your-supabase-pooler-host:5432/postgres?sslmode=require
SUPABASE_DB_USERNAME=postgres.your-project-ref
SUPABASE_DB_PASSWORD=your-supabase-password
JWT_SECRET=your-long-random-secret
```

You can also use one Node-friendly variable instead:

```properties
POSTGRES_URL=postgresql://postgres.your-project-ref:your-password@your-supabase-pooler-host:5432/postgres?sslmode=require
JWT_SECRET=your-long-random-secret
```

## Local Commands

```powershell
npm install
npm run dev
```

## Production Build

```powershell
npm run build
```
