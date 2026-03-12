// ===== State =====
let langFrom = 'en';
let langTo = 'ru';
let isListening = false;
let recognition = null;
let transOpen = false;   // transcription panel visibility
let lastTransLang = '';  // language for which we show transcription
let lastOrigText = '';   // original text for transcription
let lastTransResult = ''; // translated text

// ===== DOM =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const input = $('#input');
const counter = $('#counter');
const btnTranslate = $('#btn-translate');
const btnClear = $('#btn-clear');
const btnVoice = $('#btn-voice');
const btnSwap = $('#btn-swap');
const btnSpeakResult = $('#btn-speak-result');
const btnCopy = $('#btn-copy');
const loadingEl = $('#loading');
const errorEl = $('#error');
const results = $('#results');
const translationEl = $('#translation');
const transcriptionEl = $('#transcription');
const transcriptionCard = $('#transcription-card');
const transLabel = $('#trans-label');
const transLoading = $('#trans-loading');
const wordsEl = $('#words');
const breakdownCard = $('#breakdown-card');
const btnToggleTrans = $('#btn-toggle-trans');
const transToggleText = $('#trans-toggle-text');
const autodetectHint = $('#autodetect-hint');
const autodetectText = $('#autodetect-text');

// ===== Language Data =====
const LANGS = {
  en: { flag: '🇬🇧', name: 'Английский' },
  ru: { flag: '🇷🇺', name: 'Русский' },
  fi: { flag: '🇫🇮', name: 'Финский' },
};

const placeholders = { en: 'Type in English...', ru: 'Введи на русском...', fi: 'Kirjoita suomeksi...' };

// ===== Auto-detect language =====
function detectLanguage(text) {
  const TE = window.TranscriptionEngine;
  if (!TE) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Count character types
  const cyrCount = (trimmed.match(/[а-яА-ЯёЁ]/g) || []).length;
  const fiChars = (trimmed.match(/[äöåÄÖÅ]/g) || []).length;
  const latinCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  const total = cyrCount + latinCount + fiChars;
  if (total === 0) return null;

  // If majority is Cyrillic → Russian
  if (cyrCount > latinCount + fiChars) return 'ru';
  // If Finnish-specific characters present → Finnish
  if (fiChars > 0) return 'fi';
  // Otherwise Latin → English
  if (latinCount > cyrCount) return 'en';

  return null;
}

// ===== Dropdown Language Picker =====
let openDropdown = null;

function setupDropdowns() {
  const selectFrom = $('#select-from');
  const selectTo = $('#select-to');
  const dropdownFrom = $('#dropdown-from');
  const dropdownTo = $('#dropdown-to');

  selectFrom.addEventListener('click', (e) => {
    e.stopPropagation();
    if (openDropdown === 'from') { closeDropdowns(); }
    else { closeDropdowns(); openDropdownPanel('from'); }
  });

  selectTo.addEventListener('click', (e) => {
    e.stopPropagation();
    if (openDropdown === 'to') { closeDropdowns(); }
    else { closeDropdowns(); openDropdownPanel('to'); }
  });

  dropdownFrom.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const newLang = opt.dataset.lang;
      if (newLang === langFrom) { closeDropdowns(); return; }
      if (newLang === langTo) {
        langTo = langFrom;
        updateSelectDisplay('to', langTo);
        markActiveOption('dropdown-to', langTo);
      }
      langFrom = newLang;
      updateSelectDisplay('from', langFrom);
      markActiveOption('dropdown-from', langFrom);
      updatePlaceholder();
      closeDropdowns();
    });
  });

  dropdownTo.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const newLang = opt.dataset.lang;
      if (newLang === langTo) { closeDropdowns(); return; }
      if (newLang === langFrom) {
        langFrom = langTo;
        updateSelectDisplay('from', langFrom);
        markActiveOption('dropdown-from', langFrom);
      }
      langTo = newLang;
      updateSelectDisplay('to', langTo);
      markActiveOption('dropdown-to', langTo);
      updatePlaceholder();
      closeDropdowns();
    });
  });
}

