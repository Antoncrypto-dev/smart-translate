/**
 * Multi-language phonetic transcription engine.
 * Converts English, Finnish, and Russian words into Russian-letter pronunciation.
 *
 * For English: dictionary + rule-based fallback.
 * For Finnish: rule-based (Finnish is very phonetic) + common word dictionary.
 * For Russian: already in Cyrillic, return as-is.
 */

// ============================================================
// ENGLISH → Russian transcription dictionary
// ============================================================
const EN_TRANSCRIPTION = {
  // Common words
  "a": "э", "the": "зэ", "is": "из", "are": "ар", "am": "эм",
  "was": "воз", "were": "вёр", "be": "би", "been": "бин", "being": "биинг",
  "have": "хэв", "has": "хэз", "had": "хэд",
  "do": "ду", "does": "даз", "did": "дид",
  "will": "вил", "would": "вуд", "shall": "шэл", "should": "шуд",
  "can": "кэн", "could": "куд", "may": "мэй", "might": "майт",
  "must": "маст", "need": "нид", "dare": "дэр", "ought": "от",

  // Pronouns
  "i": "ай", "you": "ю", "he": "хи", "she": "ши", "it": "ит",
  "we": "ви", "they": "зэй", "me": "ми", "him": "хим", "her": "хёр",
  "us": "ас", "them": "зэм", "my": "май", "your": "ёр", "his": "хиз",
  "its": "итс", "our": "аур", "their": "зэр",
  "this": "зис", "that": "зэт", "these": "зиз", "those": "зоуз",
  "who": "ху", "whom": "хум", "whose": "хуз",
  "what": "вот", "which": "вич", "where": "вэр", "when": "вэн",
  "why": "вай", "how": "хау",

  // Prepositions
  "in": "ин", "on": "он", "at": "эт", "to": "ту", "for": "фор",
  "with": "виз", "from": "фром", "by": "бай", "about": "эбаут",
  "into": "инту", "through": "сру", "during": "дюринг",
  "before": "бифор", "after": "афтер", "above": "эбав",
  "below": "билоу", "between": "битвин", "under": "андер",
  "over": "оувер", "out": "аут", "up": "ап", "down": "даун",
  "off": "оф", "of": "ов",

  // Conjunctions
  "and": "энд", "or": "ор", "but": "бат", "if": "иф",
  "because": "бикоз", "so": "соу", "than": "зэн", "while": "вайл",
  "although": "олзоу", "since": "синс", "until": "антил",

  // Common verbs
  "go": "гоу", "going": "гоуинг", "gone": "гон", "went": "вэнт",
  "come": "кам", "coming": "каминг", "came": "кэйм",
  "get": "гет", "getting": "гетинг", "got": "гот",
  "make": "мэйк", "making": "мэйкинг", "made": "мэйд",
  "know": "ноу", "knew": "нью", "known": "ноун",
  "think": "синк", "thought": "сот",
  "take": "тэйк", "took": "тук", "taken": "тэйкен",
  "see": "си", "saw": "со", "seen": "син",
  "want": "вонт", "give": "гив", "gave": "гэйв", "given": "гивен",
  "tell": "тэл", "told": "тоулд", "say": "сэй", "said": "сэд",
  "find": "файнд", "found": "фаунд", "call": "кол",
  "try": "трай", "ask": "аск", "work": "ворк", "working": "воркинг",
  "play": "плэй", "playing": "плэйинг", "run": "ран", "running": "ранинг",
  "move": "мув", "live": "лив", "believe": "билив",
  "write": "райт", "wrote": "роут", "written": "ритен",
  "read": "рид", "learn": "лёрн", "keep": "кип", "let": "лэт",
  "begin": "бигин", "began": "бигэн", "seem": "сим", "help": "хэлп",
  "show": "шоу", "hear": "хир", "heard": "хёрд", "turn": "тёрн",
  "start": "старт", "put": "пут", "open": "оупен", "close": "клоуз",
  "like": "лайк", "love": "лав", "hate": "хэйт",
  "eat": "ит", "eating": "итинг", "drink": "дринк", "sleep": "слип",
  "buy": "бай", "bought": "бот", "sell": "сэл", "sold": "соулд",
  "pay": "пэй", "paid": "пэйд", "send": "сэнд", "sent": "сэнт",
  "sit": "сит", "stand": "стэнд", "lose": "луз", "lost": "лост",
  "die": "дай", "meet": "мит", "met": "мэт",
  "speak": "спик", "spoke": "споук", "spoken": "споукен",
  "talk": "ток", "walk": "вок", "look": "лук",
  "watch": "воч", "feel": "фил", "felt": "фэлт",
  "create": "криэйт", "change": "чэйндж", "follow": "фолоу",
  "stop": "стоп", "remember": "римэмбер", "forget": "форгэт",
  "understand": "андерстэнд", "wait": "вэйт",
  "build": "билд", "built": "билт", "break": "брэйк", "broke": "броук",
  "grow": "гроу", "grew": "грю",

  // Common nouns
  "time": "тайм", "year": "йир", "people": "пипл", "way": "вэй",
  "day": "дэй", "man": "мэн", "woman": "вумэн",
  "child": "чайлд", "children": "чилдрен", "world": "ворлд",
  "life": "лайф", "hand": "хэнд", "part": "парт", "place": "плэйс",
  "week": "вик", "number": "намбер", "night": "найт", "point": "пойнт",
  "home": "хоум", "water": "вотер", "room": "рум",
  "mother": "мазер", "father": "фазер", "family": "фэмили",
  "school": "скул", "house": "хаус", "book": "бук",
  "friend": "фрэнд", "game": "гэйм", "phone": "фоун",
  "computer": "компьютер", "music": "мьюзик", "food": "фуд",
  "money": "мани", "name": "нэйм", "city": "сити", "country": "кантри",
  "door": "дор", "car": "кар", "dog": "дог", "cat": "кэт",
  "head": "хэд", "eye": "ай", "eyes": "айз", "face": "фэйс",
  "thing": "синг", "word": "ворд", "story": "стори",
  "table": "тэйбл", "heart": "харт", "sun": "сан", "moon": "мун",
  "star": "стар", "morning": "морнинг", "evening": "ивнинг",
  "today": "тудэй", "tomorrow": "тумороу", "yesterday": "йестерди",
  "nothing": "насинг", "something": "самсинг", "everything": "эврисинг",
  "everyone": "эвриван", "someone": "самван", "problem": "проблем",
  "idea": "айдиа", "movie": "муви", "brother": "бразер",
  "sister": "систер", "teacher": "тичер", "student": "стюдент",

  // Adjectives
  "good": "гуд", "bad": "бэд", "new": "нью", "old": "оулд",
  "great": "грэйт", "big": "биг", "small": "смол", "long": "лонг",
  "little": "литл", "young": "янг", "right": "райт", "wrong": "ронг",
  "high": "хай", "low": "лоу", "large": "ладж",
  "first": "фёрст", "last": "ласт", "next": "нэкст",
  "different": "диферент", "important": "импортэнт", "same": "сэйм",
  "every": "эври", "each": "ич", "many": "мэни", "much": "мач",
  "few": "фью", "other": "азер", "best": "бэст", "better": "бэтер",
  "beautiful": "бьютифул", "happy": "хэпи", "sad": "сэд",
  "real": "риал", "true": "тру", "false": "фолс",
  "easy": "изи", "hard": "хард", "fast": "фаст", "slow": "слоу",
  "hot": "хот", "cold": "коулд", "warm": "ворм", "cool": "кул",
  "black": "блэк", "white": "вайт", "red": "рэд", "blue": "блю",
  "green": "грин", "dark": "дарк", "light": "лайт",
  "nice": "найс", "sure": "шур", "sorry": "сори",
  "strong": "стронг", "full": "фул", "empty": "эмпти",
  "pretty": "прити", "enough": "инаф",
  "interesting": "интрэстинг", "amazing": "эмэйзинг",

  // Adverbs & misc
  "not": "нот", "no": "ноу", "yes": "йес", "very": "вэри",
  "also": "олсоу", "just": "джаст", "more": "мор", "less": "лэс",
  "now": "нау", "then": "зэн", "here": "хир", "there": "зэр",
  "well": "вэл", "still": "стил", "only": "оунли", "really": "риали",
  "already": "олрэди", "always": "олвэйз", "never": "нэвер",
  "sometimes": "самтаймз", "often": "офен", "again": "эгэн",
  "too": "ту", "quite": "квайт", "almost": "олмоуст",
  "away": "эвэй", "back": "бэк", "maybe": "мэйби",
  "please": "плиз", "thank": "сэнк", "thanks": "сэнкс",
  "okay": "окэй", "ok": "окэй", "together": "тугэзер",

  // Greetings
  "hello": "хэлоу", "hi": "хай", "hey": "хэй",
  "goodbye": "гудбай", "bye": "бай", "welcome": "вэлкам",
  "sir": "сёр",

  // Numbers
  "one": "ван", "two": "ту", "three": "сри", "four": "фор",
  "five": "файв", "six": "сикс", "seven": "сэвен", "eight": "эйт",
  "nine": "найн", "ten": "тэн", "hundred": "хандред",
  "thousand": "саузэнд", "million": "мильен",

  // Tech / gaming
  "internet": "интернет", "online": "онлайн", "website": "вэбсайт",
  "video": "видео", "message": "мэседж", "password": "пассворд",
  "update": "апдэйт", "download": "даунлоуд", "server": "сёрвер",
  "player": "плэйер", "level": "лэвел", "team": "тим",
  "score": "скор", "win": "вин", "battle": "бэтл", "skill": "скил",
  "screen": "скрин", "settings": "сэтингз", "search": "сёрч",
  "share": "шэр", "subscribe": "сабскрайб", "channel": "чэнел",
  "stream": "стрим", "account": "экаунт", "profile": "профайл",
};

