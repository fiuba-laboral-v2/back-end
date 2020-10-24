import { Database } from "$config";
import { Op } from "sequelize";

import { IFindAll, IOfferAssociations } from "./Interface";

import { OfferSectionRepository } from "./OfferSection";
import { OfferCareerRepository } from "./OfferCareer";
import { OfferApprovalEventRepository } from "./OfferApprovalEvent/Repository";

import { ApplicantType } from "$models/Applicant";
import { ICreateOffer } from "$models/Offer/Interface";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { PaginationQuery } from "$models/PaginationQuery";
import { Offer, OfferCareer } from "$models";

import { OfferNotFoundError, OfferNotUpdatedError } from "./Errors";
import moment from "moment";

const SECRETARY_EXPIRATION_DAYS_SETTING = 15;

export const OfferRepository = {
  create: ({ careers, sections, ...attributes }: ICreateOffer) =>
    Database.transaction(async transaction => {
      const offer = new Offer(attributes);
      await offer.save({ transaction });
      await OfferCareerRepository.bulkCreate({ careers, offer, transaction });
      await new OfferSectionRepository().update({ sections, offer, transaction });
      return offer;
    }),
  update: ({ careers, sections, offer }: IOfferAssociations & { offer: Offer }) =>
    Database.transaction(async transaction => {
      await new OfferSectionRepository().update({ offer, sections, transaction });
      await OfferCareerRepository.update({ careers, offer, transaction });
      return offer.save({ transaction });
    }),
  updateApprovalStatus: async ({
    uuid,
    admin,
    status
  }: {
    uuid: string;
    admin: {
      secretary: Secretary;
      userUuid: string;
    };
    status: ApprovalStatus;
  }) =>
    Database.transaction(async transaction => {
      const isExtension = secretary => secretary === Secretary.extension;
      const isApproved = chooseStatus => chooseStatus === ApprovalStatus.approved;

      const expirationDate = moment().startOf("day").add(SECRETARY_EXPIRATION_DAYS_SETTING, "days");

      const offerAttributes = {
        ...(!isExtension(admin.secretary) && {
          graduadosApprovalStatus: status,
          ...(isApproved(status) && { expirationDateForGraduados: expirationDate })
        }),
        ...(isExtension(admin.secretary) && {
          extensionApprovalStatus: status,
          ...(isApproved(status) && { expirationDateForExtension: expirationDate })
        }),
        ...(status === ApprovalStatus.approved && {})
      };

      const [, [updatedOffer]] = await Offer.update(offerAttributes, {
        where: { uuid },
        returning: true,
        transaction
      });
      if (!updatedOffer) throw new OfferNotUpdatedError(uuid);

      await OfferApprovalEventRepository.create({
        adminUserUuid: admin.userUuid,
        offer: updatedOffer,
        status: status,
        transaction
      });
      return updatedOffer;
    }),
  findByUuid: async (uuid: string) => {
    const offer = await Offer.findByPk(uuid);
    if (!offer) throw new OfferNotFoundError(uuid);

    return offer;
  },
  findAll: ({ updatedBeforeThan, companyUuid, applicantType, careerCodes }: IFindAll) => {
    const targetsBoth = applicantType === ApplicantType.both;
    const targetsStudents = targetsBoth || applicantType === ApplicantType.student;
    const targetsGraduates = targetsBoth || applicantType === ApplicantType.graduate;

    const approvalStatusWhereClause = applicantType && {
      [Op.or]: [
        targetsStudents && {
          [Op.and]: [
            { extensionApprovalStatus: ApprovalStatus.approved },
            {
              targetApplicantType: {
                [Op.in]: [ApplicantType.both, ApplicantType.student]
              }
            }
          ]
        },
        targetsGraduates && {
          [Op.and]: [
            { graduadosApprovalStatus: ApprovalStatus.approved },
            {
              targetApplicantType: {
                [Op.in]: [ApplicantType.both, ApplicantType.graduate]
              }
            }
          ]
        }
      ]
    };

    return PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Offer.findAll(options),
      where: {
        ...(companyUuid && { companyUuid }),
        ...approvalStatusWhereClause
      },
      ...(careerCodes && {
        include: [
          {
            model: OfferCareer,
            where: { careerCode: { [Op.in]: careerCodes } },
            attributes: []
          }
        ]
      })
    });
  },
  truncate: () => Offer.truncate({ cascade: true })
};
