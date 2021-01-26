import { Environment } from "$config/Environment";

export const CleanupConfig = {
  production: {
    thresholdInMonths: () => 3
  },
  staging: {
    thresholdInMonths: () => 3
  },
  development: {
    thresholdInMonths: () => 3
  },
  test: {
    thresholdInMonths: () => 90
  }
}[Environment.NODE_ENV()];
