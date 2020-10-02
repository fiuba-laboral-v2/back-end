import { times } from "lodash";

export const EmailServiceConfig = {
  retryIntervalsInSeconds: () => {
    let interval = 5;
    const multiplier = 2;
    return times(10, () => (interval *= multiplier));
  }
};
