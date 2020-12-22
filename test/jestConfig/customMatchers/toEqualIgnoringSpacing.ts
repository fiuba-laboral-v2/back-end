import { isEqual } from "lodash";

const formatString = (word: string) => word.replace(/\s/g, "");

const buildResponseMessage = (pass: boolean) => {
  const negation = pass ? "not" : "";
  return {
    pass,
    message: () => `Expected ${negation} to have the exact same characters`
  };
};

export const toEqualIgnoringSpacing = (received: string, expected: string) => {
  const receivedFormatted = formatString(received);
  const expectedFormatted = formatString(expected);
  expect(receivedFormatted).toEqual(expectedFormatted);
  return buildResponseMessage(isEqual(receivedFormatted, expectedFormatted));
};
