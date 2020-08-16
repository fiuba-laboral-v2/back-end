import { Constructable } from "../../types/Constructable";

const failMessage = (received, type: Constructable, message: string | string[]) => ({
  pass: false,
  message: () =>
    `Expected ${received} to be instanceof ${type.name}` +
    "\n" +
    `Expected message: ${received.message} to include ${message}`,
});

const passMessage = (received, type: Constructable, message: string | string[]) => ({
  pass: true,
  message: () =>
    `Expected ${received} not to be instanceof ${type.name}` +
    "\n" +
    `Expected message: ${received.message} not to include ${message}`,
});

const includesMessage = (receivedMessage: string, expectedMessage: string | string[]) => {
  if (typeof expectedMessage === "string") return receivedMessage.includes(expectedMessage);
  return expectedMessage.filter(message => receivedMessage.includes(message)).length > 0;
};

const expectToThrow = (received, type: Constructable, message: string | string[]) => {
  if (received instanceof type && includesMessage(received.message, message)) {
    return passMessage(received, type, message);
  }
  return failMessage(received, type, message);
};

export const toThrowErrorWithMessage = (
  received,
  type: Constructable,
  message: string | string[]
) => {
  if (typeof received === "object") return expectToThrow(received, type, message);
  if (typeof received === "function") {
    try {
      received();
    } catch (error) {
      return expectToThrow(error, type, message);
    }
  }
  return failMessage(received, type, message);
};
