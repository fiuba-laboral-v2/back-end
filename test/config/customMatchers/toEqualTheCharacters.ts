import { isEqual } from "lodash";

const formatString = (word: string) =>
  word.replace(/\s/g, "").toLowerCase().split("").sort();

const buildResponseMessage = (pass: boolean) => {
  const negation = pass ? "" : "not";
  return {
    pass,
    message: () => `Expected ${negation} to have the exact same characters`
  };
};

export const toEqualTheCharacters = (received: string, expected: string) => {
  const receivedFormatted = formatString(received);
  const expectedFormatted = formatString(expected);
  if (isEqual(receivedFormatted, expectedFormatted)) return buildResponseMessage(true);
  return buildResponseMessage(false);
};
