from flask import Flask, request, jsonify
from flask_cors import CORS
from summarizer import Summarizer

app = Flask(__name__)
CORS(app)

summarizer = Summarizer()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': summarizer.is_ready()
    })

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text field'}), 400

    text = data['text']
    max_length = data.get('max_length', 100)

    if not text or len(text.strip()) < 50:
        return jsonify({'error': 'Text too short (minimum 50 characters)'}), 400

    original_length = len(text.split())

    try:
        summary = summarizer.summarize(text, max_length)
        summary_length = len(summary.split())

        return jsonify({
            'summary': summary,
            'original_length': original_length,
            'summary_length': summary_length
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print('Starting Smart Email Summarizer API...')
    print('Loading NLP model (this may take a minute on first run)...')
    summarizer.load_model()
    print('Model ready!')
    print('API running at http://localhost:5000')
    app.run(debug=True, host='0.0.0.0', port=5000)