// ============================================================
// FINNISH → Russian transcription dictionary (common words)
// ============================================================
const FI_TRANSCRIPTION = {
  // Greetings / basics
  "hei": "хэй", "moi": "мой", "terve": "тэрвэ", "moikka": "мойкка",
  "kiitos": "киитос", "ole": "олэ", "hyvä": "хювя",
  "hyvää": "хювяя", "huomenta": "хуомэнта", "päivää": "пяйвяя",
  "iltaa": "илтаа", "yötä": "юётя",
  "anteeksi": "антээкси", "näkemiin": "някэмиин",
  "heippa": "хэйппа", "hei hei": "хэй хэй",

  // Pronouns
  "minä": "миня", "mä": "мя", "sinä": "синя", "sä": "ся",
  "hän": "хян", "me": "мэ", "te": "тэ", "he": "хэ",
  "se": "сэ", "ne": "нэ", "tämä": "тямя", "tuo": "туо",
  "mikä": "микя", "kuka": "кука",

  // Common verbs
  "olla": "олла", "olen": "олэн", "olet": "олэт", "on": "он",
  "olemme": "олэммэ", "olette": "олэттэ", "ovat": "оват",
  "mennä": "мэння", "tulla": "тулла", "tehdä": "тэхдя",
  "sanoa": "саноа", "saada": "сааdа", "voida": "войда",
  "pitää": "питяя", "haluta": "халута", "tietää": "тиэтяя",
  "nähdä": "няхдя", "antaa": "антаа", "ottaa": "оттаа",
  "käyttää": "кяюттяя", "puhua": "пухуа", "lukea": "лукэа",
  "kirjoittaa": "кирьойттаа", "syödä": "сюёдя", "juoda": "юода",
  "nukkua": "нуккуа", "ostaa": "остаа", "myydä": "мюйдя",
  "ajaa": "аяа", "kävellä": "кявэлля",
  "oppia": "оппиа", "opiskella": "опискэлла",
  "asua": "асуа", "rakastaa": "ракастаа",
  "ymmärtää": "юммяртяя",

  // Common nouns
  "päivä": "пяйвя", "yö": "юё", "aamu": "ааму", "ilta": "илта",
  "aika": "айка", "vuosi": "вуоси", "kuukausi": "кууkауси",
  "viikko": "виикко", "tunti": "тунти",
  "ihminen": "ихминэн", "mies": "миэс", "nainen": "найнэн",
  "lapsi": "лапси", "perhe": "пэрхэ",
  "äiti": "яйти", "isä": "ися", "veli": "вэли", "sisko": "сиско",
  "ystävä": "юстявя", "kaveri": "кавэри",
  "koulu": "коулу", "työ": "тюё", "koti": "коти", "talo": "тало",
  "huone": "хуонэ", "kaupunki": "каупунки", "maa": "маа",
  "vesi": "вэси", "ruoka": "руока", "auto": "ауто",
  "koira": "кoйра", "kissa": "кисса", "kirja": "кирья",
  "puhelin": "пухэлин", "peli": "пэли",
  "raha": "раха", "nimi": "ними", "sana": "сана",
  "kieli": "киэли", "suomi": "суоми",
  "englanti": "энгланти", "venäjä": "вэняйя",

  // Adjectives
  "hyvä": "хювя", "huono": "хуоно", "iso": "исо", "pieni": "пиэни",
  "uusi": "ууси", "vanha": "ванха", "nuori": "нуори",
  "pitkä": "питкя", "lyhyt": "люхют",
  "kaunis": "каунис", "ruma": "рума",
  "nopea": "нопэа", "hidas": "хидас",
  "helppo": "хэлппо", "vaikea": "вайкэа",
  "kuuma": "куума", "kylmä": "кюлмя", "lämmin": "ляммин",
  "musta": "муста", "valkoinen": "валкойнэн",
  "punainen": "пунайнэн", "sininen": "сининэн",
  "vihreä": "вихрэя", "keltainen": "кэлтайнэн",
  "iloinen": "илойнэн", "surullinen": "суруллинэн",

  // Numbers
  "yksi": "юкси", "kaksi": "какси", "kolme": "колмэ",
  "neljä": "нэлья", "viisi": "вииси", "kuusi": "кууси",
  "seitsemän": "сэйтсэмян", "kahdeksan": "кахдэксан",
  "yhdeksän": "юхдэксян", "kymmenen": "кюммэнэн",
  "sata": "сата", "tuhat": "тухат", "miljoona": "мильёона",

  // Question words
  "mitä": "митя", "missä": "мисся", "mihin": "михин",
  "milloin": "миллойн", "miksi": "микси", "miten": "митэн",
  "kuinka": "куинка", "paljonko": "пальёнко",

  // Common adverbs
  "kyllä": "кюлля", "ei": "эй", "ehkä": "эхкя",
  "nyt": "нют", "tänään": "тяняян", "huomenna": "хуомэнна",
  "eilen": "эйлэн", "aina": "айна", "usein": "усэйн",
  "joskus": "ёскус", "harvoin": "харвойн",
  "täällä": "тяялля", "siellä": "сиэлля",
  "hyvin": "хювин", "paljon": "пальён", "vähän": "вяхян",
  "myös": "мюёс", "vain": "вайн", "jo": "ёо",
  "vielä": "виэля", "taas": "таас",
  "kiitos": "киитос", "ole hyvä": "олэ хювя",

  // Phrases
  "minun nimeni on": "минун нимэни он",
  "puhutko englantia": "пухутко энглантиа",
  "en ymmärrä": "эн юммярря",
  "en puhu suomea": "эн пуху суомэа",
};

