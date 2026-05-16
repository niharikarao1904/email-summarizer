const API_URL = 'http://localhost:5000';

// DOM Elements
const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');
const extractBtn = document.getElementById('extractBtn');
const clearBtn = document.getElementById('clearBtn');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const summarizeBtn = document.getElementById('summarizeBtn');
const copyBtn = document.getElementById('copyBtn');
const outputContent = document.getElementById('outputContent');
const summaryText = document.getElementById('summaryText');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// State
let currentSummary = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  updateCharCount();
});

// Event Listeners
inputText.addEventListener('input', () => {
  updateCharCount();
  updateSummarizeButton();
});

lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = `${lengthSlider.value} words`;
});

extractBtn.addEventListener('click', extractPageText);
clearBtn.addEventListener('click', clearInput);
summarizeBtn.addEventListener('click', summarizeText);
copyBtn.addEventListener('click', copyToClipboard);

// Functions
function updateCharCount() {
  const text = inputText.value;
  charCount.textContent = `${text.length} characters`;
}

function updateSummarizeButton() {
  summarizeBtn.disabled = inputText.value.trim().length < 50;
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok') {
        statusDot.className = 'status-dot connected';
        statusText.textContent = data.model_loaded ? 'Ready' : 'Loading model...';
      }
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    statusDot.className = 'status-dot error';
    statusText.textContent = 'Offline';
    showToast('Backend not connected. Start the Python server.', 'error');
  }
}

async function extractPageText() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractTextFromPage
    });

    const text = results[0].result;

    if (!text || text.trim().length < 50) {
      showToast('Could not extract enough text from this page.', 'error');
      return;
    }

    inputText.value = text;
    updateCharCount();
    updateSummarizeButton();
    showToast('Text extracted successfully!', 'success');
  } catch (error) {
    showToast('Failed to extract text. Try pasting manually.', 'error');
  }
}

function extractTextFromPage() {
  const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, span, article, section');
  let text = '';

  elements.forEach(el => {
    const content = el.textContent.trim();
    if (content.length > 30) {
      text += content + ' ';
    }
  });

  return text.trim();
}

function clearInput() {
  inputText.value = '';
  currentSummary = '';
  outputContent.classList.remove('visible');
  emptyState.classList.remove('hidden');
  loadingState.classList.add('hidden');
  copyBtn.disabled = true;
  updateCharCount();
  updateSummarizeButton();
  showToast('Input cleared', 'info');
}

async function summarizeText() {
  const text = inputText.value.trim();

  if (text.length < 50) {
    showToast('Please enter more text to summarize.', 'error');
    return;
  }

  if (text.length > 10000) {
    showToast('Text too long. Truncating to 10000 characters.', 'warning');
    inputText.value = text.substring(0, 10000);
  }

  emptyState.classList.add('hidden');
  loadingState.classList.remove('hidden');
  outputContent.classList.remove('visible');
  summarizeBtn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: inputText.value,
        max_length: parseInt(lengthSlider.value)
      })
    });

    if (!response.ok) {
      throw new Error('Summarization failed');
    }

    const data = await response.json();
    currentSummary = data.summary;
    summaryText.textContent = currentSummary;

    loadingState.classList.add('hidden');
    outputContent.classList.add('visible');
    copyBtn.disabled = false;

    showToast(`Summary generated (${data.summary_length} words)`, 'success');
  } catch (error) {
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
    showToast('Summarization failed. Please try again.', 'error');
  }

  summarizeBtn.disabled = false;
}

async function copyToClipboard() {
  if (!currentSummary) return;

  try {
    await navigator.clipboard.writeText(currentSummary);
    showToast('Summary copied to clipboard!', 'success');
  } catch (error) {
    showToast('Failed to copy. Please try again.', 'error');
  }
}

function showToast(message, type = 'info') {
  toastMessage.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}