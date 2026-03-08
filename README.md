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
