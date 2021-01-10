import { OfferStatusWhereClause } from "$models/QueryBuilder";
import { Op } from "sequelize";
import { OfferStatus } from "$models/Offer";
import { ApplicantType } from "$models/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";
import MockDate from "mockdate";

describe("OfferStatusWhereClause", () => {
  const date = `2020-12-04T16:57:07.333Z`;

  beforeEach(() => {
    MockDate.reset();
    MockDate.set(new Date(date));
  });

  it("returns undefined if no graduatesStatus and studentsStatus are provided", () => {
    const clause = OfferStatusWhereClause.build({});
    expect(clause).toBeUndefined();
  });

  it("returns a clause for students expired status", () => {
    const studentsStatus = OfferStatus.expired;
    const clause = OfferStatusWhereClause.build({ studentsStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { extensionApprovalStatus: ApprovalStatus.approved },
            { studentsExpirationDateTime: { [Op.lt]: new Date(date) } },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.student] } }
          ]
        }
      ]
    });
  });

  it("returns a clause for students approved status", () => {
    const studentsStatus = OfferStatus.approved;
    const clause = OfferStatusWhereClause.build({ studentsStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { extensionApprovalStatus: ApprovalStatus.approved },
            { studentsExpirationDateTime: { [Op.gte]: new Date(date) } },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.student] } }
          ]
        }
      ]
    });
  });

  it("returns a clause for students rejected status", () => {
    const studentsStatus = OfferStatus.rejected;
    const clause = OfferStatusWhereClause.build({ studentsStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { extensionApprovalStatus: ApprovalStatus.rejected },
            { studentsExpirationDateTime: null },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.student] } }
          ]
        }
      ]
    });
  });

  it("returns a clause for students pending status", () => {
    const studentsStatus = OfferStatus.pending;
    const clause = OfferStatusWhereClause.build({ studentsStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { extensionApprovalStatus: ApprovalStatus.pending },
            { studentsExpirationDateTime: null },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.student] } }
          ]
        }
      ]
    });
  });

  it("returns a clause for graduates expired status", () => {
    const graduatesStatus = OfferStatus.expired;
    const clause = OfferStatusWhereClause.build({ graduatesStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { graduadosApprovalStatus: ApprovalStatus.approved },
            { graduatesExpirationDateTime: { [Op.lt]: new Date(date) } },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.graduate] } }
          ]
        }
      ]
    });
  });

  it("returns a clause for graduates approved status", () => {
    const graduatesStatus = OfferStatus.approved;
    const clause = OfferStatusWhereClause.build({ graduatesStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { graduadosApprovalStatus: ApprovalStatus.approved },
            { graduatesExpirationDateTime: { [Op.gte]: new Date(date) } },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.graduate] } }
          ]
        }
      ]
    });
  });

  it("returns a clause for graduates rejected status", () => {
    const graduatesStatus = OfferStatus.rejected;
    const clause = OfferStatusWhereClause.build({ graduatesStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { graduadosApprovalStatus: ApprovalStatus.rejected },
            { graduatesExpirationDateTime: null },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.graduate] } }
          ]
        }
      ]
    });
  });

  it("returns a clause for graduates pending status", () => {
    const graduatesStatus = OfferStatus.pending;
    const clause = OfferStatusWhereClause.build({ graduatesStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { graduadosApprovalStatus: ApprovalStatus.pending },
            { graduatesExpirationDateTime: null },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.graduate] } }
          ]
        }
      ]
    });
  });

  it("returns a clause for graduates and students expired status", () => {
    const graduatesStatus = OfferStatus.expired;
    const studentsStatus = OfferStatus.expired;
    const clause = OfferStatusWhereClause.build({ graduatesStatus, studentsStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            { extensionApprovalStatus: ApprovalStatus.approved },
            { studentsExpirationDateTime: { [Op.lt]: new Date(date) } },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.student] } }
          ]
        },
        {
          [Op.and]: [
            { graduadosApprovalStatus: ApprovalStatus.approved },
            { graduatesExpirationDateTime: { [Op.lt]: new Date(date) } },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.graduate] } }
          ]
        }
      ]
    });
  });
});
