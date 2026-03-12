// ===== Language Registry =====
const LANGUAGES = [
  // Popular (top section)
  { code: 'en', name: 'English', flag: '🇬🇧', popular: true },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', popular: true },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮', popular: true },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', popular: true },
  { code: 'fr', name: 'Français', flag: '🇫🇷', popular: true },
  { code: 'es', name: 'Español', flag: '🇪🇸', popular: true },
  // More languages
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
];

function getLang(code) {
  return LANGUAGES.find(l => l.code === code) || { code, name: code.toUpperCase(), flag: '🌐' };
}

// ===== State =====
let langFrom = 'en';
let langTo = 'ru';
let isListening = false;
let recognition = null;
let transcriptionEnabled = true;

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
const wordsEl = $('#words');
const breakdownCard = $('#breakdown-card');

const langFromBtn = $('#lang-from-btn');
const langToBtn = $('#lang-to-btn');
const dropdownFrom = $('#dropdown-from');
const dropdownTo = $('#dropdown-to');
const flagFrom = $('#flag-from');
const nameFrom = $('#name-from');
const flagTo = $('#flag-to');
const nameTo = $('#name-to');

// ===== Language Dropdown =====
function buildDropdown(container, selectedCode, otherCode, onSelect) {
  container.innerHTML = '';
  const popular = LANGUAGES.filter(l => l.popular);
  const rest = LANGUAGES.filter(l => !l.popular);

  function addOption(lang) {
    const btn = document.createElement('button');
    btn.className = 'lang-option' + (lang.code === selectedCode ? ' active' : '');
    if (lang.code === otherCode) btn.style.opacity = '0.4';
    btn.innerHTML = `<span class="opt-flag">${lang.flag}</span><span class="opt-name">${lang.name}</span><span class="opt-code">${lang.code}</span>`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect(lang.code);
    });
    container.appendChild(btn);
  }

  popular.forEach(addOption);

  if (rest.length) {
    const div = document.createElement('div');
    div.className = 'lang-divider';
    container.appendChild(div);
    rest.forEach(addOption);
  }
}

function updateLangUI() {
  const from = getLang(langFrom);
  const to = getLang(langTo);
  flagFrom.textContent = from.flag;
  nameFrom.textContent = from.name;
  flagTo.textContent = to.flag;
  nameTo.textContent = to.name;
  updatePlaceholder();
}

function openDropdown(btnEl, dropdownEl, isFrom) {
  // Close any other open dropdown
  closeAllDropdowns();

  const selected = isFrom ? langFrom : langTo;
  const other = isFrom ? langTo : langFrom;

  buildDropdown(dropdownEl, selected, other, (code) => {
    if (isFrom) {
      if (code === langTo) { langTo = langFrom; }
      langFrom = code;
    } else {
      if (code === langFrom) { langFrom = langTo; }
      langTo = code;
    }
    updateLangUI();
    closeAllDropdowns();
  });

  dropdownEl.classList.remove('hidden');
  btnEl.classList.add('open');

  // Overlay to catch outside clicks
  const overlay = document.createElement('div');
  overlay.className = 'lang-overlay';
  overlay.addEventListener('click', closeAllDropdowns);
  document.body.appendChild(overlay);
}

function closeAllDropdowns() {
  dropdownFrom.classList.add('hidden');
  dropdownTo.classList.add('hidden');
  langFromBtn.classList.remove('open');
  langToBtn.classList.remove('open');
  document.querySelectorAll('.lang-overlay').forEach(el => el.remove());
}

langFromBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!dropdownFrom.classList.contains('hidden')) {
    closeAllDropdowns();
  } else {
    openDropdown(langFromBtn, dropdownFrom, true);
  }
});

langToBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!dropdownTo.classList.contains('hidden')) {
    closeAllDropdowns();
  } else {
    openDropdown(langToBtn, dropdownTo, false);
  }
});

const placeholders = {
  en: 'Type in English...',
  ru: 'Введи на русском...',
  fi: 'Kirjoita suomeksi...',
  de: 'Auf Deutsch schreiben...',
  fr: 'Écrire en français...',
  es: 'Escribe en español...',
  it: 'Scrivi in italiano...',
  pt: 'Escreva em português...',
  ja: '日本語で入力...',
  ko: '한국어로 입력...',
  zh: '用中文输入...',
  ar: 'اكتب بالعربية...',
  tr: 'Türkçe yazın...',
  uk: 'Напишіть українською...',
  pl: 'Pisz po polsku...',
};

function updatePlaceholder() {
  input.placeholder = placeholders[langFrom] || 'Введи текст...';
}

// ===== Swap =====
btnSwap.addEventListener('click', () => {
  const tmp = langFrom;
  langFrom = langTo;
  langTo = tmp;
  updateLangUI();

  const translated = translationEl.textContent;
  if (translated && !results.classList.contains('hidden')) {
    input.value = translated;
    counter.textContent = translated.length;
  }

  // spin animation
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
  input.focus();
});

