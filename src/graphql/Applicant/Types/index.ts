import { GraphQLApplicant } from "./GraphQLApplicant";
import { GraphQLApplicantCareerInput } from "./GraphQLApplicantCareerInput";
import { GraphQLApplicantCareer } from "./GraphQLApplicantCareer";
import { applicantKnowledgeSectionTypes } from "./ApplicantKnowledgeSection";
import { applicantExperienceSectionTypes } from "./ApplicantExperienceSection";
import { GraphQLLinkInput, GraphQLLink } from "./Link";
import { GraphQLApplicantType } from "./GraphQLApplicantType";

export const applicantTypes = [
  GraphQLApplicant,
  GraphQLApplicantCareerInput,
  GraphQLApplicantCareer,
  ...applicantKnowledgeSectionTypes,
  ...applicantExperienceSectionTypes,
  GraphQLLinkInput,
  GraphQLLink,
  GraphQLApplicantType
];
