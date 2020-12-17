import { UserSequelizeModel } from "$models";
import { CurrentUserBuilder } from "$models/CurrentUser";
import { IExpressContext } from "$test/graphql/ExpressContext";
import { client } from "$test/graphql/ApolloTestClient";

export const createApolloTestClient = (
  user: UserSequelizeModel,
  expressContext?: IExpressContext,
  entityContext?: object
) =>
  client.loggedIn({
    currentUser: CurrentUserBuilder.build({
      uuid: user.uuid!,
      email: user.email,
      ...entityContext
    }),
    expressContext
  });
