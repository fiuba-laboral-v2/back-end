import { Transaction } from "sequelize";
import { IApplicantEditable, IFindLatest } from "./Interface";
import { ApplicantNotFound } from "./Errors";
import { Database } from "$config";
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
  findLatest: ({ updatedBeforeThan }: IFindLatest = {}) =>
    PaginationQuery.findLatest({ updatedBeforeThan, query: options => Applicant.findAll(options) }),
  findByUuid: async (uuid: string) => {
    const applicant = await Applicant.findByPk(uuid);
    if (!applicant) throw new ApplicantNotFound(uuid);

    return applicant;
  },
  findByUserUuidIfExists: async (userUuid: string) => Applicant.findOne({ where: { userUuid } }),
  findByUserUuid: async (userUuid: string) => {
    const applicant = await ApplicantRepository.findByUserUuidIfExists(userUuid);
    if (!applicant) throw new ApplicantNotFound(userUuid);

    return applicant;
  },
  findByPadron: async (padron: number) => {
    const applicant = await Applicant.findOne({ where: { padron } });
    if (!applicant) throw new ApplicantNotFound(padron);

    return applicant;
  },
  update: ({
    user: { name, surname, email } = {},
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
      if (name) user.name = name;
      if (surname) user.surname = surname;
      if (email) user.email = email;
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
