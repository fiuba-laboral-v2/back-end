import { equals } from "expect/build/jasmineUtils";

const buildResponseMessage = (pass: boolean) => {
  const negation = pass ? "not" : "";
  return {
    pass,
    message: () => `Expect ${negation} to equal object containing`
  };
};

export const toEqualObjectContaining = (received: object, expected: object) => {
  expect(received).toEqual(expect.objectContaining(expected));
  return buildResponseMessage(equals(received, expect.objectContaining(expected)));
};
