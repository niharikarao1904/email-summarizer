import os
import requests
from typing import Optional


class Summarizer:
    """Summarizer that delegates inference to the Hugging Face Inference API.

    It uses the `HF_TOKEN` environment variable if present (recommended).
    """

    def __init__(self, model_name: str = "sshleifer/distilbart-cnn-12-6"):
        self.model_name = model_name
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model_name}"
        self.headers = {}
        self._ready = False

    def load_model(self):
        token = os.environ.get("HF_TOKEN") or os.environ.get("HF_API_TOKEN")
        if token:
            self.headers = {"Authorization": f"Bearer {token}"}
        else:
            self.headers = {}

        # Try a quick availability check (does not guarantee future requests)
        try:
            resp = requests.get(self.api_url, headers=self.headers, timeout=10)
            # treat any 2xx/3xx/401/403 as the service being reachable (401/403 mean auth required)
            if resp.status_code < 500:
                self._ready = True
            else:
                self._ready = False
        except Exception:
            # allow the service to run; errors will be surfaced on inference
            self._ready = True

    def is_ready(self) -> bool:
        return self._ready

    def summarize(self, text: str, max_length: int = 100, min_length: int = 30) -> str:
        if not self._ready:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        if not text:
            return ""

        if len(text) > 10000:
            text = text[:10000]

        payload = {
            "inputs": text,
            "parameters": {
                "max_new_tokens": max_length,
                "max_length": max_length + 50,
                "min_length": min_length,
                "do_sample": False,
                "num_beams": 4,
            },
        }

        try:
            resp = requests.post(self.api_url, headers=self.headers, json=payload, timeout=120)
            resp.raise_for_status()
            data = resp.json()

            # Common response shapes:
            #  - list of dicts: [{"generated_text": "..."}]
            #  - dict with keys
            if isinstance(data, list) and len(data) > 0:
                item = data[0]
                return item.get("summary_text") or item.get("generated_text") or str(item)

            if isinstance(data, dict):
                return data.get("summary_text") or data.get("generated_text") or str(data)

            return str(data)
        except Exception as e:
            raise RuntimeError(f"Inference API request failed: {e}")