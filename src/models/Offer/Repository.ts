import { Database } from "$config";
import { PaginationConfig } from "$config/PaginationConfig";
import { Op } from "sequelize";
import { IFindAll, IOffer, TargetApplicantType } from "./Interface";
import { ICreateOffer } from "$models/Offer/Interface";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IOfferSection } from "./OfferSection";
import { IOfferCareer } from "./OfferCareer";
import { OfferApprovalEventRepository } from "./OfferApprovalEvent/Repository";
import { Secretary } from "$models/Admin";
import { OfferNotFound, OfferNotUpdatedError } from "./Errors";
import { Offer, OfferCareer, OfferSection } from "$models";

export const OfferRepository = {
  create: ({ careers = [], sections = [], ...attributes }: ICreateOffer) => {
    const offer = new Offer(attributes);
    return OfferRepository.save(offer, sections, careers);
  },
  update: async (offer: IOffer & { uuid: string }) => {
    const [, [updatedOffer]] = await Offer.update(
      {
        extensionApprovalStatus: ApprovalStatus.pending,
        graduadosApprovalStatus: ApprovalStatus.pending,
        ...offer
      },
      {
        where: { uuid: offer.uuid },
        returning: true
      }
    );
    if (!updatedOffer) throw new OfferNotUpdatedError(offer.uuid);
    return updatedOffer;
  },
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
    if (!offer) throw new OfferNotFound(uuid);

    return offer;
  },
  findAll: async ({ updatedBeforeThan, companyUuid, applicantType }: IFindAll) => {
    const limit = PaginationConfig.itemsPerPage() + 1;
    const updatedBeforeThanWhereClause: any = updatedBeforeThan && {
      [Op.or]: [
        {
          updatedAt: {
            [Op.lt]: updatedBeforeThan.dateTime.toISOString()
          }
        },
        {
          updatedAt: updatedBeforeThan.dateTime.toISOString(),
          uuid: {
            [Op.lt]: updatedBeforeThan.uuid
          }
        }
      ]
    };
    const targetsBoth = applicantType === TargetApplicantType.both;
    const targetsStudents = targetsBoth || applicantType === TargetApplicantType.student;
    const targetsGraduates = targetsBoth || applicantType === TargetApplicantType.graduate;

    const targetApplicantTypeWhereClause = applicantType && {
      [Op.or]: [
        targetsStudents && {
          [Op.and]: [
            { extensionApprovalStatus: ApprovalStatus.approved },
            {
              targetApplicantType: {
                [Op.in]: [TargetApplicantType.both, TargetApplicantType.student]
              }
            }
          ]
        },
        targetsGraduates && {
          [Op.and]: [
            { graduadosApprovalStatus: ApprovalStatus.approved },
            {
              targetApplicantType: {
                [Op.in]: [TargetApplicantType.both, TargetApplicantType.graduate]
              }
            }
          ]
        }
      ]
    };
    const whereClause = {
      [Op.and]: [
        updatedBeforeThanWhereClause,
        companyUuid && { companyUuid },
        targetApplicantTypeWhereClause
      ].filter(clause => !!clause)
    };
    const shouldHaveWhereClause = updatedBeforeThan || companyUuid || applicantType;
    const result = await Offer.findAll({
      ...(shouldHaveWhereClause && { where: whereClause }),
      order: [
        ["updatedAt", "DESC"],
        ["uuid", "DESC"]
      ],
      limit
    });
    return {
      shouldFetchMore: result.length === limit,
      results: result.slice(0, limit - 1)
    };
  },
  truncate: () => Offer.truncate({ cascade: true })
};
