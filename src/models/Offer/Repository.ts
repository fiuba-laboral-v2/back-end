import { Database } from "$config";
import { Op } from "sequelize";

import { IFindAll, IOfferAssociations } from "./Interface";

import { IOfferSection, OfferSectionRepository } from "./OfferSection";
import { IOfferCareer } from "./OfferCareer";
import { OfferApprovalEventRepository } from "./OfferApprovalEvent/Repository";

import { ApplicantType } from "$models/Applicant";
import { ICreateOffer } from "$models/Offer/Interface";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { PaginationQuery } from "$models/PaginationQuery";
import { Offer, OfferCareer, OfferSection } from "$models";

import { OfferNotFoundError, OfferNotUpdatedError } from "./Errors";

export const OfferRepository = {
  create: ({ careers = [], sections = [], ...attributes }: ICreateOffer) => {
    const offer = new Offer(attributes);
    return OfferRepository.save(offer, sections, careers);
  },
  update: ({ sections, offer }: IOfferAssociations & { offer: Offer }) =>
    Database.transaction(async transaction => {
      await new OfferSectionRepository().update({ offer, sections, transaction });
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
      const offerAttributes = {
        ...(admin.secretary === Secretary.graduados && { graduadosApprovalStatus: status }),
        ...(admin.secretary === Secretary.extension && { extensionApprovalStatus: status })
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
  save: async (offer: Offer, sections: IOfferSection[], offersCareers: IOfferCareer[]) =>
    Database.transaction(async transaction => {
      await offer.save({ transaction });
      await Promise.all(
        sections.map(section =>
          OfferSection.create({ ...section, offerUuid: offer.uuid }, { transaction })
        )
      );
      await Promise.all(
        offersCareers.map(({ careerCode }) =>
          OfferCareer.create({ careerCode, offerUuid: offer.uuid }, { transaction })
        )
      );
      return offer;
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
