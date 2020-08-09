import { IApplicantCareer } from "$models/Applicant";
import { Admin } from "$models";
import { IExpressContext } from "../graphql/ExpressContext";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface ICompanyGeneratorAttributes {
  user?: { password?: string };
  photos?: string[];
}

export interface IApplicantGeneratorAttributes {
  careers?: IApplicantCareer [];
  capabilities?: string[];
  password?: string | null;
}

export interface IUserGeneratorAttributes {
  password?: string;
}

export interface ITestClientAttributes {
  expressContext?: IExpressContext;
}

interface ITestClientApprovalAttributes {
  approvalStatus: ApprovalStatus;
  admin: Admin;
}

interface ITestClientApprovalStatus {
  status?: ITestClientApprovalAttributes;
}

export interface IUserTestClientAttributes
  extends ITestClientAttributes, IUserGeneratorAttributes {
}

export interface ICompanyTestClientAttributes
  extends ITestClientAttributes, ICompanyGeneratorAttributes, ITestClientApprovalStatus {
}

export interface IApplicantTestClientAttributes
  extends ITestClientAttributes, IApplicantGeneratorAttributes, ITestClientApprovalStatus {
}
