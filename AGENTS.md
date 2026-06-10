## Frontend Work
Before editing kitsui components, Chiri styles, or Weaving translation files, read `FRONTEND.md`.

Use the local frontend systems:
- kitsui for components, state, lifecycle, and interaction
- Chiri for styles
- Weaving quilt files for user-facing text

## Kitsui Component Events In App Code

When adding custom events to a Kitsui component in deepsight.gg, follow the current kitsui `Component.WithEvents` pattern. Prefer a typed component-local event over callback state when the parent component should own the behavior.

For non-generic component builders whose output type is not inferred, set the output type on the `Component<Params, Output>(...)` call. Do not introduce a public builder namespace unless the component has a generic public call signature.

## Command Hygiene
Validation commands must be non-emitting unless the user explicitly approves an emitting build or generation step.

Use this non-emitting check for deepsight.gg:
- `pnpm exec tsc -p src\tsconfig.json --noEmit --incremental false`

Run lint in parallel with the TypeScript validation command:
- `pnpm exec lint`

Do not use task wrappers such as `npx task ts`, `pnpm task ts`, or build/watch/generation commands as validation unless the user has explicitly approved files being emitted or regenerated.
