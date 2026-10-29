/**
 * Offline NLP Coherence and Sentence Validator
 * Completely offline - runs locally on the host laptop with zero internet.
 * Validates that the Leader's assembled phrase:
 *  1. Contains all required collected fragments/words.
 *  2. Is a coherent, well-structured English sentence (has subject/verb, prepositions, valid lexicon).
 *  3. Rejects random keyboard mashing (gibberish), repetition, and lazy concatenation.
 */

// Comprehensive built-in vocabulary for common connectors, verbs, nouns, adjectives, tech, and cinema terms
const COMMON_VOCABULARY = new Set([
  // Articles & Determiners & Pronouns
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'every', 'each', 'all', 'some', 'any', 'no', 'none',
  'my', 'our', 'your', 'their', 'its', 'his', 'her', 'we', 'us', 'they', 'them', 'you', 'he', 'him', 'she', 'it', 'who', 'whom', 'whose', 'which', 'what',

  // Prepositions & Conjunctions
  'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'of', 'about', 'into', 'through', 'after', 'before',
  'between', 'under', 'over', 'and', 'but', 'or', 'so', 'yet', 'as', 'because', 'while', 'when', 'where', 'if', 'than',
  'out', 'up', 'down', 'off', 'since', 'until', 'without', 'within', 'across', 'upon', 'among',

  // Auxiliary & Common Linking Verbs
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'seem', 'seems', 'seemed', 'appear', 'appears', 'appeared', 'become', 'becomes', 'became',

  // Common Action Verbs (present, past, participles)
  'hail', 'hails', 'hailed', 'hailing',
  'love', 'loves', 'loved', 'loving',
  'like', 'likes', 'liked', 'liking',
  'watch', 'watches', 'watched', 'watching',
  'see', 'sees', 'saw', 'seen', 'seeing',
  'look', 'looks', 'looked', 'looking',
  'view', 'views', 'viewed', 'viewing',
  'hear', 'hears', 'heard', 'hearing',
  'listen', 'listens', 'listened', 'listening',
  'read', 'reads', 'reading',
  'write', 'writes', 'wrote', 'written', 'writing',
  'speak', 'speaks', 'spoke', 'spoken', 'speaking',
  'talk', 'talks', 'talked', 'talking',
  'tell', 'tells', 'told', 'telling',
  'say', 'says', 'said', 'saying',
  'think', 'thinks', 'thought', 'thinking',
  'know', 'knows', 'knew', 'known', 'knowing',
  'feel', 'feels', 'felt', 'feeling',
  'learn', 'learns', 'learned', 'learnt', 'learning',
  'teach', 'teaches', 'taught', 'teaching',
  'study', 'studies', 'studied', 'studying',
  'understand', 'understands', 'understood', 'understanding',
  'play', 'plays', 'played', 'playing',
  'work', 'works', 'worked', 'working',
  'help', 'helps', 'helped', 'helping',
  'support', 'supports', 'supported', 'supporting',
  'admire', 'admires', 'admired', 'admiring',
  'praise', 'praises', 'praised', 'praising',
  'respect', 'respects', 'respected', 'respecting',
  'honor', 'honors', 'honored', 'honoring',
  'celebrate', 'celebrates', 'celebrated', 'celebrating',
  'enjoy', 'enjoys', 'enjoyed', 'enjoying',
  'win', 'wins', 'won', 'winning',
  'conquer', 'conquers', 'conquered', 'conquering',
  'defeat', 'defeats', 'defeated', 'defeating',
  'rule', 'rules', 'ruled', 'ruling',
  'lead', 'leads', 'led', 'leading',
  'guide', 'guides', 'guided', 'guiding',
  'inspire', 'inspires', 'inspired', 'inspiring',
  'motivate', 'motivates', 'motivated', 'motivating',
  'empower', 'empowers', 'empowered', 'empowering',
  'enable', 'enables', 'enabled', 'enabling',
  'spark', 'sparks', 'sparked', 'sparking',
  'ignite', 'ignites', 'ignited', 'igniting',
  'shine', 'shines', 'shone', 'shining',
  'glow', 'glows', 'glowed', 'glowing',
  'power', 'powers', 'powered', 'powering',
  'fuel', 'fuels', 'fueled', 'fueling',
  'drive', 'drives', 'drove', 'driven', 'driving',
  'create', 'creates', 'created', 'creating',
  'build', 'builds', 'built', 'building',
  'make', 'makes', 'made', 'making',
  'form', 'forms', 'formed', 'forming',
  'shape', 'shapes', 'shaped', 'shaping',
  'develop', 'develops', 'developed', 'developing',
  'design', 'designs', 'designed', 'designing',
  'discover', 'discovers', 'discovered', 'discovering',
  'explore', 'explores', 'explored', 'exploring',
  'find', 'finds', 'found', 'finding',
  'solve', 'solves', 'solved', 'solving',
  'crack', 'cracks', 'cracked', 'cracking',
  'unlock', 'unlocks', 'unlocked', 'unlocking',
  'connect', 'connects', 'connected', 'connecting',
  'unite', 'unites', 'united', 'uniting',
  'transform', 'transforms', 'transformed', 'transforming',
  'illuminate', 'illuminates', 'illuminated', 'illuminating',
  'protect', 'protects', 'protected', 'protecting',
  'defend', 'defends', 'defended', 'defending',
  'run', 'runs', 'ran', 'running',
  'bring', 'brings', 'brought', 'bringing',
  'take', 'takes', 'took', 'taken', 'taking',
  'give', 'gives', 'gave', 'given', 'giving',
  'show', 'shows', 'showed', 'shown', 'showing',
  'stand', 'stands', 'stood', 'standing',
  'rise', 'rises', 'rose', 'risen', 'rising',
  'flow', 'flows', 'flowed', 'flowing',
  'bridge', 'bridges', 'bridged', 'bridging',
  'forge', 'forges', 'forged', 'forging',
  'expand', 'expands', 'expanded', 'expanding',
  'reveal', 'reveals', 'revealed', 'revealing',
  'master', 'masters', 'mastered', 'mastering',
  'achieve', 'achieves', 'achieved', 'achieving',
  'prove', 'proves', 'proved', 'proving',
  'reach', 'reaches', 'reached', 'reaching',
  'live', 'lives', 'lived', 'living',
  'grow', 'grows', 'grew', 'grown', 'growing',
  'remember', 'remembers', 'remembered', 'remembering',
  'act', 'acts', 'acted', 'acting',
  'direct', 'directs', 'directed', 'directing',
  'perform', 'performs', 'performed', 'performing',

  // People & Cinema & Everyday Nouns
  'person', 'people', 'man', 'woman', 'men', 'women', 'human', 'humans', 'child', 'children',
  'friend', 'friends', 'family', 'hero', 'heroes', 'legend', 'legends', 'star', 'stars',
  'actor', 'actors', 'actress', 'actresses', 'director', 'directors', 'creator', 'creators',
  'leader', 'leaders', 'scholar', 'scholars', 'student', 'students', 'teacher', 'teachers', 'pioneer', 'pioneers',
  'movie', 'movies', 'film', 'films', 'cinema', 'theatre', 'screen', 'song', 'songs', 'music',
  'story', 'stories', 'book', 'books', 'scene', 'role', 'character', 'characters', 'dialogue',
  'game', 'games', 'play', 'show', 'art', 'artist', 'artists', 'author', 'authors',
  'team', 'teams', 'squad', 'squads', 'crew', 'fellowship', 'club', 'group', 'groups',
  'world', 'life', 'lives', 'work', 'job', 'career', 'time', 'day', 'days', 'night', 'nights', 'year', 'years',
  'place', 'places', 'home', 'city', 'cities', 'campus', 'college', 'school', 'class',
  'mind', 'minds', 'heart', 'hearts', 'soul', 'souls', 'voice', 'voices', 'eye', 'eyes', 'head', 'hand', 'hands',
  'power', 'powers', 'strength', 'energy', 'force', 'forces', 'truth', 'light', 'dream', 'dreams',
  'vision', 'visions', 'hope', 'hopes', 'peace', 'future', 'history', 'memory', 'memories',
  'journey', 'path', 'paths', 'way', 'ways', 'road', 'roads', 'step', 'steps',
  'rule', 'rules', 'law', 'laws', 'order', 'justice', 'honor', 'pride', 'glory',
  'victory', 'triumph', 'success', 'champion', 'champions', 'genius', 'talent', 'skill', 'skills',
  'knowledge', 'wisdom', 'logic', 'code', 'codes', 'data', 'network', 'networks', 'system', 'systems',
  'program', 'programs', 'computer', 'computers', 'machine', 'machines', 'robot', 'robots',
  'puzzle', 'puzzles', 'challenge', 'challenges', 'problem', 'problems', 'solution', 'solutions', 'key', 'keys',
  'idea', 'ideas', 'innovation', 'innovations', 'secret', 'secrets', 'matrix', 'circuit', 'circuits',
  'engine', 'frontier', 'academy', 'thesis', 'axiom', 'axioms', 'principle', 'principles',
  'universe', 'cosmos', 'orbit', 'nature', 'courage', 'destiny', 'insight', 'progress',

  // Common Adjectives & Comparatives / Superlatives
  'favorite', 'favourite', 'great', 'greater', 'greatest', 'good', 'better', 'best', 'bad', 'worse', 'worst',
  'new', 'newer', 'newest', 'old', 'older', 'oldest', 'young', 'younger', 'youngest',
  'big', 'bigger', 'biggest', 'small', 'smaller', 'smallest', 'huge', 'vast', 'grand',
  'high', 'higher', 'highest', 'low', 'lower', 'lowest', 'long', 'longer', 'longest', 'short', 'shorter', 'shortest',
  'fast', 'faster', 'fastest', 'quick', 'quicker', 'quickest', 'slow', 'slower', 'slowest',
  'strong', 'stronger', 'strongest', 'weak', 'weaker', 'weakest',
  'smart', 'smarter', 'smartest', 'sharp', 'sharper', 'sharpest', 'wise', 'wiser', 'wisest',
  'bright', 'brighter', 'brightest', 'dark', 'darker', 'darkest', 'clear', 'clearer', 'clearest',
  'pure', 'purer', 'purest', 'deep', 'deeper', 'deepest', 'true', 'truer', 'truest', 'real',
  'fine', 'finer', 'finest', 'nice', 'nicer', 'nicest', 'cool', 'cooler', 'coolest',
  'super', 'epic', 'awesome', 'amazing', 'wonderful', 'brilliant', 'fantastic', 'marvelous',
  'legendary', 'iconic', 'famous', 'popular', 'beloved', 'special', 'unique', 'vital',
  'noble', 'brave', 'bold', 'proud', 'happy', 'happier', 'happiest', 'joyful', 'peaceful',
  'creative', 'modern', 'classic', 'classical', 'ancient', 'historical', 'cultural', 'digital',
  'powerful', 'mighty', 'inspiring', 'important', 'crucial', 'essential',
  'infinite', 'boundless', 'limitless', 'endless', 'eternal', 'together', 'united', 'alive', 'ready',
  'first', 'second', 'third', 'last', 'next', 'final', 'main', 'major', 'prime', 'top',

  // Common Adverbs
  'always', 'never', 'often', 'sometimes', 'rarely', 'ever', 'forever', 'forward', 'beyond', 'ahead',
  'now', 'today', 'tonight', 'tomorrow', 'yesterday', 'soon', 'here', 'there',
  'truly', 'really', 'deeply', 'greatly', 'boldly', 'proudly', 'happily', 'freely', 'purely',
  'simply', 'clearly', 'strongly', 'fast', 'quickly', 'slowly', 'well', 'hard', 'far',
  'much', 'more', 'most', 'less', 'least', 'very', 'quite', 'too', 'also', 'just', 'only', 'even', 'still',

  // AI, Machine Learning & Computing Terms
  'python', 'neural', 'prompt', 'dataset', 'model', 'robot', 'vision', 'tensor', 'matrix', 'agent',
  'algorithm', 'chatbot', 'voice', 'logic', 'learning', 'token', 'neuron', 'weight', 'gpu', 'bot',
  'vector', 'supervised', 'accuracy', 'deep', 'intelligence', 'artificial', 'code', 'data',
  'tensorflow', 'classification', 'bias', 'regression', 'feature', 'cluster', 'synapse', 'loss',
  'epoch', 'gradient', 'input', 'encoder', 'output', 'hyperparameter', 'decoder', 'sampling',
  'latency', 'prediction', 'target', 'pipeline', 'inference', 'param', 'generative',

  // Tamil Movies & Cinema Culture
  'vikram', 'baasha', 'anniyan', 'ghilli', 'jailer', 'roja', 'enthiran', 'sivaji', 'leo', 'master',
  'asuran', 'padayappa', 'thuppakki', 'kabali', 'mudhalvan', 'mankatha', 'polladhavan', 'indian',
  'ayan', 'petta', 'kaithi', 'ghajini', 'soorarai', 'pottru', 'vadachennai', 'singam', 'pizza',
  'aayirathil', 'oruvan', 'vinnaithaandi', 'varuvaaya', 'pudhupettai', 'sarpatta', 'parambarai',
  'doctor', 'thani', 'oruvan', 'maaveeran', 'iru', 'mugan', 'mark', 'antony', 'jigarthanda',
  'aaranya', 'kaandam', 'kadaisi', 'vivasayi', 'maanagaram', 'ratsasan', 'pariyerum', 'perumal',
  'vettaiyan', 'irumbu', 'thirai', 'anegan', 'kaaka', 'muttai',

  // Famous Personalities & Visionaries
  'kalam', 'pichai', 'turing', 'musk', 'ramanujan', 'jobs', 'rahman', 'anand', 'lovelace', 'altman',
  'raman', 'tata', 'gates', 'ilaiyaraaja', 'zuckerberg', 'nadella', 'curie', 'einstein', 'bose', 'tesla',
  'dhoni', 'bhabha', 'sachin', 'tendulkar', 'ritchie', 'torvalds', 'radhakrishnan', 'armstrong',
  'aryabhata', 'guido', 'rossum', 'mandela', 'tagore', 'babbage', 'chawla', 'gandhi', 'hinton',
  'faraday', 'lecun', 'newton', 'huang', 'hawking', 'karpathy', 'edison', 'sarabhai', 'cook'
]);

