import { Transaction } from "sequelize";
import { IApplicantEditable, ISaveApplicant } from "./index";
import { ApplicantNotFound } from "./Errors";
import { Database } from "$config";
import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";
import { ApplicantCareersRepository } from "./ApplicantCareer";
import { ApplicantCapabilityRepository } from "../ApplicantCapability";
import { ApplicantKnowledgeSectionRepository } from "./ApplicantKnowledgeSection";
import { ApplicantExperienceSectionRepository } from "./ApplicantExperienceSection";
import { ApplicantLinkRepository } from "./Link";
import { UserRepository } from "../User";
import { Applicant } from "..";
import { PaginationQuery } from "../PaginationQuery";

export const ApplicantRepository = {
  save: (applicant: Applicant, transaction?: Transaction) => applicant.save({ transaction }),
  create: ({
    padron,
    description,
    careers: applicantCareers = [],
    capabilities = [],
    user
  }: ISaveApplicant) =>
    Database.transaction(async transaction => {
      const { uuid: userUuid } = await UserRepository.createFiubaUser(user, transaction);
      const applicant = await Applicant.create(
        { padron, description, userUuid: userUuid },
        { transaction }
      );
      await ApplicantCareersRepository.bulkCreate(applicantCareers, applicant, transaction);
      await ApplicantCapabilityRepository.update(capabilities, applicant, transaction);
      return applicant;
    }),
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Applicant.findAll(options)
    }),
  findByUuid: async (uuid: string) => {
    const applicant = await Applicant.findByPk(uuid);
    if (!applicant) throw new ApplicantNotFound(uuid);

    return applicant;
  },
  findByPadron: async (padron: number) => {
    const applicant = await Applicant.findOne({ where: { padron } });
    if (!applicant) throw new ApplicantNotFound(padron);

    return applicant;
  },
  update: ({
    user: userAttributes = {},
    description,
    uuid,
    knowledgeSections = [],
    experienceSections = [],
    links = [],
    capabilities: newCapabilities = [],
    careers = []
  }: IApplicantEditable) =>
    Database.transaction(async transaction => {
      const applicant = await ApplicantRepository.findByUuid(uuid);
      const user = await applicant.getUser();
      await applicant.set({ description });
      await UserRepository.update(user, userAttributes, transaction);
      await new ApplicantKnowledgeSectionRepository().update({
        sections: knowledgeSections,
        applicant,
        transaction
      });
      await new ApplicantExperienceSectionRepository().update({
        sections: experienceSections,
        applicant,
        transaction
      });
      await ApplicantLinkRepository.update(links, applicant, transaction);
      await ApplicantCareersRepository.update(careers, applicant, transaction);
      await ApplicantCapabilityRepository.update(newCapabilities, applicant, transaction);
      await applicant.save({ transaction });
      return applicant;
    }),
  truncate: () => Applicant.truncate({ cascade: true })
};
