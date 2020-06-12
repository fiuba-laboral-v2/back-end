import { IApplicantCareer } from "../../src/models/Applicant";
import { IExpressContext } from "../graphql/ExpressContext";

export interface IClientFactory {
  expressContext?: IExpressContext;
}

export interface IUserProps extends IClientFactory {
  password?: string;
}

export interface IAdminProps extends IClientFactory {
  user?: IUserProps;
}

export interface ICompanyProps extends IClientFactory {
  user?: IUserProps;
  photos?: string[];
}

export interface IApplicantProps extends IClientFactory {
  careers?: IApplicantCareer [];
  capabilities?: string[];
  password?: string | null;
}
