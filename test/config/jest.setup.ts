import { toBeAggregateError } from "./customMatchers/toBeAggregateError";
import { toBeAggregateErrorIncluding } from "./customMatchers/toBeAggregateErrorIncluding";
import { toBeBulkRecordError } from "./customMatchers/toBeBulkRecordError";
import { toThrowBulkRecordErrorIncluding } from "./customMatchers/toThrowBulkRecordErrorIncluding";
import { toThrowErrorWithMessage } from "./customMatchers/toThrowErrorWithMessage";

expect.extend({
  toBeAggregateError,
  toBeAggregateErrorIncluding,
  toBeBulkRecordError,
  toThrowBulkRecordErrorIncluding,
  toThrowErrorWithMessage
});
