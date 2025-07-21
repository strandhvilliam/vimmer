# Agent Guidelines for Vimmer

## Build/Test Commands

- **Root**: `bun format` (prettier), `bun dev` (SST development), `bun deploy:prod` (production)
- **Web**: `cd apps/web && bun lint`, `bun build`, `bun dev`
- **Tests**: `cd packages/validation && bun test` (uses Bun test runner)
- **Single test**: `cd packages/validation && bun test validator.test.ts`

## Code Style

- **TypeScript**: Use interfaces over types, avoid enums (use maps), functional components
- **Imports**: Import UI from `@vimmer/ui`, validation from `@vimmer/validation`, API from `@vimmer/api`
- **Naming**: lowercase-with-dashes for directories, descriptive variables with auxiliary verbs
- **Functions**: Use `function` keyword for pure functions, avoid unnecessary curly braces
- **React**: Minimize `use client`, prefer RSC, wrap client components in Suspense
- **Styling**: Tailwind CSS mobile-first, Shadcn UI components, font-rocgrotesk for headers
- **Data**: TRPC for queries/mutations, nuqs for URL state, limit server actions
- **Package Manager**: Use Bun for all operations

## Error Handling

- Use Zod for validation, proper TypeScript error types, avoid generic error messages

## Monorepo Structure

- Apps: `apps/web` (Next.js), `apps/api` (Hono/TRPC)
- Packages: `@vimmer/ui`, `@vimmer/validation`, `@vimmer/supabase`
- Services: Lambda functions in `services/`
