// ===== State =====
let langFrom = 'en';
let langTo = 'ru';
let isListening = false;
let recognition = null;
let transOpen = false;   // transcription panel visibility
let lastTransLang = '';  // language for which we show transcription
let lastOrigText = '';   // original text for transcription
let lastTransResult = ''; // translated text
let autoDetectEnabled = true; // auto-detect toggle

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
const btnAutodetect = $('#btn-autodetect');

// ===== Language Data =====
const LANGS = {
  en: { flag: '🇬🇧', name: 'Английский' },
  ru: { flag: '🇷🇺', name: 'Русский' },
  fi: { flag: '🇫🇮', name: 'Финский' },
};

const placeholders = { en: 'Type in English...', ru: 'Введи на русском...', fi: 'Kirjoita suomeksi...' };

// ===== Smart Auto-detect (dictionary-based, between two selected languages only) =====

// Common words for each language (high-frequency, unique to language)
const LANG_WORDS = {
  en: new Set([
    // Articles, pronouns, prepositions — uniquely English
    'the','a','an','is','are','am','was','were','been','being',
    'have','has','had','do','does','did','will','would','shall','should',
    'can','could','may','might','must','need','dare','ought',
    'i','you','he','she','it','we','they','me','him','her',
    'us','them','my','your','his','its','our','their',
    'this','that','these','those','who','whom','whose',
    'what','which','where','when','why','how',
    'in','on','at','to','for','with','from','by','about',
    'into','through','during','before','after','above',
    'below','between','under','over','out','up','down','off','of',
    'and','or','but','if','because','so','than','while',
    'although','since','until','not','no','yes','very',
    'also','just','more','less','now','then','here','there',
    'well','still','only','really','already','always','never',
    'sometimes','often','again','too','quite','almost',
    'go','going','gone','went','come','coming','came',
    'get','getting','got','make','making','made',
    'know','knew','known','think','thought',
    'take','took','taken','see','saw','seen',
    'want','give','gave','given','tell','told','say','said',
    'find','found','call','try','ask','work','working',
    'play','playing','run','running','move','live','believe',
    'write','wrote','written','read','learn','keep','let',
    'begin','began','seem','help','show','hear','heard','turn',
    'start','put','open','close','like','love','hate',
    'eat','eating','drink','sleep','buy','bought','sell','sold',
    'hello','goodbye','bye','welcome','please','thank','thanks','sorry',
    'good','bad','new','old','great','big','small','long',
    'little','young','right','wrong','high','low','large',
    'first','last','next','different','important','same',
    'every','each','many','much','few','other','best','better',
    'beautiful','happy','time','world','life','people','way',
    'day','man','woman','child','children','house','home',
    'school','friend','family','book','game','water','food',
    'money','name','city','country','door','car',
  ]),
  fi: new Set([
    // Finnish words — many overlap Latin letters but are clearly Finnish
    'hei','moi','terve','moikka','kiitos','ole','hyvä',
    'hyvää','huomenta','päivää','iltaa','yötä',
    'anteeksi','näkemiin','heippa',
    'minä','mä','sinä','sä','hän','he','se','ne',
    'tämä','tuo','mikä','kuka','mitä','missä','mihin',
    'milloin','miksi','miten','kuinka','paljonko',
    'olla','olen','olet','olemme','olette','ovat',
    'mennä','tulla','tehdä','sanoa','voida',
    'pitää','haluta','tietää','nähdä','antaa','ottaa',
    'käyttää','puhua','lukea','kirjoittaa','syödä','juoda',
    'nukkua','ostaa','myydä','ajaa','kävellä',
    'oppia','opiskella','asua','rakastaa','ymmärtää',
    'päivä','yö','aamu','ilta','aika','vuosi',
    'viikko','tunti','ihminen','mies','nainen',
    'lapsi','perhe','äiti','isä','veli','sisko',
    'ystävä','kaveri','koulu','työ','koti','talo',
    'huone','kaupunki','maa','vesi','ruoka','auto',
    'koira','kissa','kirja','puhelin','peli',
    'raha','nimi','sana','kieli','suomi',
    'englanti','venäjä',
    'iso','pieni','uusi','vanha','nuori','pitkä','lyhyt',
    'kaunis','ruma','nopea','hidas','helppo','vaikea',
    'kuuma','kylmä','lämmin',
    'musta','valkoinen','punainen','sininen','vihreä','keltainen',
    'iloinen','surullinen',
    'yksi','kaksi','kolme','neljä','viisi','kuusi',
    'seitsemän','kahdeksan','yhdeksän','kymmenen',
    'sata','tuhat','miljoona',
    'kyllä','ei','ehkä','nyt','tänään','huomenna',
    'eilen','aina','usein','joskus','harvoin',
    'täällä','siellä','hyvin','paljon','vähän',
    'myös','vain','jo','vielä','taas',
    'ja','tai','mutta','koska','kun','jos','että',
    'kanssa','ilman','ennen','jälkeen',
    'meidän','teidän','heidän','minun','sinun','hänen',
    'meillä','teillä','heillä','minulla','sinulla','hänellä',
    'olen','olet','on','olemme','olette','ovat',
  ]),
  ru: new Set([
    // Russian determined by Cyrillic — but we include common words for scoring
    'и','в','не','на','с','что','это','как','но','по',
    'из','за','то','он','она','оно','они','мы','вы','ты',
    'я','мне','мой','моя','его','её','наш','ваш','их',
    'был','была','были','быть','есть','будет',
    'да','нет','очень','тоже','ещё','уже','только',
    'всё','все','этот','эта','тот','та','здесь','там',
    'когда','где','почему','зачем','кто','кого','чего',
    'привет','здравствуйте','пока','спасибо','пожалуйста',
    'хорошо','плохо','большой','маленький','новый','старый',
    'дом','школа','работа','вода','еда','друг','семья',
    'время','день','ночь','утро','вечер',
    'сегодня','завтра','вчера','сейчас','потом',
  ]),
};

