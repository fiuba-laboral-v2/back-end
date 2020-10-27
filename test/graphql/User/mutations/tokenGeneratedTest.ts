import { CurrentUser } from "$models/CurrentUser";
import { client } from "$test/graphql/ApolloTestClient";
import { JWT } from "$src/JWT";
import { DocumentNode } from "graphql";
import { AuthConfig } from "$config/AuthConfig";

export const tokenGeneratedTest = {
  expectCookieToBeSet: async (expressContext: { res: { cookie: jest.Mock } }) => {
    expect(expressContext.res.cookie.mock.calls).toEqual([
      [AuthConfig.cookieName, expect.any(String), AuthConfig.cookieOptions]
    ]);
  },
  createExpressContext: () => ({ res: { cookie: jest.fn() } }),
  testToken: async ({ variables, result, documentNode }: ITestToken) => {
    const expressContext = tokenGeneratedTest.createExpressContext();
    const apolloClient = client.loggedOut({ expressContext });
    const { errors } = await apolloClient.mutate({
      mutation: documentNode,
      variables
    });
    expect(errors).toBeUndefined();
    await tokenGeneratedTest.expectCookieToBeSet(expressContext);
    const token: string = expressContext.res.cookie.mock.calls[0][1];
    expect(JWT.decodeToken(token)).toBeObjectContaining(result);
  }
};

interface ITestToken {
  variables: object;
  result: CurrentUser;
  documentNode: DocumentNode;
}
