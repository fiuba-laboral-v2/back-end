import { IExpected } from "../config/customMatchers/toBeAggregateErrorIncluding";

export {};

declare global {
  namespace jest {
    // tslint:disable-next-line:interface-name
    interface Matchers<R, T> {
      toBeAggregateError(): R;
      toBeAggregateErrorIncluding(expected: IExpected[]): R;
      toBeBulkRecordError(): R;
      toThrowBulkRecordErrorIncluding(expected: IExpected[]): R;
      toThrowErrorWithMessage(type: Constructable, message: string | string[]): R;
    }
  }
}
