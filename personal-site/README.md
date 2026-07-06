# FAN JUN JIE Personal Site

Next.js 16 personal portfolio for AI product, data analysis, automation tools, and creative engineering work.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Local Checks

```bash
npm run lint
npm run build
```

## GitHub Pages Deployment

The public project site is deployed as a GitHub Pages sub-site:

- Repository: [q2955161835-debug/personal-web](https://github.com/q2955161835-debug/personal-web)
- URL: [https://q2955161835-debug.github.io/personal-web/](https://q2955161835-debug.github.io/personal-web/)

GitHub Actions builds the static export from `personal-site/` with `GITHUB_PAGES=true`, which enables the `/personal-web` `basePath` and asset prefix in `next.config.ts`.

To reproduce the GitHub Pages build locally in PowerShell:

```powershell
$env:GITHUB_PAGES = "true"
npm run build
Remove-Item Env:\GITHUB_PAGES
```

The workflow file is `../.github/workflows/deploy-pages.yml` from this project directory.
