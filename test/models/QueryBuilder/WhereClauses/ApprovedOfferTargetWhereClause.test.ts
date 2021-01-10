import { ApprovedOfferTargetWhereClause } from "$models/QueryBuilder";
import MockDate from "mockdate";
import { Op } from "sequelize";
import { ApplicantType } from "$models/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";

describe("ApprovedOfferTargetWhereClause", () => {
  const date = `2020-12-04T16:57:07.333Z`;

  beforeEach(() => {
    MockDate.reset();
    MockDate.set(new Date(date));
  });

  it("returns undefined if no applicantType is provided", () => {
    const clause = ApprovedOfferTargetWhereClause.build({});
    expect(clause).toBeUndefined();
  });

  it("returns clause fo students", () => {
    const clause = ApprovedOfferTargetWhereClause.build({ applicantType: ApplicantType.student });
    expect(clause).toEqual({
      [Op.or]: [
        {
          [Op.and]: [
            { extensionApprovalStatus: ApprovalStatus.approved },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.student] } },
            { studentsExpirationDateTime: { [Op.gte]: new Date(date) } }
          ]
        }
      ]
    });
  });

  it("returns clause fo graduates", () => {
    const clause = ApprovedOfferTargetWhereClause.build({ applicantType: ApplicantType.graduate });
    expect(clause).toEqual({
      [Op.or]: [
        {
          [Op.and]: [
            { graduadosApprovalStatus: ApprovalStatus.approved },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.graduate] } },
            { graduatesExpirationDateTime: { [Op.gte]: new Date(date) } }
          ]
        }
      ]
    });
  });

  it("returns clause fo both students and graduates", () => {
    const clause = ApprovedOfferTargetWhereClause.build({ applicantType: ApplicantType.both });
    expect(clause).toEqual({
      [Op.or]: [
        {
          [Op.and]: [
            { extensionApprovalStatus: ApprovalStatus.approved },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.student] } },
            { studentsExpirationDateTime: { [Op.gte]: new Date(date) } }
          ]
        },
        {
          [Op.and]: [
            { graduadosApprovalStatus: ApprovalStatus.approved },
            { targetApplicantType: { [Op.in]: [ApplicantType.both, ApplicantType.graduate] } },
            { graduatesExpirationDateTime: { [Op.gte]: new Date(date) } }
          ]
        }
      ]
    });
  });
});
