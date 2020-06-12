import { ExpressContext } from "apollo-server-express/dist/ApolloServer";

export interface IUser {
  uuid: string;
  email: string;
  adminUuid?: undefined;
  companyUuid?: undefined;
  applicantUuid?: undefined;
}

export interface IAdminUser {
  uuid: string;
  email: string;
  adminUuid: string;
  companyUuid?: undefined;
  applicantUuid?: undefined;
}

export interface IApplicantUser {
  uuid: string;
  email: string;
  adminUuid?: undefined;
  applicantUuid: string;
  companyUuid?: undefined;
}

export interface ICompanyUser {
  uuid: string;
  email: string;
  adminUuid?: undefined;
  companyUuid: string;
  applicantUuid?: undefined;
}

export type ICurrentUser = IAdminUser | IApplicantUser | ICompanyUser | IUser;

export type IApolloServerContext = {
  currentUser: ICurrentUser;
};

export type Context = (IApolloServerContext | object) & ExpressContext;
