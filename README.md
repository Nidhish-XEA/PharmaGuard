# PharmaGuard

Separated full-stack project:

- `frontend/` - React + Vite + Tailwind landing app
- `backend/` - FastAPI pharmacogenomic analysis API

## Run backend

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Run frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend expects backend at `http://127.0.0.1:8000` by default.
Set `VITE_API_BASE_URL` if needed.

## Deploy (Recommended)

### 1) Deploy Backend to Render

1. Push this repo to GitHub.
2. Open Render: [https://render.com](https://render.com)
3. Click **New +** -> **Blueprint**.
4. Select your repo.
5. Render will detect `render.yaml` and create service `pharmaguard-api`.
6. Click deploy.
7. After deploy, copy your backend URL:
   - Example: `https://pharmaguard-api.onrender.com`

Optional env vars on Render:
- `OPENAI_API_KEY` (if you want AI explanation calls)

### 2) Deploy Frontend to Vercel

1. Open Vercel: [https://vercel.com](https://vercel.com)
2. Click **Add New...** -> **Project**.
3. Import the same GitHub repo.
4. Set **Root Directory** to `frontend`.
5. Set environment variable:
   - `VITE_API_BASE_URL` = your Render API URL (for example `https://pharmaguard-api.onrender.com`)
6. Deploy.

`frontend/vercel.json` is included for SPA routing.

### 3) Verify

- Frontend URL opens.
- Health check works: `https://<your-render-api>/api/health`
- Upload + Analyze works from UI.

## Troubleshooting

- If frontend cannot reach backend, confirm `VITE_API_BASE_URL` on Vercel and redeploy.
- If backend sleeps on free tier, first request may be slow.
- If AI explanation fails, set `OPENAI_API_KEY` in Render.
