import { GraphQLFormattedError } from "graphql";

export const toIncludeGraphQLErrorType = (
  received: ReadonlyArray<GraphQLFormattedError>,
  errorType: string
) => {
  const errorTypes = received.map(error => error.extensions!.data);
  expect(errorTypes).toEqual([{ errorType }]);
  return { pass: true, message: () => "" };
};
