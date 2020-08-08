import { IApplicantCareer } from "$models/Applicant";
import { Admin } from "$models";
import { IExpressContext } from "../graphql/ExpressContext";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface ITestClientAttributes {
  expressContext?: IExpressContext;
}

interface ITestClientApprovalAttributes {
  approvalStatus: ApprovalStatus;
  admin: Admin;
}

export interface IUserTestClientAttributes extends ITestClientAttributes {
  password?: string;
}

export interface ICompanyTestClientAttributes extends ITestClientAttributes {
  status?: ITestClientApprovalAttributes;
  user?: { password?: string };
  photos?: string[];
}

export interface IApplicantTestClientAttributes extends ITestClientAttributes {
  status?: ITestClientApprovalAttributes;
  careers?: IApplicantCareer [];
  capabilities?: string[];
  password?: string | null;
}
