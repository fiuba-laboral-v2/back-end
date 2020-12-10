import { EmailServiceConfig } from "$config";

describe("EmailServiceConfig", () => {
  it("return an interval of numbers in seconds", () => {
    const retryIntervalsInSeconds = EmailServiceConfig.retryIntervalsInSeconds();
    expect(retryIntervalsInSeconds).toEqual([10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120]);
  });
});
