const formatString = (word: string) => word.replace(/\s/g, "");

export const toEqualIgnoringSpacing = (received: string, expected: string) => {
  const receivedFormatted = formatString(received);
  const expectedFormatted = formatString(expected);
  expect(receivedFormatted).toEqual(expectedFormatted);
  return { pass: true, message: () => "" };
};