// ============================================================
// ENGLISH word translations (for breakdown)
// ============================================================
const EN_WORD_TRANSLATIONS = {
  "hello": { "ru": "привет", "fi": "hei" },
  "hi": { "ru": "привет", "fi": "hei" },
  "goodbye": { "ru": "до свидания", "fi": "näkemiin" },
  "bye": { "ru": "пока", "fi": "heippa" },
  "yes": { "ru": "да", "fi": "kyllä" },
  "no": { "ru": "нет", "fi": "ei" },
  "please": { "ru": "пожалуйста", "fi": "ole hyvä" },
  "thanks": { "ru": "спасибо", "fi": "kiitos" },
  "thank": { "ru": "спасибо", "fi": "kiitos" },
  "sorry": { "ru": "извини", "fi": "anteeksi" },
  "good": { "ru": "хороший", "fi": "hyvä" },
  "bad": { "ru": "плохой", "fi": "huono" },
  "morning": { "ru": "утро", "fi": "aamu" },
  "evening": { "ru": "вечер", "fi": "ilta" },
  "night": { "ru": "ночь", "fi": "yö" },
  "day": { "ru": "день", "fi": "päivä" },
  "how": { "ru": "как", "fi": "miten" },
  "what": { "ru": "что", "fi": "mitä" },
  "where": { "ru": "где", "fi": "missä" },
  "when": { "ru": "когда", "fi": "milloin" },
  "why": { "ru": "почему", "fi": "miksi" },
  "who": { "ru": "кто", "fi": "kuka" },
  "you": { "ru": "ты", "fi": "sinä" },
  "i": { "ru": "я", "fi": "minä" },
  "he": { "ru": "он", "fi": "hän" },
  "she": { "ru": "она", "fi": "hän" },
  "we": { "ru": "мы", "fi": "me" },
  "they": { "ru": "они", "fi": "he" },
  "name": { "ru": "имя", "fi": "nimi" },
  "my": { "ru": "мой", "fi": "minun" },
  "your": { "ru": "твой", "fi": "sinun" },
  "is": { "ru": "есть", "fi": "on" },
  "are": { "ru": "—", "fi": "ovat" },
  "the": { "ru": "—", "fi": "—" },
  "a": { "ru": "—", "fi": "—" },
  "and": { "ru": "и", "fi": "ja" },
  "or": { "ru": "или", "fi": "tai" },
  "but": { "ru": "но", "fi": "mutta" },
  "not": { "ru": "не", "fi": "ei" },
  "with": { "ru": "с", "fi": "kanssa" },
  "for": { "ru": "для", "fi": "varten" },
  "from": { "ru": "из", "fi": "mistä" },
  "to": { "ru": "к", "fi": "—" },
  "in": { "ru": "в", "fi": "missä" },
  "on": { "ru": "на", "fi": "päälle" },
  "it": { "ru": "это", "fi": "se" },
  "this": { "ru": "это", "fi": "tämä" },
  "that": { "ru": "тот", "fi": "tuo" },
  "have": { "ru": "иметь", "fi": "olla" },
  "do": { "ru": "делать", "fi": "tehdä" },
  "go": { "ru": "идти", "fi": "mennä" },
  "come": { "ru": "приходить", "fi": "tulla" },
  "know": { "ru": "знать", "fi": "tietää" },
  "think": { "ru": "думать", "fi": "ajatella" },
  "see": { "ru": "видеть", "fi": "nähdä" },
  "want": { "ru": "хотеть", "fi": "haluta" },
  "like": { "ru": "нравиться", "fi": "pitää" },
  "love": { "ru": "любовь", "fi": "rakkaus" },
  "food": { "ru": "еда", "fi": "ruoka" },
  "water": { "ru": "вода", "fi": "vesi" },
  "house": { "ru": "дом", "fi": "talo" },
  "home": { "ru": "дом", "fi": "koti" },
  "school": { "ru": "школа", "fi": "koulu" },
  "friend": { "ru": "друг", "fi": "ystävä" },
  "family": { "ru": "семья", "fi": "perhe" },
  "book": { "ru": "книга", "fi": "kirja" },
  "game": { "ru": "игра", "fi": "peli" },
  "dog": { "ru": "собака", "fi": "koira" },
  "cat": { "ru": "кошка", "fi": "kissa" },
  "car": { "ru": "машина", "fi": "auto" },
  "time": { "ru": "время", "fi": "aika" },
  "world": { "ru": "мир", "fi": "maailma" },
  "life": { "ru": "жизнь", "fi": "elämä" },
  "money": { "ru": "деньги", "fi": "raha" },
  "work": { "ru": "работа", "fi": "työ" },
  "man": { "ru": "мужчина", "fi": "mies" },
  "woman": { "ru": "женщина", "fi": "nainen" },
  "child": { "ru": "ребёнок", "fi": "lapsi" },
  "people": { "ru": "люди", "fi": "ihmiset" },
  "big": { "ru": "большой", "fi": "iso" },
  "small": { "ru": "маленький", "fi": "pieni" },
  "new": { "ru": "новый", "fi": "uusi" },
  "old": { "ru": "старый", "fi": "vanha" },
  "beautiful": { "ru": "красивый", "fi": "kaunis" },
  "happy": { "ru": "счастливый", "fi": "iloinen" },
  "today": { "ru": "сегодня", "fi": "tänään" },
  "tomorrow": { "ru": "завтра", "fi": "huomenna" },
  "yesterday": { "ru": "вчера", "fi": "eilen" },
  "now": { "ru": "сейчас", "fi": "nyt" },
  "here": { "ru": "здесь", "fi": "täällä" },
  "there": { "ru": "там", "fi": "siellä" },
  "very": { "ru": "очень", "fi": "hyvin" },
  "well": { "ru": "хорошо", "fi": "hyvin" },
  "okay": { "ru": "хорошо", "fi": "okei" },
  "welcome": { "ru": "добро пожаловать", "fi": "tervetuloa" },
};

