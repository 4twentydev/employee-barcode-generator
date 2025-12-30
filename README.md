# Employee Barcode Labels

Internal web app for creating 3" x 2" Code 128 barcode labels and managing employees.

## Stack
- Next.js 16 (App Router), Tailwind CSS v4
- Neon Postgres + Drizzle ORM
- Zod validation
- Framer Motion for subtle UI animation

## Local Setup
1) Install dependencies
```bash
pnpm install
```

2) Configure environment
```bash
cp .env.example .env.local
```
Set `DATABASE_URL` in `.env.local` (Neon connection string).

3) Run migrations
```bash
pnpm db:push
```

4) Seed data
```bash
pnpm db:seed
```

5) Start dev server
```bash
pnpm dev
```

Open `http://localhost:3000`.

## Scripts
- `pnpm dev` - start dev server
- `pnpm build` - production build
- `pnpm start` - start production server
- `pnpm lint` - lint check
- `pnpm db:generate` - generate migrations from schema
- `pnpm db:push` - push schema to database
- `pnpm db:seed` - seed sample employees

## Database
Schema lives in `db/schema.ts`. Migrations are stored in `db/migrations`. The seed script is `scripts/seed.ts`.

## Printing
The print-only route lives at `/print/[id]` and enforces a 3" x 2" landscape label via `@page` rules. Use the “Print label” button in `/label` to open the print dialog.

## Deploy (Vercel)
1) Push the repo to GitHub.
2) Create a new Vercel project from the repo.
3) Add `DATABASE_URL` to Vercel Environment Variables.
4) Deploy the project.

### Custom Domain
1) In Vercel, add the domain `employees.4twenty.dev`.
2) Update DNS to point to Vercel.
3) Verify SSL and propagation in Vercel before going live.