function openDropdownPanel(which) {
  const selectEl = which === 'from' ? $('#select-from') : $('#select-to');
  const dropdownEl = which === 'from' ? $('#dropdown-from') : $('#dropdown-to');

  selectEl.classList.add('open');
  dropdownEl.classList.add('open');
  selectEl.setAttribute('aria-expanded', 'true');
  openDropdown = which;

  setTimeout(() => {
    document.addEventListener('click', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
  }, 10);
}

function handleOutsideClick(e) {
  if (e.target.closest('.lang-select-wrap')) return;
  closeDropdowns();
}

function closeDropdowns() {
  $('#select-from').classList.remove('open');
  $('#select-to').classList.remove('open');
  $('#dropdown-from').classList.remove('open');
  $('#dropdown-to').classList.remove('open');
  $('#select-from').setAttribute('aria-expanded', 'false');
  $('#select-to').setAttribute('aria-expanded', 'false');
  openDropdown = null;

  document.removeEventListener('click', handleOutsideClick, true);
  document.removeEventListener('touchstart', handleOutsideClick, true);
}

function updateSelectDisplay(which, lang) {
  const data = LANGS[lang];
  $(`#flag-${which}`).textContent = data.flag;
  $(`#name-${which}`).textContent = data.name;
}

function markActiveOption(dropdownId, activeLang) {
  $(`#${dropdownId}`).querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === activeLang);
  });
}

function updatePlaceholder() {
  input.placeholder = placeholders[langFrom] || 'Введи текст...';
}

// ===== Swap =====
btnSwap.addEventListener('click', () => {
  const tmp = langFrom;
  langFrom = langTo;
  langTo = tmp;

  updateSelectDisplay('from', langFrom);
  updateSelectDisplay('to', langTo);
  markActiveOption('dropdown-from', langFrom);
  markActiveOption('dropdown-to', langTo);

  const translated = translationEl.textContent;
  if (translated && !results.classList.contains('hidden')) {
    input.value = translated;
    counter.textContent = translated.length;
  }
  updatePlaceholder();

  btnSwap.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
  btnSwap.style.transform = 'rotate(180deg)';
  setTimeout(() => { btnSwap.style.transition = 'none'; btnSwap.style.transform = ''; }, 450);
});

// ===== Counter & auto-resize =====
input.addEventListener('input', () => {
  counter.textContent = input.value.length;
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
});

// ===== Clear =====
btnClear.addEventListener('click', () => {
  input.value = '';
  counter.textContent = '0';
  input.style.height = 'auto';
  results.classList.add('hidden');
  errorEl.classList.add('hidden');
  autodetectHint.classList.add('hidden');
  resetTransToggle();
  input.focus();
});

// ===== TTS (Text-to-Speech) =====
const langTTS = { en: 'en-US', ru: 'ru-RU', fi: 'fi-FI' };