// Finnish word translations (for breakdown)
const FI_WORD_TRANSLATIONS = {
  "hei": { "ru": "привет", "en": "hello" },
  "moi": { "ru": "привет", "en": "hi" },
  "terve": { "ru": "привет", "en": "hello" },
  "kiitos": { "ru": "спасибо", "en": "thank you" },
  "anteeksi": { "ru": "извините", "en": "sorry" },
  "kyllä": { "ru": "да", "en": "yes" },
  "ei": { "ru": "нет", "en": "no" },
  "hyvä": { "ru": "хороший", "en": "good" },
  "huono": { "ru": "плохой", "en": "bad" },
  "päivä": { "ru": "день", "en": "day" },
  "yö": { "ru": "ночь", "en": "night" },
  "aamu": { "ru": "утро", "en": "morning" },
  "ilta": { "ru": "вечер", "en": "evening" },
  "minä": { "ru": "я", "en": "I" },
  "sinä": { "ru": "ты", "en": "you" },
  "hän": { "ru": "он/она", "en": "he/she" },
  "me": { "ru": "мы", "en": "we" },
  "te": { "ru": "вы", "en": "you (pl.)" },
  "he": { "ru": "они", "en": "they" },
  "on": { "ru": "есть", "en": "is" },
  "ja": { "ru": "и", "en": "and" },
  "tai": { "ru": "или", "en": "or" },
  "mutta": { "ru": "но", "en": "but" },
  "koska": { "ru": "потому что", "en": "because" },
  "mitä": { "ru": "что", "en": "what" },
  "missä": { "ru": "где", "en": "where" },
  "milloin": { "ru": "когда", "en": "when" },
  "miksi": { "ru": "почему", "en": "why" },
  "miten": { "ru": "как", "en": "how" },
  "kuka": { "ru": "кто", "en": "who" },
  "nimi": { "ru": "имя", "en": "name" },
  "koti": { "ru": "дом", "en": "home" },
  "talo": { "ru": "дом", "en": "house" },
  "koulu": { "ru": "школа", "en": "school" },
  "työ": { "ru": "работа", "en": "work" },
  "vesi": { "ru": "вода", "en": "water" },
  "ruoka": { "ru": "еда", "en": "food" },
  "auto": { "ru": "машина", "en": "car" },
  "koira": { "ru": "собака", "en": "dog" },
  "kissa": { "ru": "кошка", "en": "cat" },
  "kirja": { "ru": "книга", "en": "book" },
  "peli": { "ru": "игра", "en": "game" },
  "raha": { "ru": "деньги", "en": "money" },
  "suomi": { "ru": "Финляндия/финский", "en": "Finland/Finnish" },
  "englanti": { "ru": "английский", "en": "English" },
  "venäjä": { "ru": "русский", "en": "Russian" },
  "kieli": { "ru": "язык", "en": "language" },
  "iso": { "ru": "большой", "en": "big" },
  "pieni": { "ru": "маленький", "en": "small" },
  "uusi": { "ru": "новый", "en": "new" },
  "vanha": { "ru": "старый", "en": "old" },
  "kaunis": { "ru": "красивый", "en": "beautiful" },
  "nopea": { "ru": "быстрый", "en": "fast" },
  "hidas": { "ru": "медленный", "en": "slow" },
  "kuuma": { "ru": "горячий", "en": "hot" },
  "kylmä": { "ru": "холодный", "en": "cold" },
  "ihminen": { "ru": "человек", "en": "person" },
  "mies": { "ru": "мужчина", "en": "man" },
  "nainen": { "ru": "женщина", "en": "woman" },
  "lapsi": { "ru": "ребёнок", "en": "child" },
  "perhe": { "ru": "семья", "en": "family" },
  "ystävä": { "ru": "друг", "en": "friend" },
  "äiti": { "ru": "мама", "en": "mother" },
  "isä": { "ru": "папа", "en": "father" },
  "nyt": { "ru": "сейчас", "en": "now" },
  "tänään": { "ru": "сегодня", "en": "today" },
  "huomenna": { "ru": "завтра", "en": "tomorrow" },
  "eilen": { "ru": "вчера", "en": "yesterday" },
  "paljon": { "ru": "много", "en": "much/many" },
  "vähän": { "ru": "мало", "en": "little/few" },
  "hyvin": { "ru": "хорошо", "en": "well" },
  "aina": { "ru": "всегда", "en": "always" },
  "ehkä": { "ru": "может быть", "en": "maybe" },
  "puhelin": { "ru": "телефон", "en": "phone" },
  "sana": { "ru": "слово", "en": "word" },
  "aika": { "ru": "время", "en": "time" },
  "maailma": { "ru": "мир", "en": "world" },
  "elämä": { "ru": "жизнь", "en": "life" },
  "näkemiin": { "ru": "до свидания", "en": "goodbye" },
};

