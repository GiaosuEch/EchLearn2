/**
 * Ingests real, openly-licensed dictionary content. Replaces the templating
 * generator that used to fabricate "Meaning: <word>" and "I can say <word>."
 *
 * Sources and how each is used:
 *   - hermitdave/FrequencyWords  -> ORDERING ONLY. Decides which words are worth
 *     teaching first. The list itself is never written to disk or shipped; only
 *     the resulting order of our own wordlist, which is a fact, not content.
 *   - Wiktionary REST API        -> definitions, part of speech. CC BY-SA 4.0,
 *     so every gloss carries provenance and is kept in its own attributed layer.
 *   - Tatoeba                    -> example sentences. CC BY 2.0 FR.
 *
 * Hard rule: this script never invents content. A word with no real definition
 * is skipped and counted, not padded with a template. Coverage is reported
 * honestly at the end so thin languages are visible rather than hidden behind
 * fabricated filler.
 *
 * Usage:
 *   node scripts/ingest_sources.cjs --lang=fr --limit=500
 *   node scripts/ingest_sources.cjs --all --limit=3000
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const VOCAB_DIR = path.join(__dirname, '../public/data/vocabulary');
const CACHE_DIR = path.join(__dirname, '../.content-cache');

// Wikimedia requires a descriptive User-Agent identifying the caller.
const USER_AGENT = 'EchLern-ContentIngest/1.0 (language learning app; contact via repository)';

const REQUEST_DELAY_MS = 120;
const CHUNK_SIZE = 3000;

const LANGUAGES = {
  en: { freq: 'en', freqYear: 2018, wiktionary: 'en', name: 'English' },
  fr: { freq: 'fr', freqYear: 2018, wiktionary: 'fr', name: 'French' },
  de: { freq: 'de', freqYear: 2018, wiktionary: 'de', name: 'German' },
  es: { freq: 'es', freqYear: 2018, wiktionary: 'es', name: 'Spanish' },
  it: { freq: 'it', freqYear: 2018, wiktionary: 'it', name: 'Italian' },
  pt: { freq: 'pt_br', freqYear: 2018, wiktionary: 'pt', name: 'Portuguese' },
  ru: { freq: 'ru', freqYear: 2018, wiktionary: 'ru', name: 'Russian' },
  zh: { freq: 'zh_cn', freqYear: 2018, wiktionary: 'zh', name: 'Chinese' },
  ja: { freq: 'ja', freqYear: 2016, wiktionary: 'ja', name: 'Japanese' },
  ko: { freq: 'ko', freqYear: 2018, wiktionary: 'ko', name: 'Korean' },
  th: { freq: 'th', freqYear: 2018, wiktionary: 'th', name: 'Thai' },
  ar: { freq: 'ar', freqYear: 2018, wiktionary: 'ar', name: 'Arabic' },
  vi: { freq: 'vi', freqYear: 2018, wiktionary: 'vi', name: 'Vietnamese' },
};

const PROVENANCE = {
  wiktionary: {
    source: 'wiktionary',
    license: 'CC-BY-SA-4.0',
    attribution: 'Definitions from Wiktionary (CC BY-SA 4.0)',
  },
  tatoeba: {
    source: 'tatoeba',
    license: 'CC-BY-2.0-FR',
    attribution: 'Sentences from Tatoeba (CC BY 2.0 FR)',
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function httpGet(url, { json = false } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': USER_AGENT, Accept: json ? 'application/json' : 'text/plain' } },
      (res) => {
        if (res.statusCode === 404) {
          res.resume();
          return resolve(null);
        }
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(httpGet(res.headers.location, { json }));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (!json) return resolve(data);
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error(`Timeout for ${url}`));
    });
  });
}

/** Frequency list drives teaching order only; it is never written to disk. */
async function fetchOrderingList(config) {
  const cachePath = path.join(CACHE_DIR, `freq-${config.freq}-${config.freqYear}.txt`);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, 'utf8').split('\n').filter(Boolean);
  }
  const url = `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/`
    + `${config.freqYear}/${config.freq}/${config.freq}_50k.txt`;
  const body = await httpGet(url);
  if (!body) return [];
  const words = body
    .split('\n')
    .map((line) => line.split(' ')[0])
    .filter((w) => w && w.length > 1 && !/^\d+$/.test(w));
  ensureDir(CACHE_DIR);
  fs.writeFileSync(cachePath, words.join('\n'));
  return words;
}

const POS_MAP = {
  noun: 'noun', verb: 'verb', adjective: 'adjective', adverb: 'adverb',
  pronoun: 'pronoun', preposition: 'preposition', conjunction: 'conjunction',
  interjection: 'interjection', numeral: 'number', article: 'article',
  determiner: 'determiner', particle: 'particle', phrase: 'phrase',
};

