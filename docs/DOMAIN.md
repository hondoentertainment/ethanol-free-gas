# Custom domain setup

1. Vercel → Project → **Settings → Domains** → add your domain (e.g. `e0finder.com`).
2. Update DNS at your registrar per Vercel instructions.
3. Update Supabase Auth:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`
4. Update `metadataBase` in `src/app/layout.tsx` and `src/app/sitemap.ts`.
5. Re-run OAuth app redirect URLs (Google/GitHub) if using social login.

Optional apex redirect in Vercel: www → apex or vice versa.