// Russian word translations (for breakdown)
const RU_WORD_TRANSLATIONS = {
  "привет": { "en": "hello", "fi": "hei" },
  "здравствуйте": { "en": "hello (formal)", "fi": "hyvää päivää" },
  "пока": { "en": "bye", "fi": "heippa" },
  "до": { "en": "until/to", "fi": "asti" },
  "свидания": { "en": "meeting", "fi": "tapaaminen" },
  "спасибо": { "en": "thank you", "fi": "kiitos" },
  "пожалуйста": { "en": "please", "fi": "ole hyvä" },
  "да": { "en": "yes", "fi": "kyllä" },
  "нет": { "en": "no", "fi": "ei" },
  "извините": { "en": "sorry", "fi": "anteeksi" },
  "хорошо": { "en": "good/well", "fi": "hyvä" },
  "плохо": { "en": "bad", "fi": "huono" },
  "утро": { "en": "morning", "fi": "aamu" },
  "день": { "en": "day", "fi": "päivä" },
  "вечер": { "en": "evening", "fi": "ilta" },
  "ночь": { "en": "night", "fi": "yö" },
  "я": { "en": "I", "fi": "minä" },
  "ты": { "en": "you", "fi": "sinä" },
  "он": { "en": "he", "fi": "hän" },
  "она": { "en": "she", "fi": "hän" },
  "мы": { "en": "we", "fi": "me" },
  "вы": { "en": "you (pl.)", "fi": "te" },
  "они": { "en": "they", "fi": "he" },
  "что": { "en": "what", "fi": "mitä" },
  "где": { "en": "where", "fi": "missä" },
  "когда": { "en": "when", "fi": "milloin" },
  "почему": { "en": "why", "fi": "miksi" },
  "как": { "en": "how", "fi": "miten" },
  "кто": { "en": "who", "fi": "kuka" },
  "имя": { "en": "name", "fi": "nimi" },
  "дом": { "en": "house", "fi": "talo" },
  "школа": { "en": "school", "fi": "koulu" },
  "работа": { "en": "work", "fi": "työ" },
  "вода": { "en": "water", "fi": "vesi" },
  "еда": { "en": "food", "fi": "ruoka" },
  "друг": { "en": "friend", "fi": "ystävä" },
  "семья": { "en": "family", "fi": "perhe" },
  "книга": { "en": "book", "fi": "kirja" },
  "время": { "en": "time", "fi": "aika" },
  "мир": { "en": "world", "fi": "maailma" },
  "жизнь": { "en": "life", "fi": "elämä" },
  "деньги": { "en": "money", "fi": "raha" },
  "машина": { "en": "car", "fi": "auto" },
  "собака": { "en": "dog", "fi": "koira" },
  "кошка": { "en": "cat", "fi": "kissa" },
  "большой": { "en": "big", "fi": "iso" },
  "маленький": { "en": "small", "fi": "pieni" },
  "новый": { "en": "new", "fi": "uusi" },
  "старый": { "en": "old", "fi": "vanha" },
  "красивый": { "en": "beautiful", "fi": "kaunis" },
  "сегодня": { "en": "today", "fi": "tänään" },
  "завтра": { "en": "tomorrow", "fi": "huomenna" },
  "вчера": { "en": "yesterday", "fi": "eilen" },
  "сейчас": { "en": "now", "fi": "nyt" },
  "здесь": { "en": "here", "fi": "täällä" },
  "там": { "en": "there", "fi": "siellä" },
  "и": { "en": "and", "fi": "ja" },
  "или": { "en": "or", "fi": "tai" },
  "но": { "en": "but", "fi": "mutta" },
  "не": { "en": "not", "fi": "ei" },
  "очень": { "en": "very", "fi": "hyvin" },
  "много": { "en": "many", "fi": "paljon" },
  "мало": { "en": "few", "fi": "vähän" },
  "всегда": { "en": "always", "fi": "aina" },
  "никогда": { "en": "never", "fi": "ei koskaan" },
  "человек": { "en": "person", "fi": "ihminen" },
  "мужчина": { "en": "man", "fi": "mies" },
  "женщина": { "en": "woman", "fi": "nainen" },
  "ребёнок": { "en": "child", "fi": "lapsi" },
  "мама": { "en": "mother", "fi": "äiti" },
  "папа": { "en": "father", "fi": "isä" },
  "люблю": { "en": "I love", "fi": "rakastan" },
  "хочу": { "en": "I want", "fi": "haluan" },
  "знаю": { "en": "I know", "fi": "tiedän" },
  "могу": { "en": "I can", "fi": "voin" },
  "игра": { "en": "game", "fi": "peli" },
  "телефон": { "en": "phone", "fi": "puhelin" },
};

