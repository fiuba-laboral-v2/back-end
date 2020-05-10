import { toBeAggregateError } from "./customMatchers/toBeAggregateError";
import { toBeAggregateErrorIncluding } from "./customMatchers/toBeAggregateErrorIncluding";
import { toBeBulkRecordError } from "./customMatchers/toBeBulkRecordError";

expect.extend({
  toBeAggregateError,
  toBeAggregateErrorIncluding,
  toBeBulkRecordError
});
