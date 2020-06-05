import { IApplicantCareer } from "../../src/models/Applicant";
import { IExpressContext } from "../graphql/ExpressContext";

export interface IApplicantProps {
  careers?: IApplicantCareer [];
  capabilities?: string[];
  password?: string | null;
  expressContext?: IExpressContext;
}