/**
 * Smart language detection — only between the two selected languages (langFrom and langTo).
 * Uses Cyrillic detection for Russian, and dictionary word matching for en vs fi.
 * Returns langFrom or langTo (whichever the text appears to be), or null if unsure.
 */
function detectLanguage(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const candidateA = langFrom;
  const candidateB = langTo;

  // Quick Cyrillic check
  const hasCyrillic = /[а-яА-ЯёЁ]/.test(trimmed);
  const hasLatin = /[a-zA-Z]/.test(trimmed);

  // If one candidate is Russian
  if (candidateA === 'ru' || candidateB === 'ru') {
    const ruCandidate = (candidateA === 'ru') ? candidateA : candidateB;
    const otherCandidate = (candidateA === 'ru') ? candidateB : candidateA;

    // If text is mostly Cyrillic → Russian
    if (hasCyrillic && !hasLatin) return ruCandidate;
    // If text is only Latin → the other language
    if (hasLatin && !hasCyrillic) return otherCandidate;
    // Mixed — count which dominates
    const cyrCount = (trimmed.match(/[а-яА-ЯёЁ]/g) || []).length;
    const latCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    if (cyrCount > latCount) return ruCandidate;
    if (latCount > cyrCount) return otherCandidate;
    return null;
  }

  // Both candidates are Latin-based (en vs fi)
  // Use dictionary matching — count how many words belong to each language
  const words = trimmed.toLowerCase().match(/[a-zA-ZäöåÄÖÅ]+/g);
  if (!words || words.length === 0) return null;

  // Finnish-specific characters are a strong signal
  const hasFinnishChars = /[äöåÄÖÅ]/.test(trimmed);

  let scoreA = 0;
  let scoreB = 0;

  const dictA = LANG_WORDS[candidateA];
  const dictB = LANG_WORDS[candidateB];

  for (const w of words) {
    const inA = dictA && dictA.has(w);
    const inB = dictB && dictB.has(w);
    if (inA && !inB) scoreA += 2;
    else if (inB && !inA) scoreB += 2;
    else if (inA && inB) { scoreA += 0.5; scoreB += 0.5; }
    // else: unknown word, no score
  }

  // Finnish chars are a strong bonus for Finnish candidate
  if (hasFinnishChars) {
    if (candidateA === 'fi') scoreA += words.length * 1.5;
    if (candidateB === 'fi') scoreB += words.length * 1.5;
  }

  // Need a meaningful difference to decide
  const total = scoreA + scoreB;
  if (total === 0) return null;

  // If one scores significantly higher, return it
  if (scoreA > scoreB * 1.3) return candidateA;
  if (scoreB > scoreA * 1.3) return candidateB;

  // If Finnish chars present and one is Finnish, prefer it
  if (hasFinnishChars) {
    if (candidateA === 'fi') return candidateA;
    if (candidateB === 'fi') return candidateB;
  }

  return null; // Too close to call
}

// ===== Auto-detect toggle button =====
btnAutodetect.addEventListener('click', () => {
  autoDetectEnabled = !autoDetectEnabled;
  btnAutodetect.classList.toggle('active', autoDetectEnabled);
  btnAutodetect.setAttribute('aria-pressed', autoDetectEnabled);
  if (!autoDetectEnabled) {
    autodetectHint.classList.add('hidden');
  }
});

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
    transOpen = false;
    transcriptionCard.classList.add('hidden');
    btnToggleTrans.classList.remove('open');
    transToggleText.textContent = 'Показать транскрипцию';
    return;
  }

  transOpen = true;
  btnToggleTrans.classList.add('open');
  transToggleText.textContent = 'Скрыть транскрипцию';

  const TE = window.TranscriptionEngine;
  if (!TE) return;

  const langNames = { en: 'английского', fi: 'финского', ru: 'русского' };
  let textToTranscribe = '';
  let transLang = '';

  if (langFrom === 'ru') {
    textToTranscribe = lastTransResult;
    transLang = langTo;
  } else {
    textToTranscribe = lastOrigText;
    transLang = langFrom;
  }

  if (transLang === 'ru' || !textToTranscribe) {
    transOpen = false;
    btnToggleTrans.classList.remove('open');
    transToggleText.textContent = 'Показать транскрипцию';
    return;
  }

  transLabel.textContent = `Произношение ${langNames[transLang] || ''}`;

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

  let didSwap = false;

  // Auto-detect only if enabled
  if (autoDetectEnabled) {
    const detected = detectLanguage(text);

    // Only swap if the detected language equals langTo (i.e. user typed in the "target" language)
    if (detected && detected === langTo) {
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

    lastOrigText = text;
    lastTransResult = result;
    lastTransLang = (langFrom === 'ru') ? langTo : langFrom;

    translationEl.textContent = result;

    if (langFrom === 'ru' && langTo === 'ru') {
      btnToggleTrans.classList.add('hidden');
    } else {
      btnToggleTrans.classList.remove('hidden');
    }

    await buildBreakdown(text, langFrom, langTo);

    loadingEl.classList.add('hidden');
    results.classList.remove('hidden');

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
