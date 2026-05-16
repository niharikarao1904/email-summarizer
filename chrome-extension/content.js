chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractText') {
    const text = extractVisibleText();
    sendResponse({ text });
  }
  return true;
});

function extractVisibleText() {
  const textContent = document.body?.innerText || '';
  return textContent.replace(/\s+/g, ' ').trim();
}