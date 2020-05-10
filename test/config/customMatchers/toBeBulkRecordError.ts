import BulkRecordError from "sequelize/lib/errors/bulk-record-error";
import { AggregateError } from "bluebird";

export const toBeBulkRecordError = (aggregateError: AggregateError) => {
  let isBulkError = {
    pass: true,
    message: () => `Expected ${aggregateError} not to be instanceof BulkRecordError`
  };
  aggregateError.forEach(bulkError => {
    if (bulkError instanceof BulkRecordError) return;
    isBulkError = {
      pass: false,
      message: () => `Expected ${bulkError} to be instanceof BulkRecordError`
    };
  });
  return isBulkError;
};
