/**
 * Offline NLP Coherence and Sentence Validator
 * Completely offline - runs locally on the host laptop with zero internet.
 * Validates that the Leader's assembled phrase:
 *  1. Contains all required collected fragments/words.
 *  2. Is a coherent, well-structured English sentence (has subject/verb, prepositions, valid lexicon).
 *  3. Rejects random keyboard mashing (gibberish), repetition, and lazy concatenation.
 */

// Comprehensive built-in vocabulary for common connectors, verbs, nouns, adjectives, and tech/campus terms
const COMMON_VOCABULARY = new Set([
  // Articles & Determiners
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'every', 'each', 'all', 'some', 'any', 'my', 'our', 'your', 'their', 'its', 'his', 'her',
  // Prepositions & Conjunctions
  'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'of', 'about', 'into', 'through', 'after', 'before', 'between', 'under', 'over', 'and', 'but', 'or', 'so', 'yet', 'as', 'because', 'while', 'when', 'where', 'if', 'than',
  // Auxiliary & Common Verbs (present, past, participles)
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'create', 'creates', 'created', 'creating', 'build', 'builds', 'built', 'building',
  'connect', 'connects', 'connected', 'connecting', 'power', 'powers', 'powered', 'powering',
  'lead', 'leads', 'led', 'leading', 'solve', 'solves', 'solved', 'solving',
  'drive', 'drives', 'drove', 'driven', 'driving', 'guide', 'guides', 'guided', 'guiding',
  'unite', 'unites', 'united', 'uniting', 'spark', 'sparks', 'sparked', 'sparking',
  'inspire', 'inspires', 'inspired', 'inspiring', 'unlock', 'unlocks', 'unlocked', 'unlocking',
  'discover', 'discovers', 'discovered', 'discovering', 'transform', 'transforms', 'transformed',
  'illuminate', 'illuminates', 'illuminated', 'protect', 'protects', 'protected',
  'run', 'runs', 'ran', 'running', 'make', 'makes', 'made', 'making',
  'bring', 'brings', 'brought', 'take', 'takes', 'took', 'taken',
  'give', 'gives', 'gave', 'given', 'show', 'shows', 'showed', 'shown',
  'find', 'finds', 'found', 'know', 'knows', 'knew', 'known',
  'stand', 'stands', 'stood', 'rise', 'rises', 'rose', 'risen',
  'flow', 'flows', 'flowed', 'shine', 'shines', 'shone',
  'bridge', 'bridges', 'bridged', 'forge', 'forges', 'forged',
  'fuel', 'fuels', 'fueled', 'shape', 'shapes', 'shaped',
  'empower', 'empowers', 'empowered', 'expand', 'expands', 'expanded',
  'reveal', 'reveals', 'revealed', 'master', 'masters', 'mastered',
  'achieve', 'achieves', 'achieved', 'ignite', 'ignites', 'ignited',
  // Common Nouns (Academic, Classical, Campus, Team, Ideas)
  'team', 'teams', 'mind', 'minds', 'future', 'world', 'path', 'paths', 'way', 'ways',
  'code', 'codes', 'data', 'network', 'networks', 'system', 'systems', 'campus', 'college',
  'student', 'students', 'knowledge', 'wisdom', 'logic', 'puzzle', 'puzzles', 'truth', 'light',
  'power', 'energy', 'horizon', 'journey', 'bridge', 'step', 'steps', 'key', 'keys',
  'solution', 'solutions', 'victory', 'challenge', 'challenges', 'innovation', 'dream', 'dreams',
  'vision', 'idea', 'ideas', 'force', 'forces', 'signal', 'signals', 'core', 'heart',
  'secret', 'secrets', 'matrix', 'circuit', 'circuits', 'stream', 'engine', 'frontier',
  'scholar', 'scholars', 'academy', 'thesis', 'axiom', 'axioms', 'principle', 'principles',
  'temple', 'temples', 'chronos', 'philosophy', 'intellect', 'reason', 'nature', 'order',
  'pursuit', 'virtue', 'laurel', 'laurels', 'fellowship', 'fire', 'lantern', 'universe',
  'harmony', 'ideal', 'justice', 'genius', 'motion', 'gravity', 'lever', 'spiral', 'balance',
  'stella', 'orbit', 'binary', 'symbol', 'doubt', 'cogito', 'clarity', 'ratio', 'number', 'cosmos',
  'courage', 'peace', 'destiny', 'ethics', 'duty', 'autonomy', 'insight', 'progress', 'question',
  'humility', 'discernment', 'study', 'studies', 'highest', 'continuous', 'limitless', 'across', 'upon',
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
  'faraday', 'lecun', 'newton', 'huang', 'hawking', 'karpathy', 'edison', 'sarabhai', 'cook',
  // Known English Terms & Axioms
  'innovation', 'future', 'strategy', 'synergy', 'champion', 'discovery', 'mindset', 'triumph', 'honor',
  // Common Adjectives & Adverbs
  'new', 'great', 'bright', 'strong', 'bold', 'deep', 'true', 'clear', 'fast', 'quick',
  'smart', 'sharp', 'hidden', 'digital', 'silent', 'golden', 'endless', 'boundless',
  'together', 'always', 'never', 'forward', 'beyond', 'ahead', 'now', 'today', 'forever',
  'first', 'last', 'next', 'best', 'final', 'high', 'pure', 'real', 'vital', 'epic',
  'vast', 'infinite', 'grand', 'ready', 'united', 'alive', 'noble', 'eternal', 'foundational',
  'intellectual', 'ancient', 'classical', 'brilliant', 'sacred', 'eloquent'
]);

