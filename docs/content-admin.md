# Neroviax content administration

## PostgreSQL setup

Articles, affiliate destinations, and click events are stored in PostgreSQL. Configure a connection string:

```text
DATABASE_URL=postgresql://user:password@host:5432/neroviax
```

For a managed database that requires TLS, follow its connection-string instructions, commonly by appending `?sslmode=require`.

`pnpm dev` and `pnpm start` automatically check the target database, create it when PostgreSQL reports that it does not exist, and apply all pending migrations before starting Next.js. You can run the same bootstrap manually:

```powershell
pnpm db:setup
pnpm db:check
```

For an existing database, no `CREATE DATABASE` privilege is required. To create a missing database, the configured user needs that privilege and access to the default `postgres` maintenance database. If the maintenance credentials or host differ, set `POSTGRES_MAINTENANCE_URL`; it is used only for database creation. Migrations are tracked in the `schema_migrations` table and are safe to run again. The initial seed uses `ON CONFLICT DO NOTHING`, so it does not overwrite content edited in admin.

## Administrator login

Set a long, unique password and a random session secret in the server environment:

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-long-unique-password
ADMIN_PASSWORD_KEY=a-random-password-key-with-at-least-32-bytes
AUTH_SECRET=a-random-secret-with-at-least-32-bytes
```

Generate `ADMIN_PASSWORD_KEY` and `AUTH_SECRET` separately with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Run the command twice and use two different results. `ADMIN_PASSWORD` is intentionally stored as plaintext in the server environment. Keep `.env` out of source control and restrict access to production environment variables. During login, both password values are converted to HMAC digests keyed by `ADMIN_PASSWORD_KEY` before a constant-time comparison. `AUTH_SECRET` is used only to sign the session. Sign in at `/admin/login`. Successful sessions use a signed, `HttpOnly`, `SameSite=Strict` cookie that expires after eight hours.

## Article affiliate shortcode

Affiliate destinations are managed at `/admin/affiliate-links`. Reference a stable affiliate ID from an article's Markdown body:

```md
{{affiliate:hetzner-cloud|Check Hetzner Cloud plans}}
```

Public clicks go through `/go/[id]`. Each click is stored in `affiliate_clicks` before redirecting to `affiliateUrl`; when that field is empty, the official `destinationUrl` is used.
