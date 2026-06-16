# Custom domain setup

## 1. Add domain in Vercel

Vercel → Project → **Settings → Domains** → add your domain (e.g. `e0finder.com`).

Follow DNS instructions at your registrar (A/CNAME records or Vercel nameservers).

## 2. Set canonical URL

Add to `.env.local` and Vercel production:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Then:

```bash
npm run env:push
```

This updates:

- `metadataBase` and Open Graph URLs in `src/app/layout.tsx`
- `sitemap.xml` and `robots.txt`
- Alert email links in `src/lib/alerts/dispatch.ts`

No code changes required when using `NEXT_PUBLIC_SITE_URL`.

## 3. Update Supabase Auth

Authentication → URL configuration:

| Setting | Value |
|---------|-------|
| Site URL | `https://yourdomain.com` |
| Redirect URLs | `https://yourdomain.com/auth/callback` |

Keep `http://localhost:3000/auth/callback` for local dev.

## 4. OAuth providers

Update redirect URIs in each provider console:

- **Google / GitHub:** Supabase callback remains `https://PROJECT_REF.supabase.co/auth/v1/callback`
- **Apple Services ID:** add `https://yourdomain.com/auth/callback` as return URL

Re-run setup scripts if credentials changed:

```bash
node scripts/setup-google-oauth.mjs
node scripts/setup-github-oauth.mjs
```

## 5. Search Console (optional)

1. Verify domain in Google Search Console
2. Add token to env: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...`
3. `npm run env:push`
4. Submit `https://yourdomain.com/sitemap.xml`

## 6. Email (Resend)

Update `RESEND_FROM_EMAIL` to use your domain. Verify domain in Resend dashboard for deliverability.

## Apex vs www

Configure redirect in Vercel (e.g. `www` → apex or vice versa) under Domains → Edit.
