import { CurrentUser } from "$models/CurrentUser";
import { client } from "$test/graphql/ApolloTestClient";
import { JWT } from "$src/JWT";
import { DocumentNode } from "graphql";
import { AuthConfig } from "$config/AuthConfig";

export const userTokenAssertions = {
  expectCookieToBeSet: async (expressContext: { res: { cookie: jest.Mock } }) => {
    expect(expressContext.res.cookie.mock.calls).toEqual([
      [AuthConfig.cookieName, expect.any(String), AuthConfig.cookieOptions]
    ]);
  },
  createExpressContext: () => ({ res: { cookie: jest.fn() } }),
  expectMutationToSetCookie: async ({ jwtTokenContents, mutation }: ITestToken) => {
    const expressContext = userTokenAssertions.createExpressContext();
    const apolloClient = client.loggedOut({ expressContext });
    const { errors } = await apolloClient.mutate({
      mutation: mutation.documentNode,
      variables: mutation.variables
    });
    expect(errors).toBeUndefined();
    await userTokenAssertions.expectCookieToBeSet(expressContext);
    const token: string = expressContext.res.cookie.mock.calls[0][1];
    expect(JWT.decodeToken(token)).toBeObjectContaining(jwtTokenContents);
  }
};

interface ITestToken {
  jwtTokenContents: CurrentUser;
  mutation: {
    documentNode: DocumentNode;
    variables: object;
  };
}
