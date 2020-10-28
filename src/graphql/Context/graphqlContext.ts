import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { CurrentUser } from "$models/CurrentUser";

export type IApolloServerContext = {
  currentUser: CurrentUser;
};

export type Context = Partial<IApolloServerContext> & ExpressContext;
