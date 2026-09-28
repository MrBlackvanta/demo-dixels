# Dixels

Client-facing demo of the Dixels super app — one shell linking every product, with a design system derived from the live brand.

## Run

```bash
pnpm install
pnpm dev
```

`pnpm build` writes `dist/`. `pnpm preview` serves that build the way Netlify does.

## Deploy

Netlify, configured in `netlify.toml`. Build `pnpm build`, publish `dist`, with a `/*` → `/index.html` rewrite so deep links survive a refresh.

## Notes

No backend. All CRUD persists to localStorage under the `dixels.v1` namespace — "Reset demo data" in the ⌘K palette clears it.

Vite · React · Tailwind · Radix · Framer Motion · react-router
