export type ProductPackPublicationState = 'draft' | 'published';
export type ProductPackClaim = 'starter-foundations' | 'exam-preparation';
export type ProductPackContentDelivery = 'local-static';

export interface ProductPackManifest {
  id: string;
  version: string;
  publicationState: ProductPackPublicationState;
  language: string;
  title: string;
  audience: string;
  entitlement: 'standard';
  contentDelivery: ProductPackContentDelivery;
  claim: ProductPackClaim;
  disclosure: string;
  skills: readonly string[];
  routes: readonly string[];
}

const SEMVER = /^\d+\.\d+\.\d+$/u;

export function validateProductPackManifest(manifest: ProductPackManifest): string[] {
  const issues: string[] = [];
  if (!/^[a-z]{2}(?:-[a-z0-9]+)+$/u.test(manifest.id)) issues.push(`invalid pack id: ${manifest.id}`);
  if (!SEMVER.test(manifest.version)) issues.push(`invalid pack version: ${manifest.id}`);
  if (!manifest.title.trim() || !manifest.audience.trim() || !manifest.disclosure.trim()) issues.push(`missing pack metadata: ${manifest.id}`);
  if (manifest.contentDelivery !== 'local-static') issues.push(`unsupported content delivery: ${manifest.id}`);
  if (new Set(manifest.skills).size !== manifest.skills.length || manifest.skills.length === 0) issues.push(`invalid skills: ${manifest.id}`);
  if (new Set(manifest.routes).size !== manifest.routes.length || manifest.routes.some((route) => !route.startsWith('/app/'))) issues.push(`invalid routes: ${manifest.id}`);
  return issues;
}

