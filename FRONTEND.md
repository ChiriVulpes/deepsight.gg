## Core Rule
Use the local frontend systems:
- kitsui owns components, state, lifecycle, and interaction.
- Chiri owns styles and typed component class names.
- Weaving owns user-facing text and typed translation keys.

Do not replace these with React-style, framework-generic, Tailwind-style, or plain imperative DOM rebuild patterns unless a plan explicitly approves that.

## Kitsui Components
Build UI with `Component(...)` and chain local operations:
- `.style(...)` for semantic class names
- `.append(...)`, `.appendTo(...)`, `.prependTo(...)`, `.insertTo(...)` for tree structure
- `.tweak(...)` for focused local configuration
- `.and(...)` to apply another component builder/extension
- `.extend<...>()` for public component APIs
- `.extendJIT(...)` for lazily-created subcomponents or rehosted APIs

Prefer explicit extension interfaces for reusable components. Components such as `Button`, `Checkbox`, `Paginator`, and `View` expose their public surface through typed extension interfaces instead of ad hoc properties.

For example, base components commonly expose:
- readonly state handles
- child component handles such as labels or wrappers
- chainable methods that return `this`
- bound disabled/active/loading APIs

Keep component APIs narrow and typed.

## State
Use kitsui state instead of manual DOM synchronization.

Common patterns:
- `State(...)` for local mutable state
- `State.Mutable(...)` when an explicit mutable wrapper is needed
- `.map(...)` and `State.Map(...)` for derived values
- `State.Use(...)` to gather several state values for a render/update block
- `State.Async(...)` for async data
- `.use(...)` and `.useManual(...)` for subscriptions tied to a component or owner

Bind UI directly to state:
- `.text.bind(...)`
- `.style.bind(...)`
- `.style.bindFrom(...)`
- `.style.bindVariable(...)`
- `.attributes.bind(...)`
- `.appendToWhen(...)`
- `.appendWhen(...)`

Tie state ownership to a component, view, or explicit owner so subscriptions clean up when the UI is removed.

## Conditional Rendering
Use kitsui slots for conditional or data-driven regions:
- `Slot`
- `DisplaySlot`
- `.if(...).else(...)`
- `.use(...)`

For large dynamic lists or expensive views, prefer keyed incremental rendering with `Breakdown` and `Part(...)`. Stable keys are important. They let the UI update or move existing parts instead of throwing away a large tree.

When filtering list items, prefer moving hidden items into a store slot or deciding destination at append/insert time. Avoid destroying and rebuilding the whole view for routine filter changes.

## Async and Loading
Use `State.Async`, kitsui `Loading`, or the local `View.loading` API for async work.

Respect abort signals in view-level loading. If an async view receives a signal and it is aborted, stop appending or updating that view.

For large renders, yield intentionally:
- use `Task.yield()` for cooperative rendering
- use short sleeps only when a view intentionally lets initial UI settle

Do not block the UI with one huge synchronous render if the local pattern already supports incremental work.

## Chiri Styles
Chiri owns styles. Add or update `.chiri` files near the relevant component or view style area.

Use semantic class names that match component structure. TypeScript component code and Chiri classes are connected through generated typings, so class names are not loose strings.

Do not hand-edit generated Chiri declaration files. Change the `.chiri` source and let the approved watcher/build process update generated types.

## Weaving Text
Weaving quilt files own user-facing text.

Use quilt handlers for labels, descriptions, loading messages, action text, errors, and UI copy. Do not hardcode user-facing prose in components unless it is temporary dev-only text.

Translation keys are strongly typed. If TypeScript does not know a key yet, update the `.quilt` source and let the approved watcher/build process update generated types. Do not hand-edit generated translation declaration files.

## Patterns From Existing Components
Use these deepsight.gg project examples as references:
- `InventoryView`: large async view, `State.Async`, `Slot`, `Breakdown`, keyed `Part(...)`, display/filter integration, and incremental rendering.
- `ItemTooltip`: dense state-bound UI composition, tooltip lifecycle, conditional sections, derived display state, and nested source/perk rendering.
- `Item`: compact visual component with state-derived styles, tooltip application, image/watermark layers, and contextual behavior.
- `Checkbox`: base component with explicit extension interface, internal state, bound styles, and label handle.
- `Button`: base component with typed disabled-state API, bound attributes, and rehosted text.
- `Paginator`: reusable async component with internal state, page caching, loading indicator, buttons, and display dots.
- `View`: page-level lifecycle, loading API, lazy subcomponents, navbar/display bar coordination, and transition-aware rendering.

When adding new UI, match the closest local pattern before inventing a new one.