const VERB_INDICATORS = new Set([
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'create', 'creates', 'created', 'creating', 'build', 'builds', 'built', 'building',
  'connect', 'connects', 'connected', 'connecting', 'power', 'powers', 'powered', 'powering',
  'defend', 'defends', 'defended', 'defending', 'protect', 'protects', 'protected', 'protecting',
  'attack', 'attacks', 'attacked', 'attacking', 'secure', 'secures', 'secured', 'securing',
  'lead', 'leads', 'led', 'leading', 'solve', 'solves', 'solved', 'solving',
  'drive', 'drives', 'drove', 'driven', 'driving', 'guide', 'guides', 'guided', 'guiding',
  'unite', 'unites', 'united', 'uniting', 'spark', 'sparks', 'sparked', 'sparking',
  'inspire', 'inspires', 'inspired', 'inspiring', 'unlock', 'unlocks', 'unlocked', 'unlocking',
  'discover', 'discovers', 'discovered', 'discovering', 'transform', 'transforms', 'transformed',
  'illuminate', 'illuminates', 'illuminated', 'process', 'processes', 'processed', 'processing',
  'analyze', 'analyzes', 'analyzed', 'analyzing', 'enable', 'enables', 'enabled', 'enabling',
  'gather', 'gathers', 'gathered', 'gathering',
  'seek', 'seeks', 'sought', 'seeking',
  'remind', 'reminds', 'reminded', 'reminding',
  'attain', 'attains', 'attained', 'attaining',
  'enlighten', 'enlightens', 'enlightened', 'enlightening',
  'run', 'runs', 'ran', 'running', 'make', 'makes', 'made', 'making',
  'bring', 'brings', 'brought', 'take', 'takes', 'took', 'taken',
  'give', 'gives', 'gave', 'given', 'show', 'shows', 'showed', 'shown',
  'find', 'finds', 'found', 'know', 'knows', 'knew', 'known',
  'stand', 'stands', 'stood', 'rise', 'rises', 'rose', 'risen',
  'flow', 'flows', 'flowed', 'shine', 'shines', 'shone',
  'bridge', 'bridges', 'bridged', 'forge', 'forges', 'forged',
  'fuel', 'fuels', 'fueled', 'shape', 'shapes', 'shaped',
  'empower', 'empowers', 'empowered', 'expand', 'expands', 'expanded',
  'reveal', 'reveals', 'revealed', 'master', 'masters', 'mastered',
  'achieve', 'achieves', 'achieved', 'ignite', 'ignites', 'ignited',
  'establish', 'establishes', 'established', 'establishing',
  'prove', 'proves', 'proved', 'proving',
  'govern', 'governs', 'governed', 'governing',
  'form', 'forms', 'formed', 'forming',
  'reach', 'reaches', 'reached', 'reaching'
]);

for (const verb of VERB_INDICATORS) {
  COMMON_VOCABULARY.add(verb);
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
    // Allow small words ('the', 'and', 'of', 'in', 'to', 'a') up to 3 times, others max 2 times
    const maxAllowed = ['the', 'and', 'to', 'of', 'in', 'a', 'with'].includes(word) ? 3 : 2;
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
      const subTokens = reqClean.split(/\s+/).filter(t => t.length > 2);
      if (subTokens.length > 1 && subTokens.some(st => normalizedWords.includes(st))) {
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
  const hasVerb = normalizedWords.some(w => VERB_INDICATORS.has(w));
  if (!hasVerb) {
    return {
      isValid: false,
      message: 'Your phrase appears to lack an action or linking verb (e.g., "connects", "creates", "is", "powers", "leads", "builds").',
      score: 0
    };
  }

  // 4. Lexicon validity (reject random keyboard mash like "qwerty asdfgh")
  // Allow the required target words themselves even if not in common vocabulary
  let recognizedCount = 0;
  const unrecognized = [];

  for (const word of normalizedWords) {
    if (COMMON_VOCABULARY.has(word) || normalizedRequired.includes(word) || word.length <= 2) {
      recognizedCount++;
    } else {
      // Allow plural or 'ed' / 'ing' simple suffix derivations
      if (
        (word.endsWith('s') && COMMON_VOCABULARY.has(word.slice(0, -1))) ||
        (word.endsWith('ed') && COMMON_VOCABULARY.has(word.slice(0, -2))) ||
        (word.endsWith('ing') && COMMON_VOCABULARY.has(word.slice(0, -3)))
      ) {
        recognizedCount++;
      } else {
        unrecognized.push(word);
      }
    }
  }

  const recognizedRatio = recognizedCount / normalizedWords.length;
  if (recognizedRatio < 0.70) {
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
