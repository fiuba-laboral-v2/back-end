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
import { User, UserRepository } from "../User";
import { Applicant } from "..";
import { PaginationQuery } from "../PaginationQuery";
import { FiubaCredentials } from "$models/User/Credentials";

export const ApplicantRepository = {
  save: (applicant: Applicant, transaction?: Transaction) => applicant.save({ transaction }),
  create: ({
    padron,
    description,
    careers: applicantCareers = [],
    capabilities = [],
    user: { name, surname, email, password, dni }
  }: ISaveApplicant) =>
    Database.transaction(async transaction => {
      const credentials = new FiubaCredentials(dni);
      const user = new User({ name, surname, email, credentials });
      await user.credentials.authenticate(password);
      await UserRepository.save(user, transaction);
      const applicant = await Applicant.create(
        { padron, description, userUuid: user.uuid! },
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
  findByUserUuidIfExists: async (userUuid: string) => Applicant.findOne({ where: { userUuid } }),
  findByUserUuid: async (userUuid: string) => {
    const applicant = await Applicant.findOne({ where: { userUuid } });
    if (!applicant) throw new ApplicantNotFound(userUuid);

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
      await applicant.set({ description });
      const user = await UserRepository.findByUuid(applicant.userUuid);
      if (userAttributes.name) user.name = userAttributes.name;
      if (userAttributes.surname) user.surname = userAttributes.surname!;
      if (userAttributes.email) user.email = userAttributes.email!;
      await UserRepository.save(user, transaction);
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
