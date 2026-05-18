from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import warnings

warnings.filterwarnings('ignore')

class Summarizer:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self._ready = False

    def load_model(self):
        print('Loading BART-large-CNN model...')
        model_name = 'sshleifer/distilbart-cnn-12-6'
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self._ready = True
        print('Model loaded successfully!')

    def is_ready(self):
        return self._ready

    def summarize(self, text: str, max_length: int = 100, min_length: int = 30) -> str:
        if not self._ready:
            raise RuntimeError('Model not loaded. Call load_model() first.')

        if len(text) > 10000:
            text = text[:10000]

        inputs = self.tokenizer(text, return_tensors='pt', max_length=1024, truncation=True)

        summary_ids = self.model.generate(
            inputs['input_ids'],
            max_length=max_length + 50,
            min_length=min_length,
            do_sample=False,
            num_beams=4,
            early_stopping=True
        )

        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary