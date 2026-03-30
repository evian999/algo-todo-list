# Algo Todo

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_Flow-Canvas-1488C6?logo=react&logoColor=white" alt="Canvas" />
  <img src="https://img.shields.io/badge/Vercel-Ready-000000?logo=vercel&logoColor=white" alt="Vercel" />
</p>

**Algo Todo** is a dark, ComfyUI-inspired task workspace for **algorithm engineers**: switch between a crisp **list mode** (newest first, folders, tags) and a **node-graph canvas** where tasks connect like experiment pipelines. Data is stored **per logged-in user**: **Supabase Postgres** (normalized tables) when `SUPABASE_*` is set; otherwise JSON files under `data/stores/<userId>.json` locally, or **Upstash Redis** as a fallback on serverless (see Deploy).

<p align="center">
  <strong>List</strong> · <strong>Canvas</strong> · <strong>Folders & tags</strong> · <strong>Auth</strong>
</p>

---

## Why it feels good

- **Dual mode**: keyboard `L` / `C` to jump between list and `@xyflow/react` canvas.
- **Folders & tags**: left sidebar in list view; canvas lanes group tasks by folder; filter from the canvas toolbar.
- **Completion flow**: mark done → capture **results** and **next steps** (link to existing tasks or spawn new ones); edges stay in sync on the graph.
- **Dark “node editor” aesthetic**: grid, cyan accents, glassy panels—built for long evening sessions.
- **Persistence**: `PATCH /api/data` writes **relational rows** in **Supabase** when configured; otherwise local `data/stores/…` or optional **Redis** JSON blob.

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

| Variable                       | Required on Vercel | Description |
| ------------------------------ | ------------------ | ----------- |
| `AUTH_SECRET`                  | **Strongly yes**   | Secret for signing `algo-token` JWT. |
| `SUPABASE_URL`                 | **Recommended**    | Project URL from [Supabase](https://supabase.com/) → Settings → API. |
| `SUPABASE_SERVICE_ROLE_KEY`    | **Recommended**    | **Server only.** Service role key; never expose to the browser. |
| `UPSTASH_REDIS_REST_URL`       | Optional fallback  | If Supabase is not set, same as before. |
| `UPSTASH_REDIS_REST_TOKEN`     | Optional fallback  | Upstash REST token. |
| `DEFAULT_AUTH_USERNAME`        | No                 | Bootstrap username when the user store is empty. |
| `DEFAULT_AUTH_PASSWORD`        | No                 | Bootstrap password (hashed before save). |

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
   - **Supabase (recommended):** create a project, open **SQL Editor**, run the script in `supabase/migrations/001_app_relational.sql`. Then add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → *service_role*).
   - **Optional fallback:** [Upstash](https://upstash.com/) Redis if you do not use Supabase (`UPSTASH_REDIS_REST_*`).
4. Deploy.

CLI alternative (after `npm i -g vercel` and `vercel login`):

```bash
vercel --prod
```

Set `AUTH_SECRET` in the Vercel project **Settings → Environment Variables** for Production.

**Vercel note:** With **Supabase**, each user’s tasks, folders, tags, groups, edges, and layout live in Postgres tables; `replace_user_app_data` replaces all rows for that user in one transaction. JWT `sub` must match the `user_id` column. Account/password storage is still separate (local file or Redis)—only **todo app payload** uses Supabase here.

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
    api/data                  # Hydrate/patch; Supabase tables or file/Redis fallback
  components/                 # List, canvas, sidebar, nodes
  lib/                        # Zustand store, users, session (jose), validation
  lib/supabase/               # Admin client + load/save relational app data
  middleware.ts               # JWT gate for / and /api/data
data/                         # Local JSON (gitignored when generated)
supabase/migrations/          # Postgres schema + replace_user_app_data()
```

---

## 中文摘要

**Algo Todo** 是面向算法工程师的待办应用：支持**列表 / 画布**双模式、**文件夹与标签**、完成时记录**结果与下一步**并在画布上显示连线。已加入 **登录 / 注册**（密码服务端哈希存储；勿在仓库中公开口令）。**推荐**在 **Vercel** 配置 **`SUPABASE_URL`** 与 **`SUPABASE_SERVICE_ROLE_KEY`**，并在 Supabase SQL 中执行 `supabase/migrations/001_app_relational.sql`，任务/文件夹/标签/连线/画布布局将按用户存入 **Postgres 关系表**（不再用单键 JSON  blob 作为主存储）。未配置 Supabase 时仍可用本地 `data/stores/` 或 **Upstash Redis** 兜底。

---

## License

MIT（如未特别指定，可按你的仓库策略自行添加 `LICENSE` 文件。）

---

<p align="center">
  Built with curiosity for people who think in graphs and ablations.
</p>
