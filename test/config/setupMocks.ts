import { Logger } from "$libs/Logger";

export const setupMocks = () =>
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(Logger, "info").mockImplementation(jest.fn());
    jest.spyOn(Logger, "error").mockImplementation(jest.fn());
  });
