# Fitness API (Flutter backend)

Separate from **RecoveryAI**. FastAPI service: Firebase ID token auth, Firestore for profile/goals, OpenAI for coaching (same prompts as the Streamlit `fitness agent`).

## Run locally

```bash
cd AiModels/FitnessApi
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill OPENAI_API_KEY + FIREBASE_CREDENTIALS_JSON
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

- Health: `GET http://localhost:8001/health`
- Protected routes: `Authorization: Bearer <Firebase ID token>`

### Postman / test without Firebase (optional)

Set env **`FITNESS_API_TEST_BEARER`** to a long random string (e.g. `openssl rand -hex 32`). Then send:

`Authorization: Bearer <that exact string>`

The API treats you as user uid **`FITNESS_API_TEST_UID`** (default `postman_test_user`). `GET /health` includes **`test_bearer_auth_enabled`** when this is on.

**Remove or clear `FITNESS_API_TEST_BEARER` in production** if you only want real Firebase tokens.

## Firestore

Documents: `fitness_backend/{firebase_uid}` with fields `profile`, `goals`, `updated_at`.

Enable Firestore in the same Firebase project as the app; the service account needs Firestore read/write.

## Deploy (AWS App Runner + ECR)

1. Create ECR repository e.g. `fitness-ai-backend`.
2. Add GitHub secret `FITNESSAI_ECR_REPOSITORY` (repository name only).
3. Push to `main` — workflow `.github/workflows/deploy-fitnessai.yml` builds from `AiModels/FitnessApi` and pushes `:SHA`.
4. New App Runner service: image from that ECR repo, port **8000**, health check path **`/health`**.
5. Environment variables: `OPENAI_API_KEY`, `FIREBASE_CREDENTIALS_JSON` (full JSON string). Optional: `FITNESS_API_TEST_BEARER` for Postman-only auth (see above).

Flutter: base URL = App Runner URL, send `Authorization: Bearer` from `getIdToken()`.
