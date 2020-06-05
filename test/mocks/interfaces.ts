import { IApplicantCareer } from "../../src/models/Applicant";
import { IExpressContext } from "../graphql/ExpressContext";

export interface IClientFactory {
  expressContext?: IExpressContext;
}

export interface IApplicantProps extends IClientFactory {
  careers?: IApplicantCareer [];
  capabilities?: string[];
  password?: string | null;
}
