import { times } from "lodash";

export const EmailServiceConfig = {
  url: () => "https://services.fi.uba.ar/misc.php",
  retryIntervalsInSeconds: () => {
    let interval = 5;
    const multiplier = 2;
    return times(10, () => (interval *= multiplier));
  }
};
