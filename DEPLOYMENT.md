# PharmaGuard Deployment

## Local Production Run (Single Service)

1. Install dependencies:
   - `pip install -r requirements.txt`
   - `npm ci`
2. Build frontend:
   - `npm run build`
3. Start API + frontend server:
   - `uvicorn main:app --host 0.0.0.0 --port 8000`

App URL: `http://localhost:8000`

## Docker Deploy

Build image:
- `docker build -t pharmaguard:latest .`

Run container:
- `docker run -p 8000:8000 --env OPENAI_API_KEY=your_key pharmaguard:latest`

## Render Deploy

This repo includes `render.yaml` for Docker deployment.

Manual settings if needed:
- Runtime: Docker
- Port: `8000`
- Environment variable (optional): `OPENAI_API_KEY`
