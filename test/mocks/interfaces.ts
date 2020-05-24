import { IApplicantCareer } from "../../src/models/Applicant";

export interface IApplicantProps {
  careers?: IApplicantCareer [];
  capabilities?: string[];
  password?: string | null;
}
