/**
 * Licences we are permitted to ship inside the product.
 *
 * A corpus is only usable here if it is (a) redistributable, (b) usable
 * commercially, and (c) verifiable — we keep the source URL so any claim can be
 * checked years later. Anything not on this list fails
 * `scripts/audit_vocab_quality.cjs` and never reaches a build.
 *
 * "Free to read on the internet" is NOT a licence. Sources without an explicit
 * grant are listed in DENIED_SOURCES with the reason, so the decision is not
 * silently relitigated.
 */

export interface LicenseTerms {
  /** SPDX-style identifier used in content `provenance.license`. */
  id: string;
  name: string;
  url: string;
  /** Credit that must be rendered wherever the content appears. */
  requiresAttribution: boolean;
  /**
   * True when derivative text must be released under the same licence.
   * Content under a share-alike licence must stay in a clearly demarcated,
   * attributed layer — it may not be blended into proprietary text.
   */
  shareAlike: boolean;
}

export const ALLOWED_LICENSES: Record<string, LicenseTerms> = {
  'CC0-1.0': {
    id: 'CC0-1.0',
    name: 'Creative Commons Zero v1.0 Universal',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    requiresAttribution: false,
    shareAlike: false,
  },
  'CC-BY-2.0-FR': {
    id: 'CC-BY-2.0-FR',
    name: 'Creative Commons Attribution 2.0 France',
    url: 'https://creativecommons.org/licenses/by/2.0/fr/',
    requiresAttribution: true,
    shareAlike: false,
  },
  'CC-BY-4.0': {
    id: 'CC-BY-4.0',
    name: 'Creative Commons Attribution 4.0 International',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    requiresAttribution: true,
    shareAlike: false,
  },
  'CC-BY-SA-4.0': {
    id: 'CC-BY-SA-4.0',
    name: 'Creative Commons Attribution-ShareAlike 4.0 International',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    requiresAttribution: true,
    shareAlike: true,
  },
  'CC-BY-SA-3.0': {
    id: 'CC-BY-SA-3.0',
    name: 'Creative Commons Attribution-ShareAlike 3.0 Unported',
    url: 'https://creativecommons.org/licenses/by-sa/3.0/',
    requiresAttribution: true,
    shareAlike: true,
  },
  'PUBLIC-DOMAIN': {
    id: 'PUBLIC-DOMAIN',
    name: 'Public domain',
    url: 'https://en.wikipedia.org/wiki/Public_domain',
    requiresAttribution: false,
    shareAlike: false,
  },
  /** Content written by this project. No external terms apply. */
  PROPRIETARY: {
    id: 'PROPRIETARY',
    name: 'Authored for EchLern',
    url: '',
    requiresAttribution: false,
    shareAlike: false,
  },
};

export interface CorpusSource {
  id: string;
  name: string;
  homepage: string;
  license: string;
  attribution: string;
  /** How a per-entry deep link is built, for verification. */
  entryUrlPattern?: string;
  notes?: string;
}

export const CORPUS_SOURCES: Record<string, CorpusSource> = {
  tatoeba: {
    id: 'tatoeba',
    name: 'Tatoeba',
    homepage: 'https://tatoeba.org',
    license: 'CC-BY-2.0-FR',
    attribution: 'Sentences from Tatoeba (CC BY 2.0 FR)',
    entryUrlPattern: 'https://tatoeba.org/en/sentences/show/{id}',
    notes: 'Example sentences with translations. Not share-alike, so it may sit '
      + 'alongside proprietary text. Audio has per-contributor licences and is '
      + 'excluded from ingestion.',
  },
  wiktionary: {
    id: 'wiktionary',
    name: 'Wiktionary (via Wiktextract / kaikki.org)',
    homepage: 'https://kaikki.org',
    license: 'CC-BY-SA-4.0',
    attribution: 'Definitions from Wiktionary (CC BY-SA 4.0)',
    entryUrlPattern: 'https://{lang}.wiktionary.org/wiki/{word}',
    notes: 'SHARE-ALIKE. Definition text must stay in an attributed layer and '
      + 'must not be merged into proprietary glosses. Facts extracted from the '
      + 'same dump (IPA, part of speech, inflections) are not copyrightable and '
      + 'carry no share-alike obligation.',
  },
  authored: {
    id: 'authored',
    name: 'EchLern authored content',
    homepage: '',
    license: 'PROPRIETARY',
    attribution: '',
    notes: 'Hand-written by the project. Vietnamese glosses live here.',
  },
};

/**
 * Sources deliberately rejected, with the reason. Kept in code so the decision
 * survives staff turnover and is not quietly reversed.
 */
export const DENIED_SOURCES: { id: string; reason: string }[] = [
  {
    id: 'opensubtitles',
    reason: 'OPUS publishes no licence statement for OpenSubtitles, and the '
      + 'underlying subtitles are user-uploaded derivatives of copyrighted films. '
      + 'Frequency counts derived from it are used internally for ordering only; '
      + 'no sentence from this corpus is shipped.',
  },
  {
    id: 'common-voice',
    reason: 'Historically CC0, but since October 2025 distribution moved to the '
      + 'Mozilla Data Collective with paid/conditional access. Current terms are '
      + 'unverified. Re-verify before any use.',
  },
  {
    id: 'oxford-3000',
    reason: 'Proprietary to Oxford University Press. No open licence exists.',
  },
  {
    id: 'english-vocabulary-profile',
    reason: 'Free to view but not redistributable.',
  },
  {
    id: 'social-media',
    reason: 'Facebook, Instagram, TikTok and YouTube all prohibit scraping in '
      + 'their terms. Users retain copyright in their posts and platform licences '
      + 'are not sublicensable to us. YouTube may be embedded via the IFrame '
      + 'player, never ingested.',
  },
];

export function isAllowedLicense(license: unknown): boolean {
  return typeof license === 'string' && Object.hasOwn(ALLOWED_LICENSES, license);
}

export function requiresAttribution(license: string): boolean {
  return ALLOWED_LICENSES[license]?.requiresAttribution ?? false;
}

export function isShareAlike(license: string): boolean {
  return ALLOWED_LICENSES[license]?.shareAlike ?? false;
}

/** Credit line for a licence, or empty when none is required. */
export function attributionFor(sourceId: string): string {
  return CORPUS_SOURCES[sourceId]?.attribution ?? '';
}
