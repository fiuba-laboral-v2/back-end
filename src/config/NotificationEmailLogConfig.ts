import { Environment } from "$config/Environment";

export const NotificationEmailLogConfig = {
  production: {
    cleanupTimeThresholdInMonths: () => 3
  },
  staging: {
    cleanupTimeThresholdInMonths: () => 3
  },
  development: {
    cleanupTimeThresholdInMonths: () => 3
  },
  test: {
    cleanupTimeThresholdInMonths: () => 90
  }
}[Environment.NODE_ENV()];