// ============================================================
// Rule-based transcription engines
// ============================================================

/**
 * English → Russian (rule-based fallback)
 */
function transcribeEnByRules(word) {
  const w = word.toLowerCase();
  let result = "";
  let i = 0;

  while (i < w.length) {
    const rest = w.substring(i);
    const c = w[i];
    const next = w[i + 1] || "";
    const next2 = w[i + 2] || "";
    const prev = w[i - 1] || "";

    // Multi-char patterns
    if (rest.startsWith("tion")) { result += "шен"; i += 4; continue; }
    if (rest.startsWith("sion")) { result += "жен"; i += 4; continue; }
    if (rest.startsWith("ight")) { result += "айт"; i += 4; continue; }
    if (rest.startsWith("ough")) { result += "о"; i += 4; continue; }
    if (rest.startsWith("ould")) { result += "уд"; i += 4; continue; }
    if (rest.startsWith("ture")) { result += "чер"; i += 4; continue; }
    if (rest.startsWith("sure")) { result += "жер"; i += 4; continue; }
    if (rest.startsWith("tch")) { result += "ч"; i += 3; continue; }
    if (rest.startsWith("sch")) { result += "ск"; i += 3; continue; }
    if (rest.startsWith("ght")) { result += "т"; i += 3; continue; }
    if (rest.startsWith("dge")) { result += "дж"; i += 3; continue; }
    if (rest.startsWith("ing")) { result += "инг"; i += 3; continue; }
    if (rest.startsWith("ous")) { result += "эс"; i += 3; continue; }
    if (rest.startsWith("ble")) { result += "бл"; i += 3; continue; }
    if (rest.startsWith("ple")) { result += "пл"; i += 3; continue; }
    if (rest.startsWith("tle")) { result += "тл"; i += 3; continue; }
    if (rest.startsWith("all")) { result += "ол"; i += 3; continue; }
    if (rest.startsWith("aw")) { result += "о"; i += 2; continue; }
    if (rest.startsWith("th")) { result += "з"; i += 2; continue; }
    if (rest.startsWith("sh")) { result += "ш"; i += 2; continue; }
    if (rest.startsWith("ch")) { result += "ч"; i += 2; continue; }
    if (rest.startsWith("ph")) { result += "ф"; i += 2; continue; }
    if (rest.startsWith("wh")) { result += "в"; i += 2; continue; }
    if (rest.startsWith("wr")) { result += "р"; i += 2; continue; }
    if (rest.startsWith("kn")) { result += "н"; i += 2; continue; }
    if (rest.startsWith("gn")) { result += "н"; i += 2; continue; }
    if (rest.startsWith("ck")) { result += "к"; i += 2; continue; }
    if (rest.startsWith("qu")) { result += "кв"; i += 2; continue; }
    if (rest.startsWith("gh")) { i += 2; continue; }
    if (rest.startsWith("oo")) { result += "у"; i += 2; continue; }
    if (rest.startsWith("ee")) { result += "и"; i += 2; continue; }
    if (rest.startsWith("ea")) { result += "и"; i += 2; continue; }
    if (rest.startsWith("ai")) { result += "эй"; i += 2; continue; }
    if (rest.startsWith("ay")) { result += "эй"; i += 2; continue; }
    if (rest.startsWith("ey")) { result += "эй"; i += 2; continue; }
    if (rest.startsWith("oi")) { result += "ой"; i += 2; continue; }
    if (rest.startsWith("oy")) { result += "ой"; i += 2; continue; }
    if (rest.startsWith("ou")) { result += "ау"; i += 2; continue; }
    if (rest.startsWith("ow") && (i + 2 >= w.length || "nlr".includes(next2))) { result += "оу"; i += 2; continue; }
    if (rest.startsWith("ow")) { result += "ау"; i += 2; continue; }
    if (rest.startsWith("ie") && i + 2 < w.length) { result += "и"; i += 2; continue; }
    if (rest.startsWith("ei")) { result += "эй"; i += 2; continue; }
    if (rest.startsWith("ew")) { result += "ю"; i += 2; continue; }
    if (rest.startsWith("ue")) { result += "у"; i += 2; continue; }
    if (rest.startsWith("ui")) { result += "у"; i += 2; continue; }

    switch (c) {
      case "a":
        if (next === "e" || (i + 2 < w.length && w[i + 2] === "e" && !"aeiou".includes(next)))
          result += "эй";
        else result += "э";
        break;
      case "e":
        if (i === w.length - 1 && w.length > 2) { /* silent */ }
        else if (i === w.length - 1) result += "и";
        else result += "э";
        break;
      case "i":
        if (next && !"aeiou".includes(next) && w[i + 2] === "e") result += "ай";
        else result += "и";
        break;
      case "o":
        if (next === "e" && i + 2 >= w.length) result += "оу";
        else result += "о";
        break;
      case "u": result += "а"; break;
      case "y":
        if (i === 0) result += "й";
        else result += "и";
        break;
      case "b": result += "б"; break;
      case "c": result += ("eiy".includes(next) ? "с" : "к"); break;
      case "d": result += "д"; break;
      case "f": result += "ф"; break;
      case "g": result += "г"; break;
      case "h": result += "х"; break;
      case "j": result += "дж"; break;
      case "k": result += "к"; break;
      case "l": result += "л"; break;
      case "m": result += "м"; break;
      case "n": result += "н"; break;
      case "p": result += "п"; break;
      case "r": result += "р"; break;
      case "s":
        if ("aeiou".includes(prev) && "aeiou".includes(next)) result += "з";
        else result += "с";
        break;
      case "t": result += "т"; break;
      case "v": result += "в"; break;
      case "w": result += "в"; break;
      case "x": result += "кс"; break;
      case "z": result += "з"; break;
      default: result += c;
    }
    i++;
  }
  return result;
}

