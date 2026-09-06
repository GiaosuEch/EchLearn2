import { ExternalLink } from 'lucide-react';
import type { ContentProvenance } from '../../services/vocabularyService';
import { ALLOWED_LICENSES, requiresAttribution } from '../../services/contentLicenses';

interface ContentAttributionProps {
  /** Provenance blocks to credit. Entries without one are skipped. */
  sources: (ContentProvenance | undefined)[];
  className?: string;
}

/**
 * Renders the credit line that CC BY and CC BY-SA oblige us to display wherever
 * the content appears. Licences that require no attribution render nothing, so
 * this can be dropped beside any content without conditional wrapping.
 *
 * Duplicate sources are collapsed: a lesson drawing twenty Tatoeba sentences
 * shows one Tatoeba credit, not twenty.
 */
export function ContentAttribution({ sources, className = '' }: ContentAttributionProps) {
  const credits = new Map<string, { label: string; licenseUrl: string; sourceUrl?: string }>();

  for (const provenance of sources) {
    if (!provenance || !requiresAttribution(provenance.license)) continue;
    const terms = ALLOWED_LICENSES[provenance.license];
    if (!terms) continue;
    const label = provenance.attribution || `${provenance.source} (${terms.name})`;
    if (!credits.has(label)) {
      credits.set(label, {
        label,
        licenseUrl: terms.url,
        sourceUrl: provenance.sourceUrl,
      });
    }
  }

  if (credits.size === 0) return null;

  return (
    <div className={`text-[11px] leading-relaxed text-dark-500 ${className}`}>
      {Array.from(credits.values()).map((credit) => (
        <div key={credit.label} className="flex flex-wrap items-center gap-x-1.5">
          <span>{credit.label}</span>
          {credit.sourceUrl && (
            <a
              href={credit.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-0.5 underline hover:text-dark-300 transition-colors"
            >
              nguồn
              <ExternalLink size={10} aria-hidden="true" />
            </a>
          )}
          <a
            href={credit.licenseUrl}
            target="_blank"
            rel="noopener noreferrer nofollow license"
            className="underline hover:text-dark-300 transition-colors"
          >
            giấy phép
          </a>
        </div>
      ))}
    </div>
  );
}

export default ContentAttribution;
