## Frontend Work
Before editing kitsui components, Chiri styles, or Weaving translation files, read `FRONTEND.md`.

Use the local frontend systems:
- kitsui for components, state, lifecycle, and interaction
- Chiri for styles
- Weaving quilt files for user-facing text

## Command Hygiene
Validation commands must be non-emitting unless the user explicitly approves an emitting build or generation step.

Use this non-emitting check for deepsight.gg:
- `pnpm exec tsc -p src\tsconfig.json --noEmit --incremental false`

Do not use task wrappers such as `npx task ts`, `pnpm task ts`, or build/watch/generation commands as validation unless the user has explicitly approved files being emitted or regenerated.
