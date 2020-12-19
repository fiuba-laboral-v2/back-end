import { IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { IExpressContext } from "../graphql/ExpressContext";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";

export interface IAdminGeneratorAttributes extends IUserGeneratorAttributes {
  secretary: Secretary;
}

export interface ICompanyGeneratorAttributes {
  user?: { password?: string };
  photos?: string[];
}

export interface IApplicantGeneratorAttributes {
  careers?: IApplicantCareer[];
  capabilities?: string[];
  password?: string | null;
}

export interface IUserGeneratorAttributes {
  password?: string;
  dni?: string;
}

export interface ITestClientAttributes {
  expressContext?: IExpressContext;
}

interface ITestClientApprovalStatus {
  status?: ApprovalStatus;
}

export interface IUserTestClientAttributes
  extends ITestClientAttributes,
    IUserGeneratorAttributes {}

export interface IAdminTestClientAttributes
  extends ITestClientAttributes,
    IAdminGeneratorAttributes {}

export interface ICompanyTestClientAttributes
  extends ITestClientAttributes,
    ICompanyGeneratorAttributes,
    ITestClientApprovalStatus {}

export interface IApplicantTestClientAttributes
  extends ITestClientAttributes,
    IApplicantGeneratorAttributes,
    ITestClientApprovalStatus {}
