import { AggregateError } from "bluebird";

export const toBeAggregateError = received => {
  if (!(received instanceof AggregateError)) {
    return {
      pass: false,
      message: () => `Expected ${received} to be instanceof AggregateError`,
    };
  }
  return {
    pass: true,
    message: () => `Expected ${received} not to be instanceof AggregateError`,
  };
};
