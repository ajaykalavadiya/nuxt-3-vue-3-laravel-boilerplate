# Acme SaaS demo

Login + Product & Category CRUD, built three ways on one API:

| Folder   | Stack                                          | URL                     |
| -------- | ---------------------------------------------- | ----------------------- |
| `crud/`  | Laravel 13 REST API, Sanctum bearer tokens      | http://localhost:8000   |
| `vue3/`  | Vue 3 + Vite SPA, TypeScript, Pinia, vue-router, SCSS | http://localhost:5173 |
| `nuxt3/` | Nuxt 3 (SSR), TypeScript, SCSS                  | http://localhost:3000   |

Demo login: **demo@example.com / password**

## Run

```bash
# API (SQLite by default; set DB_* in crud/.env for MySQL)
cd crud && php artisan migrate:fresh --seed && php artisan serve --port=8000

cd vue3  && npm run dev -- --port 5173
cd nuxt3 && npm run dev -- --port 3000
```


## API

| Method | Path                  | Auth | Notes                                   |
| ------ | --------------------- | ---- | --------------------------------------- |
| POST   | `/api/login`          | –    | `{email, password}` → `{token, user}`; throttled 6/min |
| GET    | `/api/me`             | ✓    | current user                            |
| POST   | `/api/logout`         | ✓    | revokes current token                   |
| GET    | `/api/categories`     | ✓    | `?search=&page=&per_page=` paginated, with `products_count`; `?all=1` for the full list |
| POST   | `/api/categories`     | ✓    | create (`name` unique per user)         |
| GET/PUT/DELETE | `/api/categories/{id}` | ✓ | owner only; delete leaves its products uncategorised |
| GET    | `/api/products`       | ✓    | `?search=&category_id=&page=&per_page=` paginated |
| POST   | `/api/products`       | ✓    | create                                  |
| GET/PUT/DELETE | `/api/products/{id}` | ✓ | owner only (403 otherwise)          |

Send `Authorization: Bearer <token>` and `Accept: application/json`. Validation errors come back as Laravel's 422 `{message, errors}` and are shown inline in both frontends. Products and categories are scoped per user via `ProductPolicy` / `CategoryPolicy`; a product's optional `category_id` must be one of the user's own categories.

## Frontend layout

Both apps share the same SCSS design system (`assets/styles/_variables.scss` tokens + mixins auto-injected into every component, `main.scss` for buttons/forms/cards) and the same `ProductForm`, `BasePagination`, `StatusBadge` components and `types/`.

- **vue3**: `lib/http.ts` (fetch wrapper + `ApiError`), `api/*` services, `stores/auth.ts` (Pinia, token in localStorage), router guard in `router/index.ts`.
- **nuxt3**: `plugins/api.ts` provides `$api` (`$fetch` with bearer token), `composables/useAuth.ts` (token in a cookie so SSR can fetch as the user), `middleware/auth.global.ts` (every page requires auth unless `definePageMeta({ guestOnly: true })`), list filters live in the URL query.

## Tests

| Layer | Tool | Command | Covers |
| ----- | ---- | ------- | ------ |
| API | Pest | `cd crud && php artisan test` | auth, CRUD, validation, ownership (403) |
| Unit / component | Vitest + Vue Test Utils | `cd vue3 && npm test` | `http` client, auth store, forms, pagination, badge |
| End-to-end | Playwright | `cd e2e && npm test` | login/logout/redirects, product + category CRUD in a real browser, run against **both** Vue and Nuxt |

The Playwright run starts its own isolated stack (API :8001 with a fresh `crud/database/e2e.sqlite`, Vue :5174, Nuxt production build :3001), so it doesn't touch your dev servers or data. First time: `cd e2e && npm i && npx playwright install chromium`. Use `npm run test:ui` to debug, `npm run report` for the HTML report.

Type-check: `cd vue3 && npm run build`, `cd nuxt3 && npx nuxi typecheck`.

