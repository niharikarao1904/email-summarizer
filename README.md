# Smart Email Summarizer

AI-powered Chrome extension that summarizes emails and articles using Hugging Face Transformers.

## Setup

### 1. Backend Setup

```bash
cd email-summarizer/backend
pip install -r requirements.txt
python app.py
```

The backend will automatically download the BART-large-CNN model on first run.

### 2. Chrome Extension Setup
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `email-summarizer/chrome-extension` folder
5. The extension icon will appear in your toolbar

### 3. Usage

1. Start the backend: `python app.py` (keep running)
2. Click the extension icon in Chrome
3. Navigate to an email or article
 
 Automated Heroku deploy (GitHub Actions):
 
 - Add the following repository secrets: `HEROKU_API_KEY`, `HEROKU_APP_NAME`, `HEROKU_EMAIL`.
 - Push to `main` and the workflow `.github/workflows/heroku-deploy.yml` will build and release your app on Heroku (it detects the `Dockerfile`).
 
Using Hugging Face Inference API

- Create a Hugging Face token at https://huggingface.co/settings/tokens and save it as `HF_TOKEN`.
- Locally export it before running the app:

```bash
export HF_TOKEN=hf_xxx   # macOS / Linux
setx HF_TOKEN "hf_xxx" # Windows (persistent)
```

- For deployments, add `HF_TOKEN` as an environment variable/secret in your host (Heroku, Render, Cloud Run, or GitHub Actions).

Notes:
- The app now uses the Hugging Face Inference API instead of downloading model weights. This makes containers much smaller and deployments more reliable. If you prefer self-hosting the model (GPU), let me know and I will prepare a GPU-ready deployment.
6. Click "Summarize"
7. Copy the summary or read it directly

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Chrome Popup   │────>│  Flask Backend  │
│ (JavaScript)    │<────│ (Python API)    │
└─────────────────┘     └─────────────────┘
                                │
                        ┌───────▼───────┐
                        │ Hugging Face  │
                        │ BART-CNN Model│
                        └───────────────┘
```

## API Endpoints

- `GET /health` - Check if API and model are ready
- `POST /summarize` - Generate summary
  - Body: `{"text": "...", "max_length": 100}`
  - Response: `{"summary": "...", "original_length": 500, "summary_length": 50}`

## Deployment

Local Docker (recommended):

Build and run the image locally:

```bash
docker build -t email-summarizer:latest .
docker run -p 5000:5000 --rm email-summarizer:latest
```

GitHub Actions → Docker Hub:

- Add repository secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
- Push to `main`; the included workflow builds and pushes `DOCKERHUB_USERNAME/email-summarizer:latest`.

Heroku (quick):

1. Create a new Heroku app.
2. Connect your GitHub repo or push via Git.
3. Ensure the `Procfile` is present (it runs `python app.py`).
4. Set `PYTHONUNBUFFERED=1` and `PORT` if needed in Heroku config.

Notes:

- The model (transformers + torch) will be downloaded on first run and can be large. Allow extra startup time and sufficient memory.
- For production use, consider using a hosted inference endpoint (Hugging Face Inference API, or a GPU-enabled host) to avoid large model downloads and memory usage on each deploy.