/**
 * Finnish → Russian (rule-based).
 * Finnish is very phonetic, so rules cover almost everything.
 */
function transcribeFiByRules(word) {
  const w = word.toLowerCase();
  let result = "";
  let i = 0;

  while (i < w.length) {
    const c = w[i];
    const next = w[i + 1] || "";
    const rest = w.substring(i);

    // Double vowels (long)
    if (rest.startsWith("aa")) { result += "аа"; i += 2; continue; }
    if (rest.startsWith("ee")) { result += "ээ"; i += 2; continue; }
    if (rest.startsWith("ii")) { result += "ии"; i += 2; continue; }
    if (rest.startsWith("oo")) { result += "оо"; i += 2; continue; }
    if (rest.startsWith("uu")) { result += "уу"; i += 2; continue; }
    if (rest.startsWith("yy")) { result += "юю"; i += 2; continue; }
    if (rest.startsWith("ää")) { result += "яя"; i += 2; continue; }
    if (rest.startsWith("öö")) { result += "ёё"; i += 2; continue; }

    // Diphthongs
    if (rest.startsWith("ai")) { result += "ай"; i += 2; continue; }
    if (rest.startsWith("ei")) { result += "эй"; i += 2; continue; }
    if (rest.startsWith("oi")) { result += "ой"; i += 2; continue; }
    if (rest.startsWith("ui")) { result += "уй"; i += 2; continue; }
    if (rest.startsWith("yi")) { result += "юй"; i += 2; continue; }
    if (rest.startsWith("äi")) { result += "яй"; i += 2; continue; }
    if (rest.startsWith("öi")) { result += "ёй"; i += 2; continue; }
    if (rest.startsWith("au")) { result += "ау"; i += 2; continue; }
    if (rest.startsWith("eu")) { result += "эу"; i += 2; continue; }
    if (rest.startsWith("ou")) { result += "оу"; i += 2; continue; }
    if (rest.startsWith("iu")) { result += "иу"; i += 2; continue; }
    if (rest.startsWith("äy")) { result += "яю"; i += 2; continue; }
    if (rest.startsWith("öy")) { result += "ёю"; i += 2; continue; }
    if (rest.startsWith("ey")) { result += "эю"; i += 2; continue; }
    if (rest.startsWith("ie")) { result += "иэ"; i += 2; continue; }
    if (rest.startsWith("uo")) { result += "уо"; i += 2; continue; }
    if (rest.startsWith("yö")) { result += "юё"; i += 2; continue; }

    // Double consonants
    if (c === next && "bcdfghjklmnpqrstvwxz".includes(c)) {
      // Double consonant = same sound but longer/geminate
      result += getFinConsonant(c) + getFinConsonant(c);
      i += 2;
      continue;
    }

    // Special combos
    if (rest.startsWith("nk")) { result += "нк"; i += 2; continue; }
    if (rest.startsWith("ng")) { result += "нг"; i += 2; continue; }

    // Single characters
    switch (c) {
      case "a": result += "а"; break;
      case "e": result += "э"; break;
      case "i": result += "и"; break;
      case "o": result += "о"; break;
      case "u": result += "у"; break;
      case "y": result += "ю"; break;
      case "ä": result += "я"; break;
      case "ö": result += "ё"; break;
      default:
        result += getFinConsonant(c);
    }
    i++;
  }
  return result;
}

