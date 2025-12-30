# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` contains the Next.js App Router pages, layouts, and global styles.
- `src/lib/` holds shared utilities such as database setup (`src/lib/db.ts`).
- `public/` stores static assets served at the site root (e.g., `/logo.png`).
- Top-level config files (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`) define framework and tooling settings.

## Build, Test, and Development Commands
- `pnpm dev`: run the local dev server at `http://localhost:3000`.
- `pnpm build`: compile the production build.
- `pnpm start`: serve the production build locally.
- `pnpm lint`: run ESLint checks.
- `pnpm db:generate`: generate Drizzle artifacts from schema files.
- `pnpm db:push`: push schema changes to the database.

## Coding Style & Naming Conventions
- TypeScript + React (Next.js App Router) with 2-space indentation.
- Use PascalCase for React components and camelCase for variables/functions.
- Keep route segments and folders lowercase (`src/app/employees/page.tsx`).
- Tailwind CSS is enabled; prefer utility classes over custom CSS.

## Testing Guidelines
- No test framework is configured yet. If adding tests, document the runner and add a `pnpm test` script.
- Place tests alongside code or in a `tests/` directory, and keep names descriptive (e.g., `employee-barcode.test.ts`).

## Commit & Pull Request Guidelines
- Current history contains only an `init` commit, so no established convention exists yet.
- Use imperative, short commit subjects (e.g., "Add barcode generator form").
- PRs should include a brief description of changes, any relevant screenshots for UI updates, and linked issues when applicable.

## Configuration & Environment
- Database access uses `DATABASE_URL` (see `src/lib/db.ts`); set it in your local environment before running DB commands.
- Keep secrets out of the repo; use `.env.local` for local development.
