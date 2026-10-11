# Pulse Social App

A modern, responsive social-media feed built with React and Vite. Posts, comments, likes, saved content, and profile details are stored in the browser using `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The production output is generated in `dist/`.

## Deploy on Vercel

1. Upload this project to a GitHub repository.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Vercel should detect **Vite** automatically.
4. Use these settings if prompted:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click **Deploy**.

## Deploy on Render

1. Upload this project to a GitHub repository.
2. In Render, create a **Static Site** and connect the repository.
3. Configure:
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
4. Click **Create Static Site**.

## Notes

- No backend or environment variables are required.
- Data is stored per browser/device in `localStorage`.
- Sample posts load automatically on first use.
