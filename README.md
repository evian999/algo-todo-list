# Algo Todo

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_Flow-Canvas-1488C6?logo=react&logoColor=white" alt="Canvas" />
  <img src="https://img.shields.io/badge/Vercel-Ready-000000?logo=vercel&logoColor=white" alt="Vercel" />
</p>

**Algo Todo** is a dark, ComfyUI-inspired task workspace for **algorithm engineers**: switch between a crisp **list mode** (newest first, folders, tags) and a **node-graph canvas** where tasks connect like experiment pipelines. Data is stored **per logged-in user**: JSON under `data/stores/<userId>.json` locally, or **Upstash Redis** on Vercel when `UPSTASH_REDIS_REST_*` is set (see Deploy).

<p align="center">
  <strong>List</strong> · <strong>Canvas</strong> · <strong>Folders & tags</strong> · <strong>Auth</strong>
</p>

---

## Why it feels good

- **Dual mode**: keyboard `L` / `C` to jump between list and `@xyflow/react` canvas.
- **Folders & tags**: left sidebar in list view; canvas lanes group tasks by folder; filter from the canvas toolbar.
- **Completion flow**: mark done → capture **results** and **next steps** (link to existing tasks or spawn new ones); edges stay in sync on the graph.
- **Dark “node editor” aesthetic**: grid, cyan accents, glassy panels—built for long evening sessions.
- **Lightweight persistence**: `PATCH /api/data` saves JSON per user (`data/stores/…` locally, or **Redis** on serverless). Without Redis on Vercel, data is not durable across deploys.

---

> **Production:** set a strong `AUTH_SECRET` (used to sign session JWTs). The repo ships with a dev fallback—**do not** rely on it in production.

Optional env vars `DEFAULT_AUTH_USERNAME` and `DEFAULT_AUTH_PASSWORD` seed the **first** account when no user store exists (password is stored **hashed**). Use strong values and never commit them.

---

## Quick start

```bash
npm ci
cp .env.example .env.local
# edit .env.local — at minimum set AUTH_SECRET for anything public-facing
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/login`.

---

## Environment variables

| Variable                     | Required on Vercel | Description                                      |
| ---------------------------- | ------------------ | ------------------------------------------------ |
| `AUTH_SECRET`                | **Strongly yes**   | Secret for signing `algo-token` JWT.             |
| `UPSTASH_REDIS_REST_URL`     | **Yes for durable data** | Upstash REST URL ([Redis](https://upstash.com/) free tier works). |
| `UPSTASH_REDIS_REST_TOKEN`   | **Yes for durable data** | Upstash REST token.                             |
| `DEFAULT_AUTH_USERNAME`      | No                 | Bootstrap username when the user store is empty. |
| `DEFAULT_AUTH_PASSWORD`      | No                 | Bootstrap password (hashed before save).         |

---

## Push to your GitHub (public)

From the project root (after [installing GitHub CLI](https://cli.github.com/)):

```bash
gh auth login
git remote add origin https://github.com/YOUR_USERNAME/algo-todo-list.git
git push -u origin main
```

Or create the repo and push in one step:

```bash
gh auth login
gh repo create algo-todo-list --public --source=. --remote=origin --push
```

Replace `algo-todo-list` with another name if that slug is taken.

---

## Deploy on Vercel

1. Push this repo to GitHub (section above).
2. [Import the project](https://vercel.com/new) in Vercel (log in with GitHub).
3. Add **Environment Variables**:
   - `AUTH_SECRET` = long random string (e.g. `openssl rand -base64 32`).
   - **Persistence:** create a free [Upstash](https://upstash.com/) Redis database, then add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the Upstash console (REST API section). Without these, each deployment uses a fresh in-memory store and your tasks/tags/folders disappear after redeploy or cold start.
4. Deploy.

CLI alternative (after `npm i -g vercel` and `vercel login`):

```bash
vercel --prod
```

Set `AUTH_SECRET` in the Vercel project **Settings → Environment Variables** for Production.

**Why data vanished before:** Vercel has no writable persistent disk for serverless functions. The app now supports **Upstash Redis** so `GET`/`PATCH /api/data` read and write a JSON blob per user (`algo-todo:v1:<userId>`). Configure both Redis env vars on Vercel for production use.

---

## Scripts

| Command       | Description        |
| ------------- | ------------------ |
| `npm run dev` | Turbopack dev server |
| `npm run build` | Production build   |
| `npm run start` | Start production server |
| `npm run lint`  | ESLint             |

---

## Project structure (high level)

```
src/
  app/
    (auth)/login, register    # Auth UI
    (dashboard)/              # Main app at /
    api/auth/*                # login, register, logout
    api/data                  # JSON per user; Redis on Vercel when configured
  components/                 # List, canvas, sidebar, nodes
  lib/                        # Zustand store, users, session (jose), validation
  middleware.ts               # JWT gate for / and /api/data
data/                         # Local JSON (gitignored when generated)
```

---

## 中文摘要

**Algo Todo** 是面向算法工程师的待办应用：支持**列表 / 画布**双模式、**文件夹与标签**、完成时记录**结果与下一步**并在画布上显示连线。已加入 **登录 / 注册**（密码服务端哈希存储；请自行注册或通过环境变量配置引导账户，勿在仓库中公开口令）。本地数据按用户写在 `data/stores/<用户 id>.json`（兼容旧版 `data/store.json`）。部署到 **Vercel** 须配置 **`AUTH_SECRET`**，并配置 **Upstash Redis** 的 `UPSTASH_REDIS_REST_URL` 与 `UPSTASH_REDIS_REST_TOKEN`，否则无服务器环境只有临时内存，**每次重新部署或冷启动后数据会丢**。

---

## License

MIT（如未特别指定，可按你的仓库策略自行添加 `LICENSE` 文件。）

---

<p align="center">
  Built with curiosity for people who think in graphs and ablations.
</p>
