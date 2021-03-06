import { IOfferSection } from "./OfferSection/Interface";
import { IOfferCareer } from "./OfferCareer/Interface";
import { ApplicantType } from "$models/Applicant";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface ICreateOffer extends IOfferAssociations {
  title: string;
  description: string;
  hoursPerDay: number;
  isInternship: boolean;
  minimumSalary: number;
  maximumSalary?: number;
  companyUuid: string;
  targetApplicantType: ApplicantType;
}

export interface IOfferAssociations {
  sections: IOfferSection[];
  careers: IOfferCareer[];
}

export interface IUpdateOffer extends ICreateOffer {
  uuid: string;
}

export interface IOfferAttributes extends ICreateOffer {
  companyUuid: string;
  graduatesExpirationDateTime?: Date | null;
  studentsExpirationDateTime?: Date | null;
}

export interface IFindAll {
  updatedBeforeThan?: IPaginatedInput;
  companyUuid?: string;
  applicantType?: ApplicantType;
  companyName?: string;
  businessSector?: string;
  title?: string;
  studentsStatus?: OfferStatus;
  graduatesStatus?: OfferStatus;
  careerCodes?: string[];
}

export interface IFindLatestByCompany {
  updatedBeforeThan?: IPaginatedInput;
  companyUuid: string;
  statuses?: OfferStatus[];
}

export enum OfferStatus {
  expired = "expired",
  pending = "pending",
  approved = "approved",
  rejected = "rejected"
}
