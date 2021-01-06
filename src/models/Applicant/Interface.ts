import { TLink } from "./Link/Interface";
import { IUserEditable } from "../User";
import { IApplicantCareer } from "./ApplicantCareer";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IApplicantEditable {
  uuid: string;
  user?: IUserEditable;
  description?: string;
  careers?: IApplicantCareer[];
  capabilities?: string[];
  knowledgeSections?: ISection[];
  experienceSections?: ISection[];
  links?: TLink[];
}

export interface IFindLatest {
  updatedBeforeThan?: IPaginatedInput;
  name?: string;
  careerCodes?: string[];
  applicantType?: ApplicantType;
  noLimit?: boolean;
}

export interface ISection {
  uuid?: string;
  title: string;
  text: string;
  displayOrder: number;
}

export enum ApplicantType {
  graduate = "graduate",
  student = "student",
  both = "both"
}

export const targetApplicantTypeEnumValues = Object.keys(ApplicantType);
