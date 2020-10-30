import { GraphQLFormattedError } from "graphql";

export const toIncludeGraphQLErrorType = (
  received: ReadonlyArray<GraphQLFormattedError>,
  errorType: string
) => {
  expect(received![0].extensions!.data).toEqual({ errorType });
  return { pass: true, message: () => "" };
};
