import { Transaction } from "sequelize";
import { IFindLatest, IFind, ApplicantType } from "./Interface";
import { ApplicantNotFound } from "./Errors";
import { Applicant } from "..";
import { PaginationQuery } from "../PaginationQuery";
import {
  UsersIncludeClauseBuilder,
  ApplicantCareersIncludeClauseBuilder
} from "$models/QueryBuilder";
import { Includeable } from "sequelize/types/lib/model";
import { ApprovalStatus } from "$models/ApprovalStatus";

export const ApplicantRepository = {
  save: (applicant: Applicant, transaction?: Transaction) => applicant.save({ transaction }),
  find: (filter: IFind = {}) => {
    const include: Includeable[] = [];
    const userFilter = UsersIncludeClauseBuilder.build(filter);
    const applicantCareers = ApplicantCareersIncludeClauseBuilder.build(filter);
    if (userFilter) include.push(userFilter);
    if (applicantCareers) include.push(applicantCareers);
    return Applicant.findAll({ include });
  },
  findLatest: ({ updatedBeforeThan, ...filter }: IFindLatest = {}) => {
    const include: Includeable[] = [];
    const userFilter = UsersIncludeClauseBuilder.build(filter);
    const applicantCareersFilter = ApplicantCareersIncludeClauseBuilder.build(filter);
    if (userFilter) include.push(userFilter);
    if (applicantCareersFilter) include.push(applicantCareersFilter);
    return PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Applicant.findAll(options),
      include
    });
  },
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
  countStudents: () => {
    const applicantCareersFilter = ApplicantCareersIncludeClauseBuilder.build({
      applicantType: ApplicantType.student
    });
    return Applicant.count({
      where: {
        approvalStatus: ApprovalStatus.approved
      },
      include: [applicantCareersFilter!]
    });
  },
  countGraduates: () => {
    const applicantCareersFilter = ApplicantCareersIncludeClauseBuilder.build({
      applicantType: ApplicantType.graduate
    });
    return Applicant.count({
      where: {
        approvalStatus: ApprovalStatus.approved
      },
      include: [applicantCareersFilter!]
    });
  },
  truncate: () => Applicant.truncate({ cascade: true })
};
