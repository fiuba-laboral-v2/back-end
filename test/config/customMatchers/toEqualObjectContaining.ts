export const toEqualObjectContaining = (received: object, expected: object) => {
  expect(received).toEqual(expect.objectContaining(expected));
  return { pass: true, message: () => "" };
};
