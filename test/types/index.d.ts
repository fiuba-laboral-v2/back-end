import { IExpected } from "../config/customMatchers/toBeAggregateErrorIncluding";

export {};

declare global {
  namespace jest {
    // tslint:disable-next-line:interface-name
    interface Matchers<R, T> {
      toBeAggregateError(): R;
      toBeAggregateErrorIncluding(expected: IExpected[]): R;
      toBeBulkRecordError(): R;
    }
  }
}
