import { IExpressContext } from "../graphql/ExpressContext";

export interface IClientFactory {
  expressContext?: IExpressContext;
}

export interface IUserProps extends IClientFactory {
  password?: string;
}