// ===== TTS (Text-to-Speech) =====
const langTTS = {
  en:'en-US', ru:'ru-RU', fi:'fi-FI', de:'de-DE', fr:'fr-FR', es:'es-ES',
  it:'it-IT', pt:'pt-PT', nl:'nl-NL', pl:'pl-PL', uk:'uk-UA', cs:'cs-CZ',
  sv:'sv-SE', da:'da-DK', no:'nb-NO', ja:'ja-JP', ko:'ko-KR', zh:'zh-CN',
  ar:'ar-SA', hi:'hi-IN', tr:'tr-TR', el:'el-GR', hu:'hu-HU', ro:'ro-RO',
  bg:'bg-BG', hr:'hr-HR', sk:'sk-SK', et:'et-EE', lv:'lv-LV', lt:'lt-LT',
  th:'th-TH', vi:'vi-VN', id:'id-ID', ms:'ms-MY', he:'he-IL', ka:'ka-GE',
};

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

  recognition.lang = langTTS[langFrom] || 'en-US';

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

// ===== Translation API (Lingva Translate — free, unlimited) =====
const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://translate.plausibility.cloud',
];

async function translateText(text, from, to) {
  // Try Lingva first
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

  // Fallback: MyMemory
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

// ===== Main Translate =====
async function handleTranslate() {
  const text = input.value.trim();
  if (!text) { showError('Введи текст для перевода'); return; }

  results.classList.add('hidden');
  errorEl.classList.add('hidden');
  loadingEl.classList.remove('hidden');

  try {
    const result = await translateText(text, langFrom, langTo);
    const TE = window.TranscriptionEngine;

    let transText = '';
    let label = '';
    const langNames = {
      en: 'английского', fi: 'финского', ru: 'русского',
      de: 'немецкого', fr: 'французского', es: 'испанского',
      it: 'итальянского', pt: 'португальского', ja: 'японского',
      ko: 'корейского', zh: 'китайского', ar: 'арабского',
      tr: 'турецкого', uk: 'украинского', pl: 'польского',
      nl: 'голландского', sv: 'шведского', da: 'датского',
      no: 'норвежского', cs: 'чешского', hu: 'венгерского',
      el: 'греческого', ro: 'румынского', bg: 'болгарского',
      hr: 'хорватского', sk: 'словацкого', et: 'эстонского',
      lv: 'латышского', lt: 'литовского', hi: 'хинди',
      th: 'тайского', vi: 'вьетнамского', id: 'индонезийского',
      ms: 'малайского', he: 'иврита', ka: 'грузинского',
    };

    // Only show transcription if enabled and we support the language
    const supportsTranscription = transcriptionEnabled && (['en', 'fi'].includes(langFrom) || ['en', 'fi'].includes(langTo));

    if (supportsTranscription) {
      if (['en', 'fi'].includes(langFrom)) {
        transText = await TE.transcribeSentence(text, langFrom);
        label = `Произношение ${langNames[langFrom] || langFrom}`;
      } else if (['en', 'fi'].includes(langTo)) {
        transText = await TE.transcribeSentence(result, langTo);
        label = `Произношение ${langNames[langTo] || langTo}`;
      }
    }

    translationEl.textContent = result;
    transLabel.textContent = label;

    if (transText) {
      transcriptionEl.textContent = `[ ${transText} ]`;
      transcriptionCard.classList.remove('hidden');
    } else {
      transcriptionCard.classList.add('hidden');
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
  const isCyrillic = /[а-яА-ЯёЁ]/.test(text);
  const isFinnish = /[äöåÄÖÅ]/.test(text);

  let wordList;
  if (isCyrillic) wordList = text.match(/[а-яА-ЯёЁ]+/g);
  else if (isFinnish) wordList = text.match(/[a-zA-ZäöåÄÖÅ]+/g);
  else wordList = text.match(/[a-zA-Z\u00C0-\u024F]+/g);

  if (!wordList || wordList.length === 0) { breakdownCard.classList.add('hidden'); return; }

  const seen = new Set();
  const unique = [];
  for (const w of wordList) {
    const k = w.toLowerCase();
    if (!seen.has(k)) { seen.add(k); unique.push(w); }
  }

  wordsEl.innerHTML = '';
  const TE = window.TranscriptionEngine;
  const supportsTranscription = transcriptionEnabled && ['en', 'fi'].includes(from);

  for (let i = 0; i < unique.length; i++) {
    const word = unique[i];
    const chip = document.createElement('div');
    chip.className = 'word-chip';
    chip.style.setProperty('--i', i);

    let html = `<span class="w-orig">${esc(word)}</span>`;

    if (supportsTranscription) {
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

// ===== Transcription Toggle =====
const toggleBtn = $('#toggle-transcription');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    transcriptionEnabled = !transcriptionEnabled;
    toggleBtn.classList.toggle('active', transcriptionEnabled);
    toggleBtn.setAttribute('aria-checked', transcriptionEnabled);
  });
}

// ===== Init =====
updateLangUI();
updatePlaceholder();
input.focus();
