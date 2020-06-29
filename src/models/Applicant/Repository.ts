import { Applicant, IApplicant, IApplicantEditable } from "./index";
import { ApplicantNotFound } from "./Errors/ApplicantNotFound";
import { Database } from "../../config/Database";
import { ApplicantCareersRepository } from "../ApplicantCareer/Repository";
import { ApplicantCapabilityRepository } from "../ApplicantCapability/Repository";
import { SectionRepository } from "./Section/Repository";
import { ApplicantLinkRepository } from "./Link";
import { UserRepository } from "../User/Repository";

export const ApplicantRepository = {
  create: (
    {
      padron,
      description,
      careers: applicantCareers = [],
      capabilities = [],
      user
    }: IApplicant
  ) => Database.transaction(async transaction => {
    const { uuid: userUuid } = await UserRepository.create(user, transaction);
    const applicant = await Applicant.create(
      { padron, description, userUuid: userUuid },
      { transaction }
    );
    await ApplicantCareersRepository.bulkCreate(applicantCareers, applicant, transaction);
    await ApplicantCapabilityRepository.update(capabilities, applicant, transaction);
    return applicant;
  }),
  findAll: async () => Applicant.findAll(),
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
  update: (
    {
      user: userAttributes = {},
      description,
      uuid,
      sections = [],
      links = [],
      capabilities: newCapabilities = [],
      careers = []
    }: IApplicantEditable
  ) => Database.transaction(async transaction => {
    const applicant = await ApplicantRepository.findByUuid(uuid);
    const user = await applicant.getUser();
    await applicant.set({ description });
    await UserRepository.update(user, userAttributes, transaction);
    await SectionRepository.update(sections, applicant, transaction);
    await ApplicantLinkRepository.update(links, applicant, transaction);
    await ApplicantCareersRepository.update(careers, applicant, transaction);
    await ApplicantCapabilityRepository.update(newCapabilities, applicant, transaction);
    await applicant.save({ transaction });
    return applicant;
  }),
  truncate: () => UserRepository.truncate()
};
