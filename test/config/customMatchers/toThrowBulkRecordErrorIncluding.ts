import { toBeAggregateErrorIncluding, IExpected } from "./toBeAggregateErrorIncluding";

export const toThrowBulkRecordErrorIncluding = (received, expected: IExpected[]) => {
  return toBeAggregateErrorIncluding(received, expected);
};
