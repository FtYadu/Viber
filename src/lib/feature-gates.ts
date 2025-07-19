import { AppSetting, User } from '@prisma/client';

export interface FeatureConfig {
  payment: boolean;
  email: boolean;
  storage: boolean;
  ai: boolean;
  dns: boolean;
  monitoring: boolean;
}

type SettingItem = {
  key: string;
  value: string;
} | AppSetting;

/**
 * Check if a feature is configured based on app settings
 */
export function isFeatureConfigured(
  feature: keyof FeatureConfig,
  settings: SettingItem[]
): boolean {
  const requiredKeys: Record<keyof FeatureConfig, string[]> = {
    payment: ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    email: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'],
    storage: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET'],
    ai: ['OPENAI_API_KEY'],
    dns: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ZONE_ID'],
    monitoring: ['SENTRY_DSN'],
  };

  const required = requiredKeys[feature];
  return required.every(key => 
    settings.some(setting => {
      const settingKey = 'key' in setting ? setting.key : setting.settingKey;
      const settingValue = 'value' in setting ? setting.value : setting.settingValue;
      return settingKey === key && settingValue;
    })
  );
}

/**
 * Get configuration status for all features
 */
export function getFeatureStatus(settings: SettingItem[]): FeatureConfig {
  return {
    payment: isFeatureConfigured('payment', settings),
    email: isFeatureConfigured('email', settings),
    storage: isFeatureConfigured('storage', settings),
    ai: isFeatureConfigured('ai', settings),
    dns: isFeatureConfigured('dns', settings),
    monitoring: isFeatureConfigured('monitoring', settings),
  };
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  feature: keyof FeatureConfig,
  user: User & { appSettings: AppSetting[] }
): boolean {
  // Admin users always have access
  if (user.role === 'ADMIN') {
    return true;
  }

  // Check if feature is configured
  return isFeatureConfigured(feature, user.appSettings);
}

/**
 * Get missing configuration keys for a feature
 */
export function getMissingKeys(
  feature: keyof FeatureConfig,
  settings: SettingItem[]
): string[] {
  const requiredKeys: Record<keyof FeatureConfig, string[]> = {
    payment: ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    email: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'],
    storage: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET'],
    ai: ['OPENAI_API_KEY'],
    dns: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ZONE_ID'],
    monitoring: ['SENTRY_DSN'],
  };

  const required = requiredKeys[feature];
  const configured = settings.map(s => 'key' in s ? s.key : s.settingKey);
  
  return required.filter(key => !configured.includes(key));
}

/**
 * Calculate setup completion percentage
 */
export function getSetupProgress(settings: SettingItem[]): number {
  const features = getFeatureStatus(settings);
  const total = Object.keys(features).length;
  const configured = Object.values(features).filter(Boolean).length;
  
  return Math.round((configured / total) * 100);
}
