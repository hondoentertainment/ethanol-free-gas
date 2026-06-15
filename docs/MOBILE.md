# Mobile strategy

E0 Finder is a **Progressive Web App (PWA)** — the recommended mobile experience for this project.

## Install on your phone

### iOS (Safari)
1. Open https://ethanol-free-gas.vercel.app
2. Tap Share → **Add to Home Screen**
3. Launch from the home screen icon

### Android (Chrome)
1. Open the site in Chrome
2. Tap **Install** when prompted, or Menu → **Install app**

The app caches station data for offline use and supports fuel alerts when signed in.

## Why PWA instead of native apps?

- One codebase for web and mobile
- Instant updates without app store review
- Full map, route search, and community features
- Works on iOS and Android today

## Future: native wrappers

If app store distribution is needed later, wrap this PWA with [Capacitor](https://capacitorjs.com/) or ship React Native clients against the same `/api/v1/stations` licensed API.

## Apple Sign-In

Enable the Apple provider in Supabase Auth and configure your Apple Developer Services ID with redirect URL:

`https://ethanol-free-gas.vercel.app/auth/callback`
