import { ExpressContext } from "apollo-server-express/dist/ApolloServer";

export interface IUser {
  uuid: string;
  email: string;
  companyUuid?: undefined;
  applicantUuid?: undefined;
}

export interface IApplicantUser {
  uuid: string;
  email: string;
  applicantUuid: string;
  companyUuid?: undefined;
}

export interface ICompanyUser {
  uuid: string;
  email: string;
  companyUuid: string;
  applicantUuid?: undefined;
}

export type ICurrentUser = IApplicantUser | ICompanyUser | IUser;

export type IApolloServerContext = {
  currentUser: ICurrentUser;
};

export type Context = (IApolloServerContext | object) & ExpressContext;
