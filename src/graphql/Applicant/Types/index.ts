import { GraphQLApplicant } from "./GraphQLApplicant";
import { GraphQLCareerCredits } from "./CareerCredits";
import { GraphQLApplicantCareer } from "./ApplicantCareers";
import { GraphQLSectionInput, GraphQLSection } from "./Section";
import { GraphQLLinkInput, GraphQLLink } from "./Link";

export const applicantTypes = [
  GraphQLApplicant,
  GraphQLCareerCredits,
  GraphQLApplicantCareer,
  GraphQLSectionInput,
  GraphQLSection,
  GraphQLLinkInput,
  GraphQLLink
];