function speak(text, lang) {
  if (!('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = langTTS[lang] || 'en-US';
  u.rate = 0.85;
  speechSynthesis.speak(u);
}

btnVoice.addEventListener('click', () => {
  if (input.value.trim()) speak(input.value.trim(), langFrom);
});

btnSpeakResult.addEventListener('click', () => {
  if (translationEl.textContent) speak(translationEl.textContent, langTo);
});

// ===== STT (Speech-to-Text / Voice Input) =====
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    isListening = true;
    btnMic.classList.add('mic-active');
    micIcon.innerHTML = micStopSVG;
  };

  rec.onresult = (e) => {
    let transcript = '';
    for (let i = 0; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    input.value = transcript;
    counter.textContent = transcript.length;
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
  };

  rec.onerror = (e) => {
    console.warn('Speech error:', e.error);
    stopListening();
    if (e.error === 'not-allowed') {
      showError('Разреши доступ к микрофону в настройках');
    }
  };

  rec.onend = () => {
    stopListening();
    if (input.value.trim()) {
      handleTranslate();
    }
  };

  return rec;
}

function startListening() {
  if (!recognition) {
    recognition = setupSpeechRecognition();
  }
  if (!recognition) {
    showError('Голосовой ввод не поддерживается в этом браузере');
    return;
  }

  const sttLang = { en: 'en-US', ru: 'ru-RU', fi: 'fi-FI' };
  recognition.lang = sttLang[langFrom] || 'en-US';

  try {
    recognition.start();
  } catch (e) {
    stopListening();
  }
}

function stopListening() {
  isListening = false;
  btnMic.classList.remove('mic-active');
  micIcon.innerHTML = micSVG;
  try { recognition?.stop(); } catch {}
}

// Mic button SVGs
const micSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="1" width="6" height="11" rx="3"/><path d="M19 10v1a7 7 0 01-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
const micStopSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="1" width="6" height="11" rx="3" fill="currentColor" opacity=".3"/><path d="M19 10v1a7 7 0 01-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;

// Inject mic button into the input bar
const btnMic = document.createElement('button');
btnMic.className = 'icon-btn mic-btn';
btnMic.title = 'Голосовой ввод';
btnMic.setAttribute('aria-label', 'Голосовой ввод');
const micIcon = document.createElement('span');
micIcon.className = 'mic-icon';
micIcon.innerHTML = micSVG;
btnMic.appendChild(micIcon);

const inputBtns = document.querySelector('.input-btns');
if (inputBtns) {
  inputBtns.insertBefore(btnMic, inputBtns.firstChild);
}

btnMic.addEventListener('click', () => {
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
});

// ===== Copy =====
btnCopy.addEventListener('click', async () => {
  const t = translationEl.textContent;
  if (!t) return;
  try {
    await navigator.clipboard.writeText(t);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  btnCopy.classList.add('copied');
  setTimeout(() => btnCopy.classList.remove('copied'), 600);
});

// ===== Translation API (Lingva Translate — primary, MyMemory — fallback) =====
const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://translate.plausibility.cloud',
];

async function translateText(text, from, to) {
  for (const base of LINGVA_INSTANCES) {
    try {
      const url = `${base}/api/v1/${from}/${to}/${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        if (data.translation) return data.translation;
      }
    } catch {}
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}&de=smart-translate-app@mail.com`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка сети — проверь интернет');
  const data = await res.json();
  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    let result = data.responseData.translatedText;
    if (result === result.toUpperCase() && result.length > 3) {
      result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    }
    return result;
  }
  throw new Error('Не удалось перевести текст');
}

// ===== Transcription Toggle (on-demand) =====
function resetTransToggle() {
  transOpen = false;
  lastTransLang = '';
  lastOrigText = '';
  lastTransResult = '';
  transcriptionCard.classList.add('hidden');
  transcriptionEl.textContent = '';
  transLoading.classList.add('hidden');
  btnToggleTrans.classList.remove('open');
  transToggleText.textContent = 'Показать транскрипцию';
}

btnToggleTrans.addEventListener('click', async () => {
  if (transOpen) {
    // Hide
    transOpen = false;
    transcriptionCard.classList.add('hidden');
    btnToggleTrans.classList.remove('open');
    transToggleText.textContent = 'Показать транскрипцию';
    return;
  }

  // Show — load transcription on demand
  transOpen = true;
  btnToggleTrans.classList.add('open');
  transToggleText.textContent = 'Скрыть транскрипцию';

  // Determine which language to transcribe
  const TE = window.TranscriptionEngine;
  if (!TE) return;

  const langNames = { en: 'английского', fi: 'финского', ru: 'русского' };
  let textToTranscribe = '';
  let transLang = '';

  if (langFrom === 'ru') {
    // Translating FROM Russian → transcribe the result (target language)
    textToTranscribe = lastTransResult;
    transLang = langTo;
  } else {
    // Translating FROM en/fi → transcribe the original text (source language)
    textToTranscribe = lastOrigText;
    transLang = langFrom;
  }

  // If both are ru, no transcription needed
  if (transLang === 'ru' || !textToTranscribe) {
    transOpen = false;
    btnToggleTrans.classList.remove('open');
    transToggleText.textContent = 'Показать транскрипцию';
    return;
  }

  transLabel.textContent = `Произношение ${langNames[transLang] || ''}`;

  // Show card with loading
  transcriptionCard.classList.remove('hidden');
  transcriptionEl.textContent = '';
  transLoading.classList.remove('hidden');

  try {
    const transText = await TE.transcribeSentence(textToTranscribe, transLang);
    transLoading.classList.add('hidden');
    if (transText) {
      transcriptionEl.textContent = `[ ${transText} ]`;
    } else {
      transcriptionEl.textContent = '—';
    }
  } catch (e) {
    transLoading.classList.add('hidden');
    transcriptionEl.textContent = 'Ошибка загрузки транскрипции';
  }
});

// ===== Main Translate =====
async function handleTranslate() {
  const text = input.value.trim();
  if (!text) { showError('Введи текст для перевода'); return; }

  // Auto-detect language and swap if needed
  const detected = detectLanguage(text);
  let didSwap = false;

  if (detected && detected !== langFrom) {
    // The text language matches langTo → swap
    if (detected === langTo) {
      const prevFrom = langFrom;
      const prevTo = langTo;
      langFrom = prevTo;
      langTo = prevFrom;
      updateSelectDisplay('from', langFrom);
      updateSelectDisplay('to', langTo);
      markActiveOption('dropdown-from', langFrom);
      markActiveOption('dropdown-to', langTo);
      updatePlaceholder();
      didSwap = true;
    } else if (detected !== langFrom) {
      // Detected a third language — set it as source, keep target
      const prevTarget = langTo;
      langFrom = detected;
      // If detected same as target, swap target to something else
      if (langFrom === prevTarget) {
        // Find the other lang
        const others = ['en', 'ru', 'fi'].filter(l => l !== langFrom);
        langTo = others[0];
      }
      updateSelectDisplay('from', langFrom);
      updateSelectDisplay('to', langTo);
      markActiveOption('dropdown-from', langFrom);
      markActiveOption('dropdown-to', langTo);
      updatePlaceholder();
      didSwap = true;
    }
  }

  // Show auto-detect hint
  if (didSwap) {
    const langNames = { en: 'Английский', fi: 'Финский', ru: 'Русский' };
    autodetectText.textContent = `Определён ${langNames[langFrom]} → ${langNames[langTo]}`;
    autodetectHint.classList.remove('hidden');
  } else {
    autodetectHint.classList.add('hidden');
  }

  // Reset transcription state
  resetTransToggle();

  results.classList.add('hidden');
  errorEl.classList.add('hidden');
  loadingEl.classList.remove('hidden');

  try {
    const result = await translateText(text, langFrom, langTo);

    // Save for on-demand transcription
    lastOrigText = text;
    lastTransResult = result;
    lastTransLang = (langFrom === 'ru') ? langTo : langFrom;

    translationEl.textContent = result;

    // Hide transcription toggle if both are ru
    if (langFrom === 'ru' && langTo === 'ru') {
      btnToggleTrans.classList.add('hidden');
    } else {
      btnToggleTrans.classList.remove('hidden');
    }

    await buildBreakdown(text, langFrom, langTo);

    loadingEl.classList.add('hidden');
    results.classList.remove('hidden');

    // Re-trigger slide-up animations
    results.querySelectorAll('.slide-up').forEach(el => {
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    });

  } catch (e) {
    loadingEl.classList.add('hidden');
    showError(e.message || 'Ошибка при переводе');
  }
}

// ===== Word Breakdown =====
async function buildBreakdown(text, from, to) {
  let wordList;
  if (from === 'ru') wordList = text.match(/[а-яА-ЯёЁ]+/g);
  else if (from === 'fi') wordList = text.match(/[a-zA-ZäöåÄÖÅ]+/g);
  else wordList = text.match(/[a-zA-Z]+/g);

  if (!wordList || wordList.length === 0) { breakdownCard.classList.add('hidden'); return; }

  const seen = new Set();
  const unique = [];
  for (const w of wordList) {
    const k = w.toLowerCase();
    if (!seen.has(k)) { seen.add(k); unique.push(w); }
  }

  wordsEl.innerHTML = '';
  const TE = window.TranscriptionEngine;

  for (let i = 0; i < unique.length; i++) {
    const word = unique[i];
    const chip = document.createElement('div');
    chip.className = 'word-chip';
    chip.style.setProperty('--i', i);

    let html = `<span class="w-orig">${esc(word)}</span>`;

    // Show transcription in word chips for non-Russian source
    if (from !== 'ru') {
      const tr = await TE.getTranscription(word, from);
      if (tr) html += `<span class="w-trans">[${esc(tr)}]</span>`;
    }

    const meaning = TE.getWordTranslation(word, from, to);
    if (meaning) html += `<span class="w-mean">${esc(meaning)}</span>`;

    chip.innerHTML = html;
    chip.addEventListener('click', () => speak(word, from));
    wordsEl.appendChild(chip);
  }

  breakdownCard.classList.remove('hidden');
}

// ===== Error =====
function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

// ===== Helpers =====
function esc(t) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}

// ===== Event Listeners =====
btnTranslate.addEventListener('click', handleTranslate);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTranslate(); }
});

// ===== PWA: Register Service Worker =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ===== iOS Install Hint =====
(function() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  const hint = $('#install-hint');
  const closeBtn = $('#install-close');

  if (isIOS && !isStandalone && hint) {
    setTimeout(() => hint.classList.remove('hidden'), 3000);
    closeBtn?.addEventListener('click', () => hint.classList.add('hidden'));
  }
})();

// ===== Init =====
setupDropdowns();
updatePlaceholder();
input.focus();
