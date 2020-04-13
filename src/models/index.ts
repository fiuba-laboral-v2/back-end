import { Applicant } from "./Applicant";
import { Section } from "./Applicant/Section";
import { ApplicantLink } from "./Applicant/Link";
import { JobApplication } from "./JobApplication";
import { Career } from "./Career";
import { CareerApplicant } from "./CareerApplicant";
import { Capability } from "./Capability";
import { ApplicantCapability } from "./ApplicantCapability";
import { Company } from "./Company";
import { CompanyPhoneNumber } from "./CompanyPhoneNumber";
import { CompanyPhoto } from "./CompanyPhoto";
import { Offer } from "./Offer";
import { OfferSection } from "./Offer/OfferSection";
import { OfferCareer } from "./Offer/OfferCareer";
import { User } from "./User";

const models = [
  Applicant,
  Section,
  ApplicantLink,
  JobApplication,
  Career,
  CareerApplicant,
  Capability,
  ApplicantCapability,
  Company,
  CompanyPhoneNumber,
  CompanyPhoto,
  Offer,
  OfferSection,
  OfferCareer,
  User
];

export { models };
