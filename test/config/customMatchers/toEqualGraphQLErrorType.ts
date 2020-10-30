import { GraphQLFormattedError } from "graphql";

export const toEqualGraphQLErrorType = (
  received: ReadonlyArray<GraphQLFormattedError>,
  errorType: string
) => {
  expect(received.map(error => error.extensions!.data)).toEqual([{ errorType }]);
  return { pass: true, message: () => "" };
};
