import { IApplicantCareer } from "$models/Applicant";
import { Admin } from "$models";
import { IExpressContext } from "../graphql/ExpressContext";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface IClientFactory {
  expressContext?: IExpressContext;
}

export interface IUserProps extends IClientFactory {
  password?: string;
}

interface ICompanyApproval {
  approvalStatus: ApprovalStatus;
  admin: Admin;
}

export interface ICompanyAttributes extends IClientFactory {
  status?: ICompanyApproval;
  user?: IUserProps;
  photos?: string[];
}

export interface IApplicantAttributes extends IClientFactory {
  status?: ICompanyApproval;
  careers?: IApplicantCareer [];
  capabilities?: string[];
  password?: string | null;
}