function getFinConsonant(c) {
  const map = {
    "b": "б", "c": "к", "d": "д", "f": "ф", "g": "г",
    "h": "х", "j": "й", "k": "к", "l": "л", "m": "м",
    "n": "н", "p": "п", "q": "к", "r": "р", "s": "с",
    "t": "т", "v": "в", "w": "в", "x": "кс", "z": "з",
  };
  return map[c] || c;
}

// ============================================================
// Public API
// ============================================================

/**
 * Get Russian transcription of a word in the given language.
 */
function getTranscription(word, lang) {
  const lower = word.toLowerCase().replace(/[^a-zäöüåéèêëàâîïôùûçñß'-]/g, "");
  if (!lower) return "";

  if (lang === "ru") {
    // Russian is already in Cyrillic — return as-is
    return word.toLowerCase();
  }

  if (lang === "en") {
    return EN_TRANSCRIPTION[lower] || transcribeEnByRules(lower);
  }

  if (lang === "fi") {
    return FI_TRANSCRIPTION[lower] || transcribeFiByRules(lower);
  }

  return "";
}

/**
 * Get word translation for breakdown display.
 * Returns translation in the target language.
 */
function getWordTranslation(word, fromLang, toLang) {
  const lower = word.toLowerCase();

  if (fromLang === "en" && EN_WORD_TRANSLATIONS[lower]) {
    return EN_WORD_TRANSLATIONS[lower][toLang] || null;
  }
  if (fromLang === "fi" && FI_WORD_TRANSLATIONS[lower]) {
    return FI_WORD_TRANSLATIONS[lower][toLang] || null;
  }
  if (fromLang === "ru" && RU_WORD_TRANSLATIONS[lower]) {
    return RU_WORD_TRANSLATIONS[lower][toLang] || null;
  }
  return null;
}

/**
 * Transcribe a full sentence.
 */
function transcribeSentence(text, lang) {
  if (lang === "ru") return text; // Already Cyrillic

  const wordPattern = lang === "fi"
    ? /([a-zA-ZäöåÄÖÅ]+)/g
    : /([a-zA-Z]+)/g;

  const parts = text.split(wordPattern);
  return parts.map(token => {
    if (wordPattern.test(token)) {
      wordPattern.lastIndex = 0; // reset regex state
      return getTranscription(token, lang);
    }
    return token;
  }).join("");
}

/**
 * Detect if text contains Cyrillic characters.
 */
function isCyrillic(text) {
  return /[а-яА-ЯёЁ]/.test(text);
}

/**
 * Detect if text contains Finnish-specific characters.
 */
function hasFinnishChars(text) {
  return /[äöåÄÖÅ]/.test(text);
}

window.TranscriptionEngine = {
  getTranscription,
  getWordTranslation,
  transcribeSentence,
  isCyrillic,
  hasFinnishChars,
};
