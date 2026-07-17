export type PreferredLocalAITier = 'auto' | 'light' | 'standard' | 'pro';

export interface AISettingsPreferences {
  readonly preferredLocalAiTier: PreferredLocalAITier;
  readonly showUnavailableAiFeatures: boolean;
  readonly allowMetadataAuditLog: boolean;
  readonly updatedAt: string | null;
}

export interface AISettingsUpdate {
  readonly preferredLocalAiTier?: PreferredLocalAITier;
  readonly showUnavailableAiFeatures?: boolean;
  readonly allowMetadataAuditLog?: boolean;
}
