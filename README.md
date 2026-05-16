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

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `email-summarizer/chrome-extension` folder
5. The extension icon will appear in your toolbar

### 3. Usage

1. Start the backend: `python app.py` (keep running)
2. Click the extension icon in Chrome
3. Navigate to an email or article
4. Click "Extract Page Text" or paste text directly
5. Adjust summary length with the slider
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