import { IOfferSection } from "./OfferSection/Interface";
import { IOfferCareer } from "./OfferCareer/Interface";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export enum ApplicantType {
  graduate = "graduate",
  student = "student",
  both = "both"
}

export const targetApplicantTypeEnumValues = Object.keys(ApplicantType);

export interface ICreateOffer {
  title: string;
  description: string;
  hoursPerDay: number;
  minimumSalary: number;
  maximumSalary: number;
  sections?: IOfferSection[];
  careers?: IOfferCareer[];
  companyUuid: string;
  targetApplicantType: ApplicantType;
}

export interface IUpdateOffer extends ICreateOffer {
  uuid: string;
}

export interface IOfferAttributes extends ICreateOffer {
  companyUuid: string;
}

export interface IOffer extends IUpdateOffer {
  companyUuid: string;
}

export interface IFindAll {
  updatedBeforeThan?: IPaginatedInput;
  companyUuid?: string;
  applicantType?: ApplicantType;
}
