import { Applicant } from "./Applicant";
import { Section } from "./Applicant/Section";
import { ApplicantLink } from "./Applicant/Link";
import { Career } from "./Career";
import { CareerApplicant } from "./CareerApplicant";
import { Capability } from "./Capability";
import { ApplicantCapability } from "./ApplicantCapability";
import { Company } from "./Company";
import { Offer } from "./Offer";
import { OfferSection } from "./Offer/OfferSection";
import { CompanyPhoneNumber } from "./CompanyPhoneNumber";
import { CompanyPhoto } from "./CompanyPhoto";
import { User } from "./User";

const models = [
  Applicant,
  Section,
  ApplicantLink,
  Career,
  CareerApplicant,
  Capability,
  ApplicantCapability,
  Company,
  Offer,
  OfferSection,
  CompanyPhoneNumber,
  CompanyPhoto,
  User
];

export { models };
