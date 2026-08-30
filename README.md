# task-manager

Chichi's dental task manager.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel with shared storage

This app uses a Vercel serverless API route at `/api/tasks` and stores tasks in a Vercel Redis-compatible store using the REST API environment variables.

1. Create a Vercel project from this repository.
2. Add a Redis storage integration from the Vercel Marketplace.
3. Make sure the project has these environment variables from the Redis integration:
   - `KV_REST_API_URL` or `UPSTASH_REDIS_REST_URL`
   - `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_TOKEN`
4. Optional: override the built-in shared login with:
   - `APP_USERNAME`
   - `APP_PASSWORD`

If the optional login variables are not set, the default login is username `Dr Carla` and password `ilovemysensen`.

Use these Vercel build settings:

```text
Framework preset: Vite
Install command: npm install
Build command: npm run build
Output directory: dist
```
