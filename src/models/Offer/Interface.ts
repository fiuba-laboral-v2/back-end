import { IOfferSection } from "./OfferSection/Interface";
import { IOfferCareer } from "./OfferCareer/Interface";

export interface IOffer {
  companyId: number;
  title: string;
  description: string;
  hoursPerDay: number;
  minimumSalary: number;
  maximumSalary: number;
  sections?: IOfferSection[];
  careers?: IOfferCareer[];
}
