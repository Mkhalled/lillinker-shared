export const featureFlags = {
  enableDashboard: process.env.NODE_ENV === 'development',
} as const;

export type FeatureFlags = typeof featureFlags;
