import { toBeAggregateError } from "./customMatchers/toBeAggregateError";
import { toBeAggregateErrorIncluding } from "./customMatchers/toBeAggregateErrorIncluding";
import { toBeBulkRecordError } from "./customMatchers/toBeBulkRecordError";
import { toThrowBulkRecordErrorIncluding } from "./customMatchers/toThrowBulkRecordErrorIncluding";
import { toThrowErrorWithMessage } from "./customMatchers/toThrowErrorWithMessage";
import { toBeSortedBy } from "./customMatchers/toBeSortedBy";
import { toEqualIgnoringSpacing } from "./customMatchers/toEqualIgnoringSpacing";

expect.extend({
  toBeAggregateError,
  toBeAggregateErrorIncluding,
  toBeBulkRecordError,
  toThrowBulkRecordErrorIncluding,
  toThrowErrorWithMessage,
  toBeSortedBy,
  toEqualIgnoringSpacing
});