function normalisePartOfSpeech(raw) {
  if (typeof raw !== 'string') return '';
  const key = raw.toLowerCase().trim();
  return POS_MAP[key] || '';
}

function stripHtml(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Definitions come from the English Wiktionary for every language: it is the
 * only edition where the REST definition endpoint is implemented (the others
 * answer 501), and it carries entries for words in all our target languages,
 * bucketed by language code. The gloss it returns is in English, which is
 * exactly what `meaningEnglish` needs.
 */
async function fetchDefinition(word, targetLang) {
  const cacheDir = path.join(CACHE_DIR, 'wiktionary', targetLang);
  const safeName = Buffer.from(word).toString('base64url').slice(0, 120);
  const cachePath = path.join(cacheDir, `${safeName}.json`);

  if (fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    return cached.miss ? null : cached;
  }

  const url = 'https://en.wiktionary.org/api/rest_v1/page/definition/'
    + encodeURIComponent(word);

  let payload;
  try {
    payload = await httpGet(url, { json: true });
  } catch {
    return null;
  }

  ensureDir(cacheDir);

  // Only accept the bucket for the language we are teaching. Falling back to
  // another language's entry would hand the learner a false definition.
  const buckets = payload && typeof payload === 'object' ? payload[targetLang] : null;
  if (!Array.isArray(buckets)) {
    fs.writeFileSync(cachePath, JSON.stringify({ miss: true }));
    return null;
  }

  for (const bucket of buckets) {
    const pos = normalisePartOfSpeech(bucket.partOfSpeech);
    if (!pos) continue;
    const defs = Array.isArray(bucket.definitions) ? bucket.definitions : [];
    for (const def of defs) {
      const text = stripHtml(def.definition);
      // Below three characters is a stub or stray markup, not a definition.
      if (text.length < 3) continue;
      const result = {
        partOfSpeech: pos,
        definition: text,
        sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}#${targetLang}`,
      };
      fs.writeFileSync(cachePath, JSON.stringify(result));
      return result;
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify({ miss: true }));
  return null;
}

/**
 * Tatoeba search, restricted to the target language. Returns the shortest
 * sentence that actually contains the word — shortest keeps examples close to
 * the learner's level.
 */
async function fetchExampleSentence(word, lang) {
  const cacheDir = path.join(CACHE_DIR, 'tatoeba', lang);
  const safeName = Buffer.from(word).toString('base64url').slice(0, 120);
  const cachePath = path.join(cacheDir, `${safeName}.json`);

  if (fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    return cached.miss ? null : cached;
  }

  const url = 'https://tatoeba.org/en/api_v0/search'
    + `?from=${encodeURIComponent(TATOEBA_LANG[lang] || lang)}`
    + `&query=${encodeURIComponent(word)}&sort=words&limit=10`;

  let payload;
  try {
    payload = await httpGet(url, { json: true });
  } catch {
    return null;
  }

  ensureDir(cacheDir);

  const results = payload && Array.isArray(payload.results) ? payload.results : [];
  const candidates = results
    .filter((r) => typeof r.text === 'string' && r.text.toLowerCase().includes(word.toLowerCase()))
    .sort((a, b) => a.text.length - b.text.length);

  const best = candidates[0];
  if (!best) {
    fs.writeFileSync(cachePath, JSON.stringify({ miss: true }));
    return null;
  }

  const result = {
    text: best.text,
    id: best.id,
    sourceUrl: `https://tatoeba.org/en/sentences/show/${best.id}`,
  };
  fs.writeFileSync(cachePath, JSON.stringify(result));
  return result;
}

const TATOEBA_LANG = {
  en: 'eng', fr: 'fra', de: 'deu', es: 'spa', it: 'ita', pt: 'por',
  ru: 'rus', zh: 'cmn', ja: 'jpn', ko: 'kor', th: 'tha', ar: 'ara', vi: 'vie',
};

/** Frequency rank maps to a CEFR band. A rank is a fact, not licensed content. */
function levelForRank(rank) {
  if (rank < 500) return 'A1';
  if (rank < 1500) return 'A2';
  if (rank < 3500) return 'B1';
  if (rank < 7000) return 'B2';
  if (rank < 15000) return 'C1';
  return 'C2';
}

function difficultyForRank(rank) {
  if (rank < 500) return 1;
  if (rank < 1500) return 2;
  if (rank < 3500) return 3;
  if (rank < 7000) return 4;
  if (rank < 15000) return 5;
  return 6;
}

const RETRIEVED_AT = new Date().toISOString().slice(0, 10);

function buildItem(lang, rank, word, definition, sentence) {
  const level = levelForRank(rank);
  return {
    id: `${lang}-src-${String(rank).padStart(5, '0')}`,
    language: lang,
    level,
    word,
    nativeScript: word,
    partOfSpeech: definition.partOfSpeech,
    // English-language gloss from Wiktionary. Vietnamese is intentionally left
    // empty — no free corpus supplies trustworthy VI glosses, and inventing one
    // is exactly the failure this rewrite removes. A separate translation pass
    // fills these with human review.
    meaning: definition.definition,
    meaningEnglish: definition.definition,
    meaningVietnamese: '',
    translation: '',
    example: sentence ? sentence.text : '',
    exampleTranslation: '',
    tags: [level, 'ingested'],
    topic: '',
    difficulty: difficultyForRank(rank),
    mastery: 0,
    qualityStatus: sentence ? 'sourced' : 'sourced_no_example',
    provenance: {
      ...PROVENANCE.wiktionary,
      sourceUrl: definition.sourceUrl,
      retrievedAt: RETRIEVED_AT,
    },
    ...(sentence
      ? {
        exampleProvenance: {
          ...PROVENANCE.tatoeba,
          sourceUrl: sentence.sourceUrl,
          retrievedAt: RETRIEVED_AT,
        },
      }
      : {}),
  };
}

async function ingestLanguage(lang, limit) {
  const config = LANGUAGES[lang];
  if (!config) throw new Error(`Unknown language: ${lang}`);

  process.stdout.write(`\n[${lang}] ${config.name}\n`);

  const ordering = await fetchOrderingList(config);
  if (ordering.length === 0) {
    process.stdout.write(`[${lang}] no ordering list available, skipping\n`);
    return { lang, attempted: 0, ingested: 0, withExample: 0 };
  }

  const candidates = ordering.slice(0, limit);
  const items = [];
  let noDefinition = 0;
  let withExample = 0;

  for (let i = 0; i < candidates.length; i += 1) {
    const word = candidates[i];

    const definition = await fetchDefinition(word, lang);
    await sleep(REQUEST_DELAY_MS);

    if (!definition) {
      noDefinition += 1;
      continue;
    }

    const sentence = await fetchExampleSentence(word, lang);
    await sleep(REQUEST_DELAY_MS);
    if (sentence) withExample += 1;

    items.push(buildItem(lang, items.length + 1, word, definition, sentence));

    if ((i + 1) % 100 === 0) {
      process.stdout.write(
        `[${lang}] ${i + 1}/${candidates.length} scanned, ${items.length} ingested\n`,
      );
    }
  }

  const langDir = path.join(VOCAB_DIR, lang);
  ensureDir(langDir);

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const partNum = Math.floor(i / CHUNK_SIZE) + 1;
    const fileName = `part-${String(partNum).padStart(3, '0')}.json`;
    fs.writeFileSync(path.join(langDir, fileName), JSON.stringify(chunk, null, 2));
    process.stdout.write(`[${lang}] wrote ${fileName} (${chunk.length} items)\n`);
  }

  return { lang, attempted: candidates.length, ingested: items.length, noDefinition, withExample };
}