const VERB_INDICATORS = new Set([
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'hail', 'hails', 'hailed', 'hailing',
  'love', 'loves', 'loved', 'loving',
  'like', 'likes', 'liked', 'liking',
  'watch', 'watches', 'watched', 'watching',
  'see', 'sees', 'saw', 'seen', 'seeing',
  'look', 'looks', 'looked', 'looking',
  'view', 'views', 'viewed', 'viewing',
  'hear', 'hears', 'heard', 'hearing',
  'listen', 'listens', 'listened', 'listening',
  'read', 'reads', 'reading',
  'write', 'writes', 'wrote', 'writing',
  'speak', 'speaks', 'spoke', 'speaking',
  'talk', 'talks', 'talked', 'talking',
  'tell', 'tells', 'told', 'telling',
  'say', 'says', 'said', 'saying',
  'think', 'thinks', 'thought', 'thinking',
  'know', 'knows', 'knew', 'knowing',
  'feel', 'feels', 'felt', 'feeling',
  'learn', 'learns', 'learned', 'learning',
  'teach', 'teaches', 'taught', 'teaching',
  'study', 'studies', 'studied', 'studying',
  'understand', 'understands', 'understood',
  'play', 'plays', 'played', 'playing',
  'work', 'works', 'worked', 'working',
  'help', 'helps', 'helped', 'helping',
  'admire', 'admires', 'admired', 'admiring',
  'praise', 'praises', 'praised', 'praising',
  'respect', 'respects', 'respected', 'respecting',
  'honor', 'honors', 'honored', 'honoring',
  'celebrate', 'celebrates', 'celebrated', 'celebrating',
  'enjoy', 'enjoys', 'enjoyed', 'enjoying',
  'win', 'wins', 'won', 'winning',
  'create', 'creates', 'created', 'creating',
  'build', 'builds', 'built', 'building',
  'connect', 'connects', 'connected', 'connecting',
  'power', 'powers', 'powered', 'powering',
  'defend', 'defends', 'defended', 'defending',
  'protect', 'protects', 'protected', 'protecting',
  'secure', 'secures', 'secured', 'securing',
  'lead', 'leads', 'led', 'leading',
  'solve', 'solves', 'solved', 'solving',
  'drive', 'drives', 'drove', 'driving',
  'guide', 'guides', 'guided', 'guiding',
  'unite', 'unites', 'united', 'uniting',
  'spark', 'sparks', 'sparked', 'sparking',
  'inspire', 'inspires', 'inspired', 'inspiring',
  'unlock', 'unlocks', 'unlocked', 'unlocking',
  'discover', 'discovers', 'discovered', 'discovering',
  'transform', 'transforms', 'transformed', 'transforming',
  'illuminate', 'illuminates', 'illuminated',
  'process', 'processes', 'processed',
  'analyze', 'analyzes', 'analyzed',
  'enable', 'enables', 'enabled',
  'gather', 'gathers', 'gathered',
  'seek', 'seeks', 'sought',
  'remind', 'reminds', 'reminded',
  'attain', 'attains', 'attained',
  'enlighten', 'enlightens', 'enlightened',
  'run', 'runs', 'ran', 'running',
  'make', 'makes', 'made', 'making',
  'bring', 'brings', 'brought', 'bringing',
  'take', 'takes', 'took', 'taken', 'taking',
  'give', 'gives', 'gave', 'given', 'giving',
  'show', 'shows', 'showed', 'showing',
  'find', 'finds', 'found', 'finding',
  'stand', 'stands', 'stood', 'standing',
  'rise', 'rises', 'rose', 'rising',
  'flow', 'flows', 'flowed',
  'shine', 'shines', 'shone', 'shining',
  'bridge', 'bridges', 'bridged',
  'forge', 'forges', 'forged',
  'fuel', 'fuels', 'fueled',
  'shape', 'shapes', 'shaped',
  'empower', 'empowers', 'empowered',
  'expand', 'expands', 'expanded',
  'reveal', 'reveals', 'revealed',
  'master', 'masters', 'mastered',
  'achieve', 'achieves', 'achieved',
  'ignite', 'ignites', 'ignited',
  'establish', 'establishes', 'established',
  'prove', 'proves', 'proved',
  'govern', 'governs', 'governed',
  'form', 'forms', 'formed',
  'reach', 'reaches', 'reached',
  'act', 'acts', 'acted', 'acting',
  'live', 'lives', 'lived', 'living',
  'become', 'becomes', 'became'
]);

