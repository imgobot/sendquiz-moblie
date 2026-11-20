# AGENTS.md

This Expo app targets Android and iOS only. Web is out of scope.

## Layout

- Use a 16-point horizontal inset for page content on every screen. AppStack applies the shared `PAGE_INSET` to each page. Apply it once at the content boundary of standalone modals and keep nested navigators and page sections free of additional page-level horizontal spacing.

## Tooling and validation

- Use npm and update `package-lock.json` with dependency changes.
- Use TypeScript for type checking and Oxlint for linting.
- Use Vitest for unit tests. Keep `*.test.ts` / `*.test.tsx` beside the code under `src/` or `plugins/` and import test APIs explicitly from `vitest`.
- `npm run typecheck`: check TypeScript, including tests and tooling configurations.
- `npm run lint`: reject errors, warnings, and unused disable directives.
- `npm run lint:fix`: apply Oxlint fixes.
- `npm test`: run unit tests once.
- `npm run verify`: run type checking, linting, and unit tests in sequence.
- Verify native behavior separately on a device or simulator.