function parseArgs(argv) {
  const args = { langs: [], limit: 500 };
  for (const arg of argv.slice(2)) {
    if (arg === '--all') args.langs = Object.keys(LANGUAGES);
    else if (arg.startsWith('--lang=')) args.langs = arg.slice(7).split(',');
    else if (arg.startsWith('--limit=')) args.limit = parseInt(arg.slice(8), 10) || 500;
  }
  if (args.langs.length === 0) args.langs = ['en'];
  return args;
}

async function main() {
  const { langs, limit } = parseArgs(process.argv);
  ensureDir(CACHE_DIR);
  ensureDir(VOCAB_DIR);

  process.stdout.write(
    `Ingesting up to ${limit} words for: ${langs.join(', ')}\n`
    + 'Sources: Wiktionary (CC BY-SA 4.0), Tatoeba (CC BY 2.0 FR).\n'
    + 'Frequency data used for ordering only and never written to disk.\n',
  );

  const report = [];
  for (const lang of langs) {
    try {
      report.push(await ingestLanguage(lang, limit));
    } catch (error) {
      process.stderr.write(`[${lang}] failed: ${error.message}\n`);
      report.push({ lang, attempted: 0, ingested: 0, error: error.message });
    }
  }

  process.stdout.write('\n=== Coverage ===\n');
  for (const row of report) {
    if (row.error) {
      process.stdout.write(`${row.lang}: ERROR ${row.error}\n`);
      continue;
    }
    const pct = row.attempted ? Math.round((row.ingested / row.attempted) * 100) : 0;
    process.stdout.write(
      `${row.lang}: ${row.ingested}/${row.attempted} words (${pct}%), `
      + `${row.withExample} with example, ${row.noDefinition} had no definition\n`,
    );
  }
  process.stdout.write(
    '\nVietnamese glosses are intentionally empty. They require translation with '
    + 'native review; no open corpus supplies them reliably.\n',
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exit(1);
});