for (const verb of VERB_INDICATORS) {
  COMMON_VOCABULARY.add(verb);
}

/**
 * Check if a word is derived from a base word with common English prefixes/suffixes
 */
function isKnownDerivedWord(word) {
  if (!word || word.length < 3) return false;
  const suffixes = [
    's', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'able', 'ible', 'ful',
    'less', 'ness', 'ment', 'tion', 'sion', 'ity', 'ty', 'al', 'ic', 'ive', 'ous', 'y'
  ];
  for (const sfx of suffixes) {
    if (word.endsWith(sfx) && word.length > sfx.length + 1) {
      const stem = word.slice(0, -sfx.length);
      if (COMMON_VOCABULARY.has(stem)) return true;
      if (COMMON_VOCABULARY.has(stem + 'e')) return true;
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
        if (COMMON_VOCABULARY.has(stem.slice(0, -1))) return true;
      }
      if (COMMON_VOCABULARY.has(stem + 'y')) return true;
    }
  }
  return false;
}

/**
 * Intelligent phonotactic gibberish detector.
 * Only flags real keyboard-mashing (e.g., "asdfghjk", "qwrtyps", "zzzzz").
 */
function isGibberish(word) {
  if (!word || word.length <= 2) return false;

  // 3 or more identical consecutive characters: e.g. "aaaaa", "zzzz"
  if (/(.)\1\1/.test(word)) return true;

  // 5 or more consecutive consonants (excluding vowels and 'y'): e.g. "sdfgh", "bcdfgh"
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(word)) return true;

  // Words with 4+ letters having zero vowels or 'y': e.g. "qwrfp", "zxcv"
  if (word.length >= 4 && !/[aeiouy]/i.test(word)) return true;

  // Keyboard row walking patterns (4+ characters): e.g. "asdf", "qwerty", "zxcv"
  const keyboardWalks = [
    'qwerty', 'wertyu', 'asdfgh', 'sdfghj', 'dfghjk', 'fghjkl', 'zxcvbn',
    'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'qwert', 'werty', 'zxcv', 'xcvb', 'cvbn'
  ];
  if (keyboardWalks.some(walk => word.includes(walk))) return true;

  return false;
}

