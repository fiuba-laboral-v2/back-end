import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { IAdminUser } from "./AdminContext";
import { ICompanyUser } from "./CompanyContext";
import { IApplicantUser } from "./ApplicantContext";

export interface IUser {
  uuid: string;
  email: string;
  admin?: undefined;
  company?: undefined;
  applicant?: undefined;
}

export type ICurrentUser = IAdminUser | IApplicantUser | ICompanyUser | IUser;

export type IApolloServerContext = {
  currentUser: ICurrentUser;
};

export type Context = (IApolloServerContext | object) & ExpressContext;
