import { GraphQLFormattedError } from "graphql";

export const toIncludeGraphQLErrorType = (
  received: ReadonlyArray<GraphQLFormattedError>,
  errorType: string
) => {
  expect(received.map(error => error.extensions!.data)).toEqual([{ errorType }]);
  return { pass: true, message: () => "" };
};
