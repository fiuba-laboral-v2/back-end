import { toBeAggregateError } from "./toBeAggregateError";
import { toBeAggregateErrorIncluding } from "./toBeAggregateErrorIncluding";
import { toBeBulkRecordError } from "./toBeBulkRecordError";
import { toThrowBulkRecordErrorIncluding } from "./toThrowBulkRecordErrorIncluding";
import { toThrowErrorWithMessage } from "./toThrowErrorWithMessage";
import { toBeSortedBy } from "./toBeSortedBy";
import { toEqualIgnoringSpacing } from "./toEqualIgnoringSpacing";
import { toEqualObjectContaining } from "./toEqualObjectContaining";

export const setupCustomMatchers = () =>
  expect.extend({
    toBeAggregateError,
    toBeAggregateErrorIncluding,
    toBeBulkRecordError,
    toThrowBulkRecordErrorIncluding,
    toThrowErrorWithMessage,
    toBeSortedBy,
    toEqualIgnoringSpacing,
    toEqualObjectContaining
  });
