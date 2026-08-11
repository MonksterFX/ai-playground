## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Database

Two SQLite databases, each with its own Drizzle config and migration folder:

| Database | Config | Migrations | Default path | Env var |
|---|---|---|---|---|
| Observability | `drizzle.config.observability.ts` | `drizzle/observability/` | `data/observability.db` | `OBSERVABILITY_DB_PATH` |
| Shop | `drizzle.config.shop.ts` | `drizzle/shop/` | `data/shop.db` | `SHOP_DB_PATH` |

**Generate a named migration** (always supply `--name`):

```
npm run db:generate:observability -- --name=<description>
npm run db:generate:shop -- --name=<description>
```

**Apply pending migrations** (also runs automatically on app startup):

```
npm run db:migrate:observability
npm run db:migrate:shop
```

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