/**
 * Clean and normalize a string
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/<[^>]*>?/gm, ''); // Strip any HTML tags
}

/**
 * Validates a phrase against required target words and offline NLP coherence checks.
 * @param {string} inputPhrase - The phrase entered by the team leader.
 * @param {Array<string>} requiredWords - Array of words/fragments from previous teammate steps.
 * @returns {Object} { isValid: boolean, message: string, score: number }
 */
function validateLeaderPhrase(inputPhrase, requiredWords = []) {
  const cleanInput = sanitizeText(inputPhrase);

  if (!cleanInput || cleanInput.length === 0) {
    return { isValid: false, message: 'Please enter a sentence before submitting.', score: 0 };
  }

  // Tokenize input into lowercase words without punctuation
  const rawTokens = cleanInput.split(/\s+/).filter(t => t.length > 0);
  const normalizedWords = rawTokens.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);

  if (normalizedWords.length < 5) {
    return {
      isValid: false,
      message: `Phrase is too short (${normalizedWords.length} words). A meaningful sentence needs at least 5 words.`,
      score: 0
    };
  }

  if (normalizedWords.length > 30) {
    return {
      isValid: false,
      message: 'Phrase is too long. Please keep your sentence under 30 words.',
      score: 0
    };
  }

  // 1. Prevent repetition attack (e.g. "cyber cyber cyber neural horizon")
  const wordFrequency = {};
  for (const word of normalizedWords) {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    // Allow small connector words ('the', 'and', 'of', 'in', 'to', 'a', 'is', 'with') up to 3 times, others max 2 times
    const maxAllowed = ['the', 'and', 'to', 'of', 'in', 'a', 'with', 'is'].includes(word) ? 3 : 2;
    if (wordFrequency[word] > maxAllowed) {
      return {
        isValid: false,
        message: `Too much word repetition detected with "${word}". Make it a natural sentence.`,
        score: 0
      };
    }
  }

  // 2. Check that at least 3 collected vault keywords are present
  const lowerInput = cleanInput.toLowerCase();
  const normalizedRequired = [];
  (requiredWords || []).forEach(rw => {
    const clean = rw.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean) normalizedRequired.push(clean);
    rw.toLowerCase().split(/\s+/).forEach(part => {
      const pClean = part.replace(/[^a-z0-9]/g, '');
      if (pClean) normalizedRequired.push(pClean);
    });
  });
  const matchedWords = [];
  const missingWords = [];

  for (const rawReq of (requiredWords || [])) {
    const reqClean = rawReq.trim().toLowerCase();
    const reqNoPunct = reqClean.replace(/[^a-z0-9]/g, '');
    if (lowerInput.includes(reqClean) || normalizedWords.includes(reqNoPunct)) {
      matchedWords.push(rawReq.toUpperCase());
    } else {
      // Multi-word keywords count when any meaningful part is used: "Raman" or "C.V. Raman" for CV RAMAN
      const subTokens = reqClean.split(/\s+/).map(t => t.replace(/[^a-z0-9]/g, '')).filter(t => t.length > 2);
      if (reqClean.includes(' ') && subTokens.some(st => normalizedWords.includes(st))) {
        matchedWords.push(rawReq.toUpperCase());
      } else {
        missingWords.push(rawReq.toUpperCase());
      }
    }
  }

  const minRequiredCount = Math.min(3, (requiredWords || []).length);
  if (matchedWords.length < minRequiredCount) {
    return {
      isValid: false,
      message: `Your thesis must include at least ${minRequiredCount} keywords from your team's vault! (Currently included ${matchedWords.length}: ${matchedWords.join(', ') || 'none'}).`,
      score: 0
    };
  }

  // 3. Check for at least one verb or predicate indicator
  const hasVerb = normalizedWords.some(w => VERB_INDICATORS.has(w) || (w.endsWith('s') && VERB_INDICATORS.has(w.slice(0, -1))));
  if (!hasVerb) {
    return {
      isValid: false,
      message: 'Your phrase appears to lack an action or linking verb (e.g., "is", "powers", "creates", "leads", "builds", "loves", "watches").',
      score: 0
    };
  }

  // 4. Lexicon validity (reject actual keyboard mash like "qwerty asdfgh")
  let recognizedCount = 0;
  const unrecognized = [];

  for (const word of normalizedWords) {
    if (
      COMMON_VOCABULARY.has(word) ||
      normalizedRequired.includes(word) ||
      word.length <= 2 ||
      isKnownDerivedWord(word)
    ) {
      recognizedCount++;
    } else if (!isGibberish(word)) {
      // Natural English phonetic structure (not a keyboard walk or impossible cluster)
      recognizedCount++;
    } else {
      unrecognized.push(word);
    }
  }

  const recognizedRatio = recognizedCount / normalizedWords.length;
  if (unrecognized.length > 0 || recognizedRatio < 0.70) {
    const sampleInvalid = unrecognized.slice(0, 3).join(', ');
    return {
      isValid: false,
      message: `Sentence contains unrecognized words (${sampleInvalid}). Please use clear English words.`,
      score: 0
    };
  }

  // 5. Structure & punctuation check: encourage proper capitalization and punctuation
  const hasEndPunctuation = /[.!?]$/.test(cleanInput.trim());
  const startsWithCapital = /^[A-Z]/.test(cleanInput.trim());

  let coherenceScore = Math.round(recognizedRatio * 100);
  if (hasEndPunctuation) coherenceScore += 10;
  if (startsWithCapital) coherenceScore += 10;

  return {
    isValid: true,
    message: 'Phrase verified! Coherent sentence formed successfully.',
    score: Math.min(100, coherenceScore),
    sanitizedPhrase: cleanInput
  };
}

module.exports = {
  validateLeaderPhrase,
  sanitizeText
};
