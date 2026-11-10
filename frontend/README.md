# InvoiceIQ frontend

Next.js (App Router) + shadcn/ui + Tailwind CSS v4.

```bash
cp .env.example .env.local   # API_URL=http://localhost:8000
npm install
npm run dev                  # http://localhost:3000
```

| Script              | Purpose                                |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Dev server (Turbopack)                 |
| `npm run build`     | Production build                       |
| `npm run lint`      | ESLint (next/core-web-vitals)          |
| `npm run typecheck` | Route type generation + `tsc --noEmit` |
| `npm run format`    | Prettier (with Tailwind class sorting) |

## Conventions

- **Data flow.** Server Components fetch invoices (`src/lib/server-api.ts`) and stream them behind `<Suspense>`. Interactive client components call the backend through `src/lib/api.ts`. `/api/v1/*` is rewritten to FastAPI in `next.config.ts`, so the browser needs neither CORS nor a public backend URL.
- **Types.** `src/lib/types.ts` mirrors the FastAPI response models (camelCase).
- **UI.** shadcn/ui primitives live in `src/components/ui`. Add more with `npx shadcn@latest add <component>`; `components.json` is configured. Feature components live in `src/components/<feature>`.
- **Theme.** Design tokens are CSS variables in `src/app/globals.css` (dark by default; includes `success`/`warning` tokens